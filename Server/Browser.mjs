/* Server/Browser.mjs — class Browser: the one way any script in this repo starts Chromium.
 *
 * `chromium.launch()` with no options opens Playwright's default browser, `chrome-headless-shell`,
 * a real OS window that steals focus (2026-09-22, 09-24, 09-25). `{ channel: "chromium" }` launches
 * the full Chromium build instead (commit 38bfb384), so every script gets it from here.
 *
 * Recognisable as ours: the reaper (`Servex/Lifecycle.js`) tells this chrome.exe from the owner's own
 * Chrome by its executable path (`%LOCALAPPDATA%/ms-playwright/...`). One browser per process: the
 * first `Browser.browser()` launches, later calls get the same instance; `Browser.close()` is safe to
 * call twice and also runs on `beforeExit`, `exit` and SIGINT. Playwright is resolved from the GLOBAL
 * npm install, never a project dependency. Doc: doc/browser.md.
 *
 *   import Browser from "./Browser.mjs";
 *   const b = await Browser.browser();   // the shared Playwright Browser
 *   await Browser.close();
 *
 * The named exports `browser`, `close`, `pid` at the bottom are one-line aliases kept for the ~35 existing callers.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export default class Browser {
	static chromium_promise;
	static browser_promise = null;   // the one shared Browser for this process, or null once closed
	static current = null;           // the resolved Browser, for the synchronous `exit` fallback
	static current_pid = null;       // its real chrome.exe pid (see real_pid), for the same fallback
	static hooked = false;

	static resolve_playwright(){
		let g; try { g = execSync("npm root -g", { encoding: "utf8", windowsHide: true }).trim(); } catch { return null; }
		const entry = path.join(g, "playwright", "index.mjs");
		return fs.existsSync(entry) ? entry : null;
	}

	static get_chromium(){
		return this.chromium_promise ??= (async () => {
			const entry = this.resolve_playwright();
			if (!entry) throw new Error("browser(): playwright is not installed globally — `npm i -g playwright` and `npx playwright install chromium`.");
			const { chromium } = await import(pathToFileURL(entry).href);
			return chromium;
		})();
	}

	/** Launch Chromium the one way that opens no window, reusing the one already running in this
	 * process. `opts` extends Playwright's LaunchOptions and only applies to the FIRST launch. */
	static async browser(opts = {}){
		this.hook_exit();
		if (!this.browser_promise) this.browser_promise = this.launch(opts);
		try {
			const b = await this.browser_promise;
			if (!b.isConnected()) { this.browser_promise = null; return this.browser(opts); }   // closed from under us: relaunch
			return b;
		} catch (e) { this.browser_promise = null; throw e; }
	}

	/* What the creation log records as `script`: the agent id if one runs us, else the script's basename. */
	static launch_tag(){
		return process.env.LEW_AGENT || path.basename(process.argv[1] || "script");
	}

	static async launch(opts){
		const chromium = await this.get_chromium();
		const b = await chromium.launch({ headless: true, channel: "chromium", ...opts });
		this.current = b;
		b.on("disconnected", () => { if (this.current === b) this.current = null; if (this.browser_promise) this.browser_promise = null; });
		this.log_browser(b);
		return b;
	}

	/** The shared browser's real chrome.exe pid once browser() has resolved; null before that. */
	static pid(){ return this.current_pid; }

	/** Close the shared browser, if one is open. Idempotent. */
	static async close(){
		const p = this.browser_promise;
		this.browser_promise = null;
		if (!p) return;
		try {
			const b = await p;
			if (b.isConnected()) await b.close();
		} catch {}
	}

	/* Close automatically so a script that forgets never leaves Chromium running. `process.exit()` skips
	 * beforeExit, so `exit` makes a synchronous kill by pid (b.process() does not exist on this Playwright). */
	static hook_exit(){
		if (this.hooked) return;
		this.hooked = true;
		process.once("beforeExit", () => { this.close(); });
		process.once("exit", () => { try { if (this.current_pid) execSync(`taskkill /PID ${this.current_pid} /T /F`, { windowsHide: true, stdio: "ignore" }); } catch {} });
		process.once("SIGINT", () => { this.close().finally(() => process.exit(130)); });
	}

	/* The real chrome.exe pid comes from the DevTools Protocol process list (b.process() is undefined here, checked 2026-10-03). */
	static async real_pid(b){
		try {
			if (typeof b.process === "function"){ const p = b.process(); if (p?.pid) return p.pid; }
		} catch {}
		try {
			const session = await b.newBrowserCDPSession();
			const { processInfo } = await session.send("SystemInfo.getProcessInfo");
			session.detach().catch(() => {});
			return processInfo.find(p => p.type === "browser")?.id ?? null;
		} catch { return null; }
	}

	/* The creation log (2026-09-29): a start line with pid and owner task, an end line on close. Never throws. Servex/Lifecycle.js. */
	static async log_browser(b){
		try {
			const m = await import("../Servex/Lifecycle.js");
			const pid = await this.real_pid(b);
			if (this.current === b) this.current_pid = pid;
			const base = { kind: "browser", id: `browser:${pid ?? Date.now()}`, pid, path: process.cwd(), owner_task: m.owner_task(), owner_agent: process.env.LEW_AGENT || null, script: this.launch_tag() };
			m.record({ ...base, event: "start" });
			b.on("disconnected", () => m.record({ ...base, event: "end", why: "browser closed" }));
		} catch {}
	}
}

// Aliases for existing callers. No lowercase shim file: browser.mjs and Browser.mjs are one file on Windows.
export const browser = opts => Browser.browser(opts);
export const close = () => Browser.close();
export const pid = () => Browser.pid();
