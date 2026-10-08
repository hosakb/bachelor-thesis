import { NextFunction, Request, Response, Router } from "express";

type Handler = (req: Request, res: Response, next: NextFunction) => unknown;

interface Layer {
  handle: Handler;
  route?: { stack: Layer[] };
}

// Express 4 does not observe rejected promises from async handlers. A thrown
// error inside an async route therefore became an unhandled rejection, which
// leaves the request hanging and terminates the Node process. This wraps
// every request handler registered on the router so rejections are passed to
// Express' error handling via next(err). Error handlers (4 arguments) are
// left untouched.
export function forwardAsyncErrors(router: Router): Router {
  for (const layer of router.stack as Layer[]) {
    const layers = layer.route ? layer.route.stack : [layer];
    for (const routeLayer of layers) {
      const original = routeLayer.handle;
      if (original.length >= 4) {
        continue;
      }
      routeLayer.handle = function (
        req: Request,
        res: Response,
        next: NextFunction
      ) {
        try {
          const result = original.call(this, req, res, next);
          if (
            result &&
            typeof (result as Promise<unknown>).catch === "function"
          ) {
            (result as Promise<unknown>).catch(next);
          }
        } catch (error) {
          next(error);
        }
      };
    }
  }
  return router;
}

// Final error handler: logs the failure and answers with a generic 500 rather
// than leaking stack traces or leaving the request open.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`Request ${req.method} ${req.originalUrl} failed: ${err}`);
  if (res.headersSent) {
    return next(err);
  }
  if (req.accepts(["html", "json"]) === "json" || req.is("application/json")) {
    return res.status(500).json({ error: "Something went wrong." });
  }
  res.status(500).send("Something went wrong. Please go back and try again.");
}
