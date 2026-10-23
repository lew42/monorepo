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
const j = JSON.parse(fs.readFileSync(FILE, "utf8")), L = j.utilization?.limits ?? [];
const week = L.find(l => l.kind === "weekly_all"), session = L.find(l => l.kind === "session");
const used = week?.percent, elapsed = 100 * (1 - (Date.parse(week?.resets_at) - Date.now()) / (7 * 24 * 3600 * 1000));
const margin = +(elapsed - used).toFixed(1), over = used > elapsed;
// pace % = used ÷ elapsed: under ~75 spend more, ~90 slow down, 100 is the line (the owner, 2026-10-12)
const pace = Math.round(100 * used / Math.max(elapsed, 0.1));
const advice = pace >= 100 ? "slow right down" : pace >= 90 ? "slow down" : pace >= 75 ? "steady" : "room to spend";
const left = Math.max(0, Date.parse(week?.resets_at) - Date.now()), mins = Math.floor(left / 60000);
const d = Math.floor(mins / 1440), h = Math.floor(mins % 1440 / 60), m = mins % 60, pl = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const timeLeft = d ? `${pl(d, "day")} ${pl(h, "hour")}` : `${pl(h, "hour")} ${pl(m, "minute")}`;
// the report line, all three numbers (the owner, 2026-10-23): used, gone, and used ÷ gone as "% of pace"
console.log(`Week: ${used}% used · ${elapsed.toFixed(0)}% gone · ${pace}% of pace (${advice}, ${timeLeft} left)`);
console.log(`week ${used}% used, ${elapsed.toFixed(1)}% of the week gone (${margin >= 0 ? "under" : "OVER"} pace by ${Math.abs(margin)} pts); 5h session ${session?.percent}%; data ${Math.round(age() / 60000)} min old. ${over ? "OVER PACE: no new spawns, finish up." : "OK to spawn within budget."}`);
process.exit(over ? 2 : 0);
