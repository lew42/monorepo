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
	return chromium.launch({ headless: true, channel: "chromium", ...opts });
}
