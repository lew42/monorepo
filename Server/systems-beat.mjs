/* systems-beat.mjs — one heartbeat cycle of the organizational systems (public/framework/ext/System/).
 * Skips (exit 0, says so) when usage is over pace; otherwise runs every System check and appends
 * the results to results.jsonl. Run hourly by the system-architect (doc: ai/doc/organization.md).
 * No model, no fixes yet: report only. */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
if (spawnSync(process.execPath, ["Server/usage-now.mjs"]).status === 2){ console.log("over pace: skipped this cycle"); process.exit(0); }
const { default: Systems } = await import("../public/framework/ext/System/Systems.js");
for (const r of await Systems.run()) console.log(`${r.system}: ${r.count ? r.count + " finding(s)" : "healthy"}`);
