/* usage-now.mjs — the ONE way an agent checks Claude usage: node Server/usage-now.mjs
 * Reads public/framework/ai/usage.json (Servex refreshes it every 15 min). Only if that file is older
 * than 5 minutes does it re-run the usage script (one caller at a time, via a lock), so many masterminds
 * can ask often without hammering the endpoint (it answers 429). Prints the pace line, then a detail line; exit code 2 = over pace.
 * Pace = weekly % used vs % of the week gone. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { usage_pace, report_line } from "./UsagePace.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(ROOT, "public/framework/ai/usage.json"), LOCK = path.join(os.tmpdir(), "lew42-usage.lock");
const MAX_AGE_MS = 5 * 60 * 1000;
const age = () => { try { return Date.now() - fs.statSync(FILE).mtimeMs; } catch { return Infinity; } };

if (age() > MAX_AGE_MS){
	let locked = false;
	try { locked = Date.now() - fs.statSync(LOCK).mtimeMs < 60000; } catch {}
	if (!locked){
		fs.writeFileSync(LOCK, String(process.pid));
		try {
			const out = execFileSync("python", [path.join(os.homedir(), ".claude/bin/claude-usage.py"), "--json"], { encoding: "utf8", windowsHide: true, timeout: 30000 });
			if (JSON.parse(out)?.utilization) fs.writeFileSync(FILE, out);
		} catch (e) { console.error("refresh failed, using the cached file:", String(e.message).split("\n")[0]); }
		finally { try { fs.unlinkSync(LOCK); } catch {} }
	}
}
const { week, session } = usage_pace(JSON.parse(fs.readFileSync(FILE, "utf8")));
console.log(report_line(week));
console.log(`week ${week.used}% used, ${week.gone.toFixed(1)}% of the week gone (${week.margin >= 0 ? "under" : "OVER"} pace by ${Math.abs(week.margin)} pts); 5h session ${session?.used}%; data ${Math.round(age() / 60000)} min old. ${week.over ? "OVER PACE: no new spawns, finish up." : "OK to spawn within budget."}`);
process.exit(week.over ? 2 : 0);
