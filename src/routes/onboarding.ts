import express, { Router } from "express";
import { getStartupById } from "../models/startup";
import { PreviousVenture, insertTrackRecord } from "../models/users";

const router: Router = express.Router();

router.get("/", async (req, res) => {
  let newStartup;
  const startupId = req.user?.startup;

  if (startupId == undefined) {
    throw new Error("Failed to fetch startup id.");
  }

  try {
    newStartup = await getStartupById(startupId);
  } catch (e) {
    throw new Error("Failed to fetch startup from database.");
  }

  res.render("submit/track_record", {
    layout: "../views/layouts/onboarding.ejs",
    title: req.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
    startupName: newStartup.name,
    founder: req.user?.firstName + " " + req.user?.lastName,
  });
});

router.post("/track-record", async (req, res) => {
  const { expertise, ventures } = req.body.trackRecord;

  try {
    if (req.user?.id == undefined) {
      throw new Error("Failed use read user_id");
    }

    const userId = req.user?.id;
    const previousVenture: PreviousVenture[] = ventures;

    await insertTrackRecord(userId, expertise, previousVenture);
    res.redirect(`/startup/${req.user?.startup}`);
  } catch (error) {
    console.log(error); // TODO:
  }
});

export default router;
