/* Server/browser.mjs — the one way any script in this repo starts Chromium.
 *
 * `chromium.launch()` with no options opens Playwright's default browser,
 * `chrome-headless-shell` — a real OS window that steals focus the instant a
 * script runs, even in "headless" mode (it happened three times: 2026-09-22,
 * 09-24, 09-25). `{ channel: "chromium" }` launches the full Chromium build
 * instead, which does not do that (commit 38bfb384). Every script gets it
 * from calling `browser()` here, so there is exactly one place to change it
 * if that ever needs to move again.
 *
 * ONE BROWSER PER PROCESS (lifecycle, 2026-09-29): `browser()` launches
 * Chromium once and hands the SAME instance to every caller in this process —
 * a module-level promise is the cache. A caller that calls `.close()` on the
 * Browser it got back (the old, still-supported way) closes the shared
 * instance for everyone still holding it; the next `browser()` call notices
 * and launches a fresh one. `close()`, exported here, is the shared way to
 * shut it down and is safe to call more than once or when nothing is open.
 * It also runs by itself on `beforeExit` (a normal end of the script) and
 * makes a best-effort synchronous kill on `exit` (a `process.exit()` call,
 * which skips `beforeExit`) — belt and braces; the lifecycle sweep is the
 * real backstop for a browser a script never closes at all.
 *
 * Playwright itself is resolved from the GLOBAL npm install, never a project
 * dependency (CLAUDE.md: no new npm dependency) and never a hard-coded path
 * (a hard-coded `C:/Users/mike/...` breaks on any other machine or account).
 *
 *   import { browser, close } from "./browser.mjs";   // same dir
 *   const b = await browser();                        // → the shared Browser
 *   const page = await (await b.newContext()).newPage();
 *   ...
 *   await close();                                     // or: await b.close();
 *
 * Doc: doc/browser.md.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function resolve_playwright(){
	let g; try { g = execSync("npm root -g", { encoding: "utf8", windowsHide: true }).trim(); } catch { return null; }
	const entry = path.join(g, "playwright", "index.mjs");
	return fs.existsSync(entry) ? entry : null;
}

let chromium_promise;
function get_chromium(){
	return chromium_promise ??= (async () => {
		const entry = resolve_playwright();
		if (!entry) throw new Error("browser(): playwright is not installed globally — `npm i -g playwright` and `npx playwright install chromium`.");
		const { chromium } = await import(pathToFileURL(entry).href);
		return chromium;
	})();
}

let browser_promise = null;   // the one shared Browser for this process, or null once it's closed
let current = null;           // the resolved Browser, for the synchronous `exit` fallback
let hooked = false;

/** Launch Chromium the one way that opens no window, reusing the one already
 * running in this process if there is one. `opts` extends the launch args
 * (Playwright's `LaunchOptions`) — `headless` defaults to `true`, `channel`
 * defaults to `"chromium"` and can be raised but not lowered without a
 * reason; changing that reason belongs here, not at each call site. `opts`
 * only applies to the FIRST launch in a process — later calls get the
 * already-running browser regardless of what they pass. */
export async function browser(opts = {}){
	hook_exit();
	if (!browser_promise) browser_promise = launch(opts);
	try {
		const b = await browser_promise;
		if (!b.isConnected()) { browser_promise = null; return browser(opts); }   // closed from under us — relaunch
		return b;
	} catch (e) { browser_promise = null; throw e; }
}

async function launch(opts){
	const chromium = await get_chromium();
	const b = await chromium.launch({ headless: true, channel: "chromium", ...opts });
	current = b;
	b.on("disconnected", () => { if (current === b) current = null; if (browser_promise) browser_promise = null; });
	log_browser(b);
	return b;
}

/** Close the shared browser, if one is open. Idempotent: safe to call more
 * than once, and safe even if a caller already closed the Browser it was
 * given directly (`b.close()`) — there is nothing left to do then. */
export async function close(){
	const p = browser_promise;
	browser_promise = null;
	if (!p) return;
	try {
		const b = await p;
		if (b.isConnected()) await b.close();
	} catch {}
}

/* Close automatically so a script that forgets never leaves Chromium running:
 * `beforeExit` fires on a normal end and can still await; `process.exit()`
 * skips it, so `exit` makes a best-effort synchronous kill instead (no
 * await is possible there). A script that never reaches either — killed
 * outright — is caught by the lifecycle sweep instead, from the start line
 * `log_browser` writes below. */
function hook_exit(){
	if (hooked) return;
	hooked = true;
	process.once("beforeExit", () => { close(); });
	process.once("exit", () => { try { current?.process?.()?.kill(); } catch {} });
}

/* The creation log (lifecycle, 2026-09-29): a start line with the browser's pid and owner task,
 * an end line when it closes. A script that forgets close() leaves a start with no end, and
 * the reaper's sweep closes it. Never throws. Servex/Lifecycle.js. */
async function log_browser(b){
	try {
		const m = await import("../Servex/Lifecycle.js");
		const pid = b.process?.()?.pid ?? null;
		const base = { kind: "browser", id: `browser:${pid ?? Date.now()}`, pid, path: process.cwd(), owner_task: m.owner_task(), owner_agent: process.env.LEW_AGENT || null, script: path.basename(process.argv[1] || "") };
		m.record({ ...base, event: "start" });
		b.on("disconnected", () => m.record({ ...base, event: "end", why: "browser closed" }));
	} catch {}
}
