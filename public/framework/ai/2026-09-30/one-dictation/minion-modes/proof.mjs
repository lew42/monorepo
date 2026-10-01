// Headless proof for minion-modes (one-dictation): the Dictate page's main demo can be
// built in two modes — "dictate" (voice first, sentences merge into one bubble) and "chat"
// (typed first, manual send, every send its own bubble) — picked by a Dictate | Chat switch
// routed as `?mode=chat` in the page's own URL.
//
// EVERY Servex call is stubbed (page.route on 127.0.0.1:8090) — nothing here ever reaches
// the real Servex, so nothing is ever posted as the owner (`minion` skill, rule 8).
//
//   node public/framework/ai/2026-09-30/one-dictation/minion-modes/proof.mjs
import { browser as shared_browser, close as close_browser } from "../../../../../../Server/browser.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(HERE, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const SITE = "http://localhost:51812";

const results = [];
const log = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const FILE = "/framework/ai/2026-09-30/one-dictation/minion-modes/proof.jsonl";

// Same stub as minion-chatjoin's own proof.mjs (reused, not rebuilt — CLAUDE.md law 6):
// every Servex call is answered here, a fake session, a fake "ok" on every say/log post, an
// empty event stream, and the session's own saved file served back so `Session.watch()`'s
// re-sync (on a brand-new `keep: false` mount's first message, or a reload) finds real lines.
async function stub_servex(page){
	let n = 0, file_lines = [];
	const at = () => new Date(Date.now() + (n++)).toISOString();
	await page.route(/127\.0\.0\.1:8090/, async route => {
		const req = route.request(), url = req.url();
		const json = o => route.fulfill({ status: 200, contentType: "application/json",
			headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(o) });
		if (req.method() === "OPTIONS")
			return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
		if (/\/api\/sessions\?/.test(url)) return json({ ok: true, sessions: [] });
		if (/\/api\/session\/new/.test(url)) return json({ ok: true, session: "proof-session", home: "/framework/ai/2026-09-30/one-dictation/minion-modes/",
			file: FILE, resumed: false, previous: null });
		if (/\/api\/session\/resume/.test(url)) return json({ ok: true, session: "proof-session", home: "/framework/ai/2026-09-30/one-dictation/minion-modes/",
			file: FILE, resumed: true, title: "proof" });
		if (/\/api\/session\/say/.test(url)){
			const body = req.postDataJSON?.() ?? {};
			const a = at();
			file_lines.push(JSON.stringify({ chat: { at: a, session: "proof-session", path: body.path, from: { kind: "owner" }, via: body.via, text: body.text } }));
			return json({ ok: true, at: a });
		}
		if (/\/stream$/.test(url)) return route.fulfill({ status: 200, contentType: "text/event-stream", body: "" });
		if (/\/api\/hitl/.test(url)) return json({ ok: true });
		return json({ ok: true });   // /log/prompts and anything else — never reaches the real Servex
	});
	await page.route(new RegExp(FILE.replace(/[/.]/g, "\\$&")), route =>
		route.fulfill({ status: 200, contentType: "application/jsonl", body: file_lines.join("\n") + "\n" }));
}

// A pre-existing, already-named gap, same filter minion-chatjoin's own proof.mjs uses: the
// "what's in flight" strip throws on this page regardless of anything this task touched, and
// headless Chromium has no real microphone to grant the ✦ sheet's default-listening mic.
const KNOWN_GAP = /cardRows\.filter is not a function|browser is not allowed to use the microphone|usage\.json|2026-10-01\/(files|page)\.jsonl/;

function track_errors(page, into){
	page.on("pageerror", e => { if (!KNOWN_GAP.test(String(e))) into.push(String(e)); });
	page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text()) && !KNOWN_GAP.test(m.text())) into.push(m.text()); });
	page.on("response", r => { if (r.status() >= 400 && !KNOWN_GAP.test(`${r.status()} ${r.url()}`)) into.push(`${r.status()} ${r.url()}`); });
}

// Same reason minion-chatjoin's own warm_up() exists: a `keep: false` mount's first-ever
// message also creates its session, which re-syncs the whole thread from the (stubbed)
// session file and would wipe a real first bubble before the poll redraws it. A throw-away
// message settles the session first, so the two real sentences below never race that reset.
async function warm_up(page){
	await page.evaluate(() => window.$dictate_widget.dictate.commit("warming up."));
	await sleep(80);
	await page.evaluate(() => window.$dictate_widget.dictate.send_screen());
	await sleep(400);
	await page.evaluate(() => window.$dictate_widget.reset());
}

async function send(page, text){
	await page.evaluate(t => window.$dictate_widget.dictate.commit(t), text);
	await sleep(80);
	await page.evaluate(() => window.$dictate_widget.dictate.send_screen());
	await sleep(250);
}

const browser = await shared_browser();
try {
	// ---- 1: dictate mode (the default, no `?mode=`) — two sends merge into ONE bubble,
	// at 400 and 1920, each shot saved. ----
	for (const width of [400, 1920]){
		const page = await browser.newPage({ viewport: { width, height: 1000 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });

		const mode_attr = await page.evaluate(() => window.$dictate_widget.mode);
		log(`${width}: dictate mode is the default (no ?mode=)`, mode_attr === "dictate", `widget.mode: ${mode_attr}`);

		await warm_up(page);
		await send(page, "This is the first sentence.");
		await send(page, "Here is a second one.");

		const bubbles = await page.locator(".ux-dictate-widget-bubbles .chatbox-you").count();
		log(`${width}: dictate mode — two sends make ONE bubble`, bubbles === 1, `${bubbles} bubble(s)`);
		const paragraphs = await page.locator(".ux-dictate-widget-bubbles .chatbox-you .chatbox-text").count();
		log(`${width}: that one bubble holds both sentences`, paragraphs === 2, `${paragraphs} paragraph(s)`);

		await page.screenshot({ path: path.join(SHOTS, `dictate-${width}.png`), fullPage: true });
		log(`${width}: no console/page errors (dictate)`, errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 2: chat mode (`?mode=chat`) — two sends make TWO bubbles, at 400 and 1920. ----
	for (const width of [400, 1920]){
		const page = await browser.newPage({ viewport: { width, height: 1000 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/?mode=chat", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });

		const mode_attr = await page.evaluate(() => window.$dictate_widget.mode);
		log(`${width}: ?mode=chat builds the widget in chat mode`, mode_attr === "chat", `widget.mode: ${mode_attr}`);
		const chat_btn_active = await page.evaluate(() => {
			const btns = [...document.querySelectorAll("button")].filter(b => b.textContent.trim() === "Chat");
			return btns.some(b => b.classList.contains("prim"));
		});
		log(`${width}: the Chat button in the switch shows picked`, chat_btn_active);

		await warm_up(page);
		await send(page, "This is the first sentence.");
		await send(page, "Here is a second one.");

		const bubbles = await page.locator(".ux-dictate-widget-bubbles .chatbox-you").count();
		log(`${width}: chat mode — two sends make TWO bubbles`, bubbles === 2, `${bubbles} bubble(s)`);

		await page.screenshot({ path: path.join(SHOTS, `chat-${width}.png`), fullPage: true });
		log(`${width}: no console/page errors (chat)`, errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 3: ?mode=chat survives a RELOAD (the brief's own proof item). ----
	{
		const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/?mode=chat", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });
		let mode_attr = await page.evaluate(() => window.$dictate_widget.mode);
		log("before reload: ?mode=chat built chat mode", mode_attr === "chat", `widget.mode: ${mode_attr}`);

		await page.reload({ waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });
		mode_attr = await page.evaluate(() => window.$dictate_widget.mode);
		log("after a reload: still chat mode, from the URL alone", mode_attr === "chat", `widget.mode: ${mode_attr}, url: ${page.url()}`);
		log("the URL itself still carries ?mode=chat", /mode=chat/.test(page.url()), page.url());

		// Clicking "Dictate" rewrites the URL (no page reload) and remounts in dictate mode —
		// the switch's own job (`page.js`'s `mode_switch()`/`build()`).
		await page.locator("button", { hasText: "Dictate" }).first().click();
		await sleep(150);
		mode_attr = await page.evaluate(() => window.$dictate_widget.mode);
		log("clicking Dictate remounts the demo in dictate mode", mode_attr === "dictate", `widget.mode: ${mode_attr}`);
		log("clicking Dictate clears ?mode= from the URL", !/mode=/.test(page.url()), page.url());

		log("no console/page errors (reload/switch)", errors.length === 0, errors.join(" | "));
		await page.close();
	}
} finally {
	await close_browser();
}

const failed = results.filter(r => !r.ok);
fs.writeFileSync(path.join(HERE, "proof-results.json"), JSON.stringify(results, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exit(1);
