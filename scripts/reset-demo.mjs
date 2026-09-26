import { rmSync } from "node:fs";
import { join } from "node:path";
// Stop the development server before resetting the local demo database.
const path = join(
  process.env.DEMO_DATA_DIR || join(process.cwd(), ".data"),
  "demo.json",
);
rmSync(path, { force: true });
console.log(
  "Demo data reset. The next API request will recreate the sample workspace.",
);
