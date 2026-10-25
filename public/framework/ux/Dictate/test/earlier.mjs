// The sheet draws only the newest Widget.HISTORY chat lines; "show earlier (N)" brings the rest, above, without moving the reader.
// node earlier.mjs <base> <page> <session-file>   (Servex and hitl are stubbed; pass the worktree URL, never monorepo.localhost)
import path from "path";
import { pathToFileURL } from "url";
const [base = "http://monorepo.localhost", page_path = "/framework/ext/drawer/", file = "/framework/ai/sessions/2026/10/05/v-yxnts4l/session.jsonl"] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const { default: Browser } = await import(pathToFileURL(path.join(here, "../../../../../Server/Browser.mjs")).href);
const browser = await Browser.browser({});
const session = path.basename(file, ".jsonl");
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
await ctx.addInitScript(({ session, file }) => { try { sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session, file })); } catch {} }, { session, file });
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
const json = (route, out) => route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) }).catch(() => {});
await page.route(/127\.0\.0\.1:8090\/api\/session\//, async route => {
	const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
	if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
	if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });
	return json(route, verb === "new" || verb === "resume" ? { ok: true, session, file } : { ok: true });
});
await page.route(/127\.0\.0\.1:8090\/api\/hitl/, route => route.request().method() === "OPTIONS" ? route.fulfill({ status: 204, headers: cors }) : json(route, { ok: true, marks: [] }));
await page.route(/127\.0\.0\.1:8090\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
await page.goto(base + page_path, { waitUntil: "load" });
await page.waitForSelector(".drawer-rail-ai");
await page.click(".drawer-rail-ai");
await page.waitForSelector(".drawer-rail-sheet.on .chatbox");
await page.waitForTimeout(1500);

const state = () => page.evaluate(() => {
	const t = document.querySelector(".drawer-rail-sheet.on .ux-dictate-widget-thread");
	const ats = [...t.querySelectorAll("[data-re]")].map(n => n.dataset.re).filter(a => /^\d{4}-/.test(a)).map(Date.parse);
	return { pieces: ats.length, sorted: ats.every((a, i) => i === 0 || a >= ats[i - 1]), button: t.querySelector(".chatbox-earlier")?.textContent ?? null, scroll_top: t.scrollTop, height: t.scrollHeight };
});
const first = await state();
const fail = [];
if (!first.button) fail.push("no 'show earlier' button on a long session");
if (first.pieces > 60) fail.push(`first draw showed ${first.pieces} chat pieces, expected about 50`);
let last = first, clicks = 0;
while (last.button && clicks < 10){
	await page.evaluate(() => { const t = document.querySelector(".drawer-rail-sheet.on .ux-dictate-widget-thread"); t.scrollTop = 0; });
	await page.waitForTimeout(100);
	const anchor = await page.evaluate(() => { const t = document.querySelector(".drawer-rail-sheet.on .ux-dictate-widget-thread"); const n = t.querySelector("[data-re]"); return { re: n.dataset.re, y: n.getBoundingClientRect().top - t.getBoundingClientRect().top }; });
	await page.click(".drawer-rail-sheet.on .chatbox-earlier");
	await page.waitForTimeout(400);
	const next = await state();
	const moved = await page.evaluate(({ re }) => { const t = document.querySelector(".drawer-rail-sheet.on .ux-dictate-widget-thread"); const n = [...t.querySelectorAll("[data-re]")].find(x => x.dataset.re === re); return n ? n.getBoundingClientRect().top - t.getBoundingClientRect().top : null; }, anchor);
	if (next.pieces <= last.pieces) fail.push(`click ${clicks + 1} added no pieces`);
	if (!next.sorted) fail.push(`click ${clicks + 1}: pieces are not in time order`);
	if (moved == null || Math.abs(moved - anchor.y) > 3) fail.push(`click ${clicks + 1}: the reader moved (${anchor.y} -> ${moved})`);
	last = next; clicks++;
}
if (last.button) fail.push("the button never ran out");
console.log(JSON.stringify({ first, last, clicks, fail }));
await Browser.close();
process.exit(fail.length ? 1 : 0);
