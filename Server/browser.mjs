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
 * Playwright itself is resolved from the GLOBAL npm install, never a project
 * dependency (CLAUDE.md: no new npm dependency) and never a hard-coded path
 * (a hard-coded `C:/Users/mike/...` breaks on any other machine or account).
 *
 *   import { browser } from "./browser.mjs";      // same dir
 *   const b = await browser();                    // → a launched Browser
 *   const page = await (await b.newContext()).newPage();
 *   ...
 *   await b.close();
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

/** Launch Chromium the one way that opens no window. `opts` extends the launch
 * args (Playwright's `LaunchOptions`) — `headless` defaults to `true`, `channel`
 * defaults to `"chromium"` and can be raised but not lowered without a reason;
 * changing that reason belongs here, not at each call site. */
export async function browser(opts = {}){
	const chromium = await get_chromium();
	const b = await chromium.launch({ headless: true, channel: "chromium", ...opts });
	log_browser(b);
	return b;
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
