/* Server/browser-watchdog.mjs <launcherPid> <chromePid>: closes a Playwright chrome.exe when the process that launched it dies.
 * Browser.mjs starts one beside every browser it launches. A hard kill (taskkill /F, a crash, a closed terminal) skips every
 * `exit` hook, so the browser outlived its script (2026-11-04: 30+ orphans); this separate process notices and ends the tree. */
import { execFileSync } from "node:child_process";

const [launcher, chrome] = process.argv.slice(2).map(Number);
const alive = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
if (!launcher || !chrome) process.exit(0);

const timer = setInterval(() => {
	if (!alive(chrome)) process.exit(0);
	if (alive(launcher)) return;
	try { execFileSync("taskkill", ["/PID", String(chrome), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch {}
	process.exit(0);
}, 2000);
