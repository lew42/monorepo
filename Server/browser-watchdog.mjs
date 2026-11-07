/* Server/browser-watchdog.mjs <launcherPid> <chromePid>: closes a Playwright chrome.exe when the process that launched it dies.
 * Browser.mjs starts one beside every browser it launches. A hard kill (taskkill /F, a crash, a closed terminal) skips every
 * `exit` hook, so the browser outlived its script (2026-11-04: 30+ orphans); this separate process notices and ends the tree. */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const [launcher, chrome] = process.argv.slice(2).map(Number);
const alive = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
if (!launcher || !chrome) process.exit(0);

/* The browser's lifecycle end line, unless one is already in the log: a launcher that closed it normally wrote its own; a launcher killed hard wrote nothing,
 * and without this the sweep would later find the start line "killed without a goodbye". The start line carries the id and path; the log tail has it. */
async function end_line(why){
	try {
		const { place } = await import("../Servex/home.js"), { record_sync } = await import("../Servex/Lifecycle.js");   // loaded only now: a watchdog that never ends a line stays small
		const f = place("logs", "lifecycle.jsonl"), size = fs.statSync(f).size, fd = fs.openSync(f, "r"), buf = Buffer.alloc(Math.min(size, 1 << 20));
		fs.readSync(fd, buf, 0, buf.length, size - buf.length); fs.closeSync(fd);
		const id = `browser:${chrome}`, rows = buf.toString("utf8").split(String.fromCharCode(10)).filter(l => l.includes(`"${id}"`)).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
		const last = rows.at(-1);
		if (!last || last.event === "end") return;
		const { at, ...rest } = last;
		record_sync({ ...rest, event: "end", why });
	} catch {}
}

/* Windows reuses pids: if our chrome died and the number now belongs to the owner's own Chrome, it must not be killed. Only a command line that says Playwright / our profile is ours. */
async function still_ours(){
	try {
		const { OUR_CHROME } = await import("../Servex/Lifecycle.js");
		const cmd = execFileSync("powershell.exe", ["-NoProfile", "-Command", `(Get-CimInstance Win32_Process -Filter "ProcessId=${chrome}").CommandLine`], { encoding: "utf8", windowsHide: true }).trim();
		return OUR_CHROME.test(cmd);
	} catch { return false; }
}

let busy = false;
const timer = setInterval(async () => {
	if (busy) return;
	busy = true;
	if (!alive(chrome)){ if (!alive(launcher)) await end_line("gone with its launcher (the watchdog saw both dead)"); process.exit(0); }
	if (alive(launcher)){ busy = false; return; }
	if (await still_ours()) try { execFileSync("taskkill", ["/PID", String(chrome), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch {}
	await end_line("closed by its watchdog: the launching script died");
	process.exit(0);
}, 2000);
