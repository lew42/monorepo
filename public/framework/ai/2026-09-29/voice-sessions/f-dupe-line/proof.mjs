// Headless proof for f-dupe-line: the double line fix, and review items 1 and 11.
// EVERY Servex call is stubbed (page.route), same pattern as ../e-fixes/proof/ui.mjs —
// nothing here ever reaches the real Servex, so nothing posts as the owner.
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = "http://localhost:50881";
const out = [], shots = [];
const log = (name, ok, detail = "") => { out.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const FILE = "/framework/ext/Session/ai/v-proof2.jsonl";

/* One stub covers every scenario below: `previous_hours` controls what /api/sessions and
 * /api/session/new say the page's last session looks like, so we can prove the resume line
 * appears only when that session is over an hour old. */
function make_stub({ previous_hours = null } = {}){
	let file_lines = [], n = 0, posts = [];
	const at = () => new Date(Date.now() + (n++)).toISOString();
	const old_at = () => new Date(Date.now() - previous_hours * 3600e3).toISOString();
	async function stub(page){
		await page.route(/127\.0\.0\.1:8090|\/servex\//, async route => {
			const req = route.request(), url = req.url(), body = req.postDataJSON?.() ?? null;
			if (req.method() !== "GET" && req.method() !== "OPTIONS") posts.push({ url: url.replace(/^.*\/api\//, "/api/"), body });
			const json = o => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(o) });
			if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
			if (/\/api\/sessions\?/.test(url))
				return json({ ok: true, sessions: previous_hours == null ? [] : [{ session: "v-old", home: "/framework/ext/Session/", title: "Earlier talk", summary: "", at: old_at(), last_at: old_at() }] });
			if (/\/api\/session\/new/.test(url)){
				const fresh = !!body.fresh;
				const previous = previous_hours != null && !fresh ? { session: "v-old", title: "Earlier talk", summary: "", at: old_at() } : null;
				return json({ ok: true, session: "v-proof2", home: "/framework/ext/Session/", file: FILE, resumed: false, previous });
			}
			if (/\/api\/session\/resume/.test(url)) return json({ ok: true, session: body.session, home: "/framework/ext/Session/", file: FILE, resumed: true, title: "Earlier talk" });
			if (/\/api\/session\/say/.test(url)){
				const a = at();
				// The bug this task fixes: the SAME `at` this response carries also lands in the
				// polled file below, on the very next tick — exactly what doubled the owner's line.
				file_lines.push(JSON.stringify({ chat: { at: a, session: "v-proof2", path: body.path, from: { kind: "owner" }, via: body.via, text: body.text } }));
				return json({ ok: true, at: a });
			}
			if (/\/api\/session\/floor/.test(url)) return json({ ok: true, floor: body.floor, released: false });
			if (req.method() === "GET") return route.continue();
			return json({ ok: true });   // any other POST: never reaches the live Servex
		});
		await page.route(new RegExp(FILE.replace(/[/.]/g, "\\$&")), route => route.fulfill({ status: 200, contentType: "application/jsonl", body: file_lines.join("\n") + "\n" }));
	}
	return { stub, posts: () => posts };
}

const browser = await chromium.launch();
try {
	// 1. THE DOUBLE LINE: say one sentence, wait past a file-poll tick (1.5 s), count bubbles.
	{
		const page = await browser.newPage({ viewport: { width: 400, height: 800 } });
		const errors = [];
		page.on("pageerror", e => errors.push(String(e)));
		// Filter out the headless-browser-has-no-mic message ux/Dictate logs when start_mic()
		// runs on sheet open — unrelated to this task, and it fires in headless Chromium
		// regardless of which fix is under test.
		page.on("console", m => { if (m.type() === "error" && !/audio pipeline dictation needs/.test(m.text())) errors.push(m.text()); });
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		const { stub } = make_stub({ previous_hours: null });
		await stub(page);
		await page.goto(SITE + "/framework/ext/Session/", { waitUntil: "networkidle" });
		await page.locator(".drawer-rail-ai").click();
		await page.waitForSelector(".drawer-rail-sheet .chatbox-compose-input", { timeout: 5000 });
		const input = page.locator(".drawer-rail-sheet .chatbox-compose-input");
		await input.fill("can you hear me?"); await input.press("Enter");
		await sleep(2200);   // past the 1.5 s file-poll tick, so the watch has had its chance to double it
		const said = await page.locator(".drawer-rail-sheet p.chatbox", { hasText: "can you hear me?" }).count();
		log("the owner's sentence shows exactly ONCE, not twice", said === 1, `${said} bubble(s)`);
		await page.screenshot({ path: path.join(HERE, "sheet-no-dupe-400.png") }); shots.push("sheet-no-dupe-400.png");
		log("no console/page errors", errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// 2. RESUME LINE: shows, with its age, only past an hour.
	{
		const page = await browser.newPage({ viewport: { width: 400, height: 800 } });
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		const { stub } = make_stub({ previous_hours: 26 });   // just over a day
		await stub(page);
		await page.goto(SITE + "/framework/ext/Session/", { waitUntil: "networkidle" });
		await page.locator(".drawer-rail-ai").click();
		await page.waitForSelector(".drawer-rail-sheet .chatbox-choice", { timeout: 5000 }).catch(() => {});
		const line = await page.locator(".drawer-rail-sheet .chatbox-choice").allTextContents();
		log("a session over an hour old: the resume line shows, labelled with its age", line.length === 1 && /Earlier talk · 1 day ago/.test(line[0]), line.join(" / "));
		await page.screenshot({ path: path.join(HERE, "sheet-resume-old-400.png") }); shots.push("sheet-resume-old-400.png");
		await page.close();
	}
	{
		const page = await browser.newPage({ viewport: { width: 400, height: 800 } });
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		const { stub } = make_stub({ previous_hours: 0.2 });   // 12 minutes: continues on its own
		await stub(page);
		await page.goto(SITE + "/framework/ext/Session/", { waitUntil: "networkidle" });
		await page.locator(".drawer-rail-ai").click();
		await sleep(1200);
		const line = await page.locator(".drawer-rail-sheet .chatbox-choice").count();
		log("a session under an hour old: NO resume line (it continues on the first word instead)", line === 0, `${line} choice line(s)`);
		await page.screenshot({ path: path.join(HERE, "sheet-resume-recent-400.png") }); shots.push("sheet-resume-recent-400.png");
		await page.close();
	}

	// 3. NEW SESSION sends fresh: true.
	{
		const page = await browser.newPage({ viewport: { width: 400, height: 800 } });
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		const { stub, posts } = make_stub({ previous_hours: 3 });
		await stub(page);
		await page.goto(SITE + "/framework/ext/Session/", { waitUntil: "networkidle" });
		await page.locator(".drawer-rail-ai").click();
		await page.waitForSelector(".drawer-rail-sheet-new", { timeout: 5000 });
		await page.locator(".drawer-rail-sheet-new").click();
		await page.waitForSelector(".drawer-rail-sheet .chatbox-compose-input", { timeout: 5000 });
		const input = page.locator(".drawer-rail-sheet .chatbox-compose-input");
		await input.fill("starting over"); await input.press("Enter");
		await sleep(600);
		const news = posts().filter(p => p.url.startsWith("/api/session/new"));
		log("New session's next sentence sends fresh: true", news.length > 0 && news[news.length - 1].body.fresh === true, JSON.stringify(news.map(p => p.body)));
		await page.close();
	}

	// 4. The Session demo page at 1920: the placeholder and the Recent list both show, zero console errors.
	{
		const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
		const errors = [];
		page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
		page.on("pageerror", e => errors.push(String(e)));
		const { stub } = make_stub({ previous_hours: null });
		await stub(page);
		await page.goto(SITE + "/framework/ext/Session/", { waitUntil: "networkidle" });
		await sleep(500);
		const placeholder = await page.locator(".session-demo-placeholder").textContent();
		log("the chat pane shows its placeholder before Start", /Replies appear here/.test(placeholder ?? ""), placeholder);
		const recent_visible = await page.locator(".session-demo-recent").isVisible();
		log("the Recent list is visible in the same view", recent_visible);
		log("zero console errors at 1920px", errors.length === 0, errors.join(" | "));
		await page.screenshot({ path: path.join(HERE, "session-page-1920.png"), fullPage: true }); shots.push("session-page-1920.png");
		await page.close();
	}
} finally {
	await browser.close();
}
fs.writeFileSync(path.join(HERE, "proof.json"), JSON.stringify({ out, shots }, null, 2));
console.log(`${out.filter(r => r.ok).length}/${out.length} pass`);
