/* Server/browser-check.mjs — what a developer tools console would show, for one URL, without
 * opening a tab yourself. Built for the Servex `check_page` MCP tool (Servex/Servex.js), so the
 * owner can say "this page isn't loading" and get the console/network truth back instead of a
 * guess. Uses the ONE shared browser from Server/browser.mjs — never a second browser instance.
 *
 *   import { check_page, browser_rss } from "./browser-check.mjs";
 *   const report = await check_page("http://monorepo.localhost/framework/");
 *
 * Doc: doc/browser.md. Owner's ask: public/framework/ai/2026-10-03/playwright-reap/requirements.md. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { browser, close, pid as browser_pid } from "./browser.mjs";

/** Navigate a fresh tab to `url`, wait for load + 2s (late console lines land too), then report
 * console lines (deduped, with counts), failed requests, HTTP 4xx/5xx responses, page errors
 * (uncaught JS exceptions) and load time. Closes the TAB when done, never the shared browser.
 * `opts.shot` also saves a screenshot and returns its path. */
export async function check_page(url, opts = {}){
	touch();
	const b = await browser();
	const context = await b.newContext();
	const page = await context.newPage();
	const console_lines = new Map();   // text -> {type, text, count}
	const failed = [], http_errors = [], page_errors = [];

	page.on("console", m => {
		const key = `${m.type()}: ${m.text()}`;
		const hit = console_lines.get(key);
		if (hit) hit.count++; else console_lines.set(key, { type: m.type(), text: m.text(), count: 1 });
	});
	page.on("requestfailed", r => failed.push({ url: r.url(), why: r.failure()?.errorText ?? "failed" }));
	page.on("response", r => { if (r.status() >= 400) http_errors.push({ url: r.url(), status: r.status() }); });
	page.on("pageerror", e => page_errors.push(String(e?.message ?? e)));

	const started = Date.now();
	let shot = null;
	try {
		await page.goto(url, { waitUntil: "load", timeout: 30000 });
		await page.waitForTimeout(2000);   // late console lines (a fetch that resolves after load) land too
		if (opts.shot){
			const dir = path.join(process.env.LOCALAPPDATA || "", "lew42", "playwright", "shots");
			fs.mkdirSync(dir, { recursive: true });
			shot = path.join(dir, `check-${Date.now()}.png`);
			await page.screenshot({ path: shot });
		}
	} finally {
		await context.close();   // the TAB's context, not the shared browser
	}

	return {
		url, load_ms: Date.now() - started,
		console: [...console_lines.values()],
		failed, http_errors, page_errors,
		shot
	};
}

/** The shared Chromium's total RSS right now (itself + every child process), in MB, or null if
 * it isn't running. Same `Get-CimInstance Win32_Process` query `node-reap.mjs` already uses —
 * one way to read process memory, not a second one. */
export function browser_rss(pid){
	if (!pid) return null;
	try {
		const ps = `Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -eq ${pid} -or $_.ParentProcessId -eq ${pid} } | Measure-Object WorkingSetSize -Sum | Select-Object -ExpandProperty Sum`;
		const r = spawnSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { encoding: "utf8", windowsHide: true });
		const bytes = Number(r.stdout.trim());
		return Number.isFinite(bytes) ? Math.round(bytes / 1048576) : null;
	} catch { return null; }
}

/** Close the shared browser if it's grown past `max_mb` RSS or sat idle past `max_idle_ms`.
 * Call this after each `check_page` — the next call relaunches a fresh one. Returns what (if
 * anything) it did, for the caller to log. */
let last_used = Date.now();
export function touch(){ last_used = Date.now(); }
export async function cap({ max_mb = 600, max_idle_ms = 30 * 60 * 1000 } = {}){
	const rss_mb = browser_rss(browser_pid());
	const idle_ms = Date.now() - last_used;
	if (rss_mb !== null && rss_mb > max_mb) { await close(); return { closed: true, why: `RSS ${rss_mb} MB over the ${max_mb} MB cap`, rss_mb }; }
	if (idle_ms > max_idle_ms) { await close(); return { closed: true, why: `idle ${Math.round(idle_ms / 60000)} min`, rss_mb }; }
	return { closed: false, rss_mb };
}
