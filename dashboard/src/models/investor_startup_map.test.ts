import assert from "node:assert/strict";
import test from "node:test";

test("getStartupsForInvestor returns every mapped startup", async () => {
  const { getStartupsForInvestor } = await import("./investor_startup_map");
  const startups = await getStartupsForInvestor("1");

  assert.equal(startups.length, 2);
  assert.deepEqual(
    startups.map((startup) => startup.name),
    ["HelioFusion", "Quantum Forge"]
  );
  assert.deepEqual(
    startups.map((startup) => startup.rating),
    [2.4, 3.1]
  );
});
