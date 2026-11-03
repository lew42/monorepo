/* Writes public/framework/core/Role/roles.json from the ROLES rows (the pages read it; run after editing roles.js). `--check` exits 1 when it is stale. */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { ROLES } from "./roles.js";
import Role from "../../public/framework/core/Role/Role.js";

const file = fileURLToPath(new URL("../../public/framework/core/Role/roles.json", import.meta.url));
const text = JSON.stringify(Role.from_rows(ROLES), null, "\t") + "\n";
if (process.argv.includes("--check")) process.exit(fs.existsSync(file) && fs.readFileSync(file, "utf8") === text ? 0 : 1);
fs.writeFileSync(file, text);
console.log(`wrote ${file}`);
