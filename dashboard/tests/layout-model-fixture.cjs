// The legacy model unit test specifies a two-row portfolio, whereas the
// shared browser fixture now contains three. Keep its exact contract isolated
// without changing the test assertions or contacting a real database.
const { db, ids } = require("./local-db.cjs");
db.public.none(
  `DELETE FROM investor_startup_map WHERE fund_id=1 AND startup_id NOT IN (${ids.helio}, ${ids.quantum})`
);
