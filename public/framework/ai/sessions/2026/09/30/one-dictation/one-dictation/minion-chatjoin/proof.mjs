// Headless proof for minion-chatjoin (merge 8, one-dictation): the Dictate `Widget` now
// draws its bubbles through `ext/Chat/Chat.js`'s own `speak()` (so sentences said close
// together merge into one bubble) and its entry through `ext/Chat/Composer.js` (so Whisper
// types into the real box, shared with every other composer on the site).
//
// EVERY Servex call is stubbed (page.route on 127.0.0.1:8090) — nothing here ever reaches
// the real Servex, so nothing is ever posted as the owner (`minion` skill, rule 8).
//
//   node public/framework/ai/2026-09-30/one-dictation/minion-chatjoin/proof.mjs
import { browser as shared_browser, close as close_browser } from "../../../../../../Server/browser.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(HERE, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const SITE = "http://localhost:51812";
const SENTENCES = ["This is the first sentence.", "Here is a second one.", "And a third one to finish."];

const results = [];
const log = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const FILE = "/framework/ai/2026-09-30/one-dictation/minion-chatjoin/proof.jsonl";

/** Every request to the real Servex (127.0.0.1:8090) is answered here instead — a fake
 *  session, a fake "ok" on every `say`/log post, an empty event stream. Nothing a real
 *  Servex would ever see. The session's own FILE is stubbed too (same-origin, `FILE` above)
 *  so `Session.watch()`'s poll finds real content instead of a 404 — a `keep: false` mount's
 *  first-ever message also creates its session, and creating a session re-syncs the whole
 *  thread from this file (`ux/Dictate/chat.js`'s own "why a reopened chat never loses old
 *  messages") — serving the lines back, the same way the real Servex would, is what makes
 *  that re-sync show the right history instead of nothing. */
async function stub_servex(page, into){
	let n = 0, file_lines = [];
	const at = () => new Date(Date.now() + (n++)).toISOString();
	await page.route(/127\.0\.0\.1:8090/, async route => {
		const req = route.request(), url = req.url();
		const json = o => route.fulfill({ status: 200, contentType: "application/json",
			headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(o) });
		if (req.method() === "OPTIONS")
			return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
		if (/\/api\/sessions\?/.test(url)) return json({ ok: true, sessions: [] });
		if (/\/api\/session\/new/.test(url)) return json({ ok: true, session: "proof-session", home: "/framework/ai/2026-09-30/one-dictation/minion-chatjoin/",
			file: FILE, resumed: false, previous: null });
		if (/\/api\/session\/resume/.test(url)) return json({ ok: true, session: "proof-session", home: "/framework/ai/2026-09-30/one-dictation/minion-chatjoin/",
			file: FILE, resumed: true, title: "proof" });
		if (/\/api\/session\/say/.test(url)){
			const body = req.postDataJSON?.() ?? {};
			if (into) into.push(body);   // the mastermind's own ask: prove floor/cues ride the real body, not just the file line
			const a = at();
			file_lines.push(JSON.stringify({ chat: { at: a, session: "proof-session", path: body.path, from: { kind: "owner" }, via: body.via, text: body.text } }));
			return json({ ok: true, at: a });
		}
		if (/\/stream$/.test(url)) return route.fulfill({ status: 200, contentType: "text/event-stream", body: "" });
		// `/api/hitl` is `ux/Understand`'s own `marks()` call — answered with no `marks`
		// array, so it falls back to the FIXTURES rules pass (`fixtures.js`: no hedge word
		// -> "ok", a hedge word -> "unclear"), same as a real page gets when Servex isn't
		// up. A short, deliberate delay here — not a real network's, just enough that a
		// SECOND sentence sent right after the first can actually merge into its bubble
		// before the first one's mark answers — is what lets "a mark arrives after a
		// merge" (review finding 1) be proven on purpose instead of by accident of timing.
		if (/\/api\/hitl/.test(url)){ await new Promise(r => setTimeout(r, 180)); return json({ ok: true }); }
		return json({ ok: true });   // /log/prompts and anything else — never reaches the real Servex
	});
	await page.route(new RegExp(FILE.replace(/[/.]/g, "\\$&")), route =>
		route.fulfill({ status: 200, contentType: "application/jsonl", body: file_lines.join("\n") + "\n" }));
}

// A pre-existing, already-named gap (`minion-workbench/audit.md`'s "One small, unrelated
// thing noticed, not fixed") — `core/Page/ai/work.js`'s "what's in flight" strip throws on
// this page regardless of anything this task touched. Filtered here, not fixed: it is outside
// this task's fence (`ux/Dictate/Widget.js`/`.css`/`chat.js`, `ext/Chat/Composer.js`/`Mic.js`/
// `Chat.css` — never `core/Page/ai/work.js`).
// Headless Chromium has no real microphone to grant — opening the ✦ sheet starts listening
// by default and logs this, in every task's proof, regardless of anything under test (the
// same filter `ai/2026-09-29/voice-sessions/f-dupe-line/proof.mjs` already uses). The two
// 404s are AI 2's own usage meter and today's not-yet-created day log (`ai/2026-10-01/`
// doesn't exist in this worktree yet) — unrelated to the composer/thread this task touched,
// and present on that page with or without this task's changes.
const KNOWN_GAP = /cardRows\.filter is not a function|browser is not allowed to use the microphone|usage\.json|2026-10-01\/(files|page)\.jsonl/;

function track_errors(page, into){
	page.on("pageerror", e => { if (!KNOWN_GAP.test(String(e))) into.push(String(e)); });
	// Chrome's own console text for a failed network request never carries the URL ("Failed
	// to load resource: the server responded with a status of 404") — that generic line is
	// skipped here and the REAL, filterable detail (status + url) comes from "response" below.
	page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text()) && !KNOWN_GAP.test(m.text())) into.push(m.text()); });
	page.on("response", r => {
		if (r.status() < 400) return;
		const line = `${r.status()} ${r.url()}`;
		if (!KNOWN_GAP.test(line)) into.push(line);
	});
}

/* ONE-DICTATION DEVIATION, named per CLAUDE.md law 4: the brief says "use the Mic/Dictate
 * sample path" — but `Dictate.sample()` writes straight to `push_to_target()`, which for
 * `mode: "open"` (every `ComposerMic`, old AND new) only fires `on_text`, never touches the
 * real box — it was built for the OLD caption-based display, not the new box-writing
 * composer. `commit()` IS the real per-segment path a live microphone calls (it is what
 * populates `held` and writes the box via `log_prompt()` → `draw_caption()`), so this proof
 * calls `commit()` + `send_screen()` directly instead — with Servex fully stubbed above, so
 * nothing it does ever reaches a real session or posts as the owner, which is the actual
 * rule this is protecting. */
/* A `keep: false` mount's first-ever message is also the message that creates its session
 * (`ux/Dictate/chat.js`'s `ensure()`), and creating a session re-syncs the whole thread from
 * the (here, stubbed) session file (`chat.js`'s own "why a reopened chat never loses old
 * messages") — so that FIRST bubble would be wiped by the reset and need the file's next poll
 * (1.5s) to reappear. A throw-away warm-up message settles the session first, so the three
 * SENTENCES below never race that reset. */
async function warm_up(page){
	await page.evaluate(() => window.$dictate_widget.dictate.commit("warming up."));
	await sleep(80);
	await page.evaluate(() => window.$dictate_widget.dictate.send_screen());
	await sleep(400);
	await page.evaluate(() => window.$dictate_widget.reset());
}

async function run_sentences(page){
	await warm_up(page);
	for (const text of SENTENCES){
		await page.evaluate(t => window.$dictate_widget.dictate.commit(t), text);
		await sleep(80);
		await page.evaluate(() => window.$dictate_widget.dictate.send_screen());
		await sleep(200);
		const box = await page.evaluate(() => document.querySelector(".ux-dictate-widget-composer .chatbox-compose-input")?.value ?? null);
		log(`box is empty right after sending "${text.slice(0, 20)}…"`, box === "", `box: ${JSON.stringify(box)}`);
	}
}

const browser = await shared_browser();
try {
	// ---- 1 & 2: the Dictate demo at 400 and 1920 — three sentences, one bubble ----
	for (const width of [400, 1920]){
		const page = await browser.newPage({ viewport: { width, height: 1000 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });

		await run_sentences(page);

		const bubbles = await page.locator(".ux-dictate-widget-bubbles .chatbox-you").count();
		log(`${width}: the three sentences sit in ONE bubble`, bubbles === 1, `${bubbles} bubble(s)`);
		const paragraphs = await page.locator(".ux-dictate-widget-bubbles .chatbox-you .chatbox-text").count();
		log(`${width}: that one bubble holds all three sentences`, paragraphs === 3, `${paragraphs} paragraph(s)`);

		await page.screenshot({ path: path.join(SHOTS, `dictate-demo-${width}.png`), fullPage: true });
		log(`${width}: no console/page errors`, errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 3: the ✦ sheet at 400 — opens, sends, keeps its chat across a navigation ----
	{
		const page = await browser.newPage({ viewport: { width: 400, height: 800 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });

		await page.locator(".drawer-rail-ai").click();
		await page.waitForSelector(".drawer-rail-sheet .chatbox-compose-input", { timeout: 8000 });
		log("the sheet opens with ext/Chat's own composer box", true);

		const input = page.locator(".drawer-rail-sheet .chatbox-compose-input");
		// The sheet's session is GLOBAL (`keep: true`) and this is its very first message —
		// so it is also the message that CREATES the session, which re-syncs the whole
		// thread from the (stubbed) session file (same race `warm_up()` dodges above). A
		// throw-away first message settles that once; the real one below is what gets
		// checked.
		await input.fill("warming up");
		await input.press("Enter");
		await page.waitForTimeout(1700);   // past Session.watch()'s own 1.5s poll tick
		const MSG = "can the sheet hear me";
		await input.fill(MSG);
		await input.press("Enter");
		await page.waitForSelector(".drawer-rail-sheet .chatbox-you", { timeout: 8000 }).catch(() => {});
		const sent = await page.locator(".drawer-rail-sheet .chatbox-you", { hasText: MSG }).count();
		log("the sheet sends and draws the owner's own bubble", sent === 1, `${sent} bubble(s)`);
		await page.screenshot({ path: path.join(SHOTS, "sheet-400-sent.png"), fullPage: true });

		// A real in-app navigation — clicking an internal link, never a page.goto reload —
		// the same way the owner moving around the site actually works. The Dictate
		// Overview has no `.page-crumbs` (it's too shallow), so this uses the site's own
		// home link instead — on every page, and the Router intercepts its click the same
		// way it would any other internal `<a>`.
		const home_link = page.locator('a.brand-text[href="/framework/"]').first();
		const had_link = await home_link.count() > 0;
		if (had_link){
			const before_url = page.url();
			await home_link.click();
			await page.waitForFunction(u => location.href !== u, before_url, { timeout: 8000 }).catch(() => {});
		}
		log("a real in-app navigation actually happened", had_link, had_link ? page.url() : "no home link found");
		// A navigation tears down and rebuilds the sheet's own mount, which re-syncs its
		// thread from the (stubbed) session file — give that poll a real chance, the same
		// way `Session.watch()`'s own 1.5s tick would in production.
		await page.waitForSelector(".drawer-rail-sheet .chatbox-you", { timeout: 8000 }).catch(() => {});
		const still_open = await page.locator(".drawer-rail-sheet").isVisible().catch(() => false);
		const kept = await page.locator(".drawer-rail-sheet .chatbox-you", { hasText: MSG }).count();
		log("the sheet's chat survives the navigation (never rebuilt empty)", still_open && kept === 1, `visible: ${still_open}, bubble(s): ${kept}`);
		await page.screenshot({ path: path.join(SHOTS, "sheet-400-after-nav.png"), fullPage: true });
		log("no console/page errors (sheet)", errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 4: an AI 2 card page at 1920 — its own composer still works ----
	{
		const page = await browser.newPage({ viewport: { width: 1920, height: 1100 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		const CARD = SITE + "/framework/ai2/2026/09/24/ai-dashboard/simplify-the-ai-dashboard-card/";
		await page.goto(CARD, { waitUntil: "networkidle" });
		// Scoped to the ACTIVE page column — the page stack keeps an ancestor card's own
		// `.ai2-foot` (and its composer) in the DOM too, hidden, so a bare selector here
		// waited on that hidden one and timed out.
		await page.waitForSelector(".active-page .chatbox-compose-input", { timeout: 8000 });

		const input = page.locator(".active-page .chatbox-compose-input").first();
		const send_btn = page.locator(".active-page .chatbox-compose-send").first();
		// Same session-creation race as the sheet above — a throw-away first message
		// settles it before the one this test actually checks.
		await input.fill("warming up");
		await send_btn.click();
		await page.waitForTimeout(1700);
		const MSG = "does the card composer still work";
		await input.fill(MSG);
		await send_btn.click();
		await page.waitForSelector(".active-page .chatbox-you", { timeout: 8000 }).catch(() => {});
		const sent = await page.locator(".active-page .chatbox-you", { hasText: MSG }).count();
		log("the AI 2 card's own composer still sends", sent === 1, `${sent} bubble(s)`);
		await page.screenshot({ path: path.join(SHOTS, "ai2-card-1920.png"), fullPage: true });
		log("no console/page errors (ai2 card)", errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 5: the mastermind's own ask — a voice send carries floor+cues, a typed one
	// doesn't. `ux/Dictate/chat.js`'s `deliver` has stamped `floor`/`cues` on every entry
	// since before this merge (`floor.stamp(entry)`), reading the mic's own module-level
	// state (`ux/Dictate/floor.js`) — never anything the entry itself carries. So nothing
	// about the floor depends on which composer produced the entry; this proves the new
	// one gets the same treatment the old one did. Headless Chromium has no real
	// microphone, so `floor.mic_on()` is set directly here — the exact flag a real
	// `start()` sets via `Dictate.set_state("listening")` — rather than skipping the
	// check because a real mic can't be opened.
	{
		const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
		const errors = [], bodies = [];
		track_errors(page, errors);
		await stub_servex(page, bodies);
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });

		await warm_up(page);
		bodies.length = 0;

		await page.evaluate(async () => {
			const floor = (await import("/framework/ux/Dictate/floor.js")).default;
			floor.mic_on(window.$dictate_widget.dictate);
		});
		await page.evaluate(() => window.$dictate_widget.dictate.commit("this is a voice sentence."));
		await sleep(30);
		await page.evaluate(() => window.$dictate_widget.dictate.send_screen());
		await sleep(300);
		const voice_body = bodies.at(-1);
		log("a voice send carries floor: \"speaking\"", voice_body?.floor === "speaking", JSON.stringify(voice_body));
		log("a voice send carries its cues", !!voice_body?.cues, JSON.stringify(voice_body?.cues));

		await page.fill(".ux-dictate-widget-composer .chatbox-compose-input", "this is typed.");
		await page.click(".ux-dictate-widget-composer .chatbox-compose-send");
		await sleep(300);
		const typed_body = bodies.at(-1);
		log("a typed send carries floor: \"done\"", typed_body?.floor === "done", JSON.stringify(typed_body));
		log("a typed send carries no cues", !("cues" in (typed_body ?? {})), JSON.stringify(typed_body));

		log("no console/page errors (floor/cues)", errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 6: review finding 1 — a mark survives a merge, and a mark that arrives AFTER
	// a merge still lands on the right piece (not a detached node). Two plain sentences
	// (no hedge word -> fixtures' own "ok" mark) sent back to back merge into ONE bubble
	// before `/api/hitl`'s own deliberate 180ms delay (above) lets either mark answer —
	// so both marks are guaranteed to resolve AFTER the merge that put them in the same
	// bubble, never before it.
	{
		const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });
		await warm_up(page);

		await page.evaluate(() => window.$dictate_widget.dictate.commit("The sky is blue today."));
		await sleep(30);
		await page.evaluate(() => window.$dictate_widget.dictate.send_screen());
		await sleep(80);   // well under /api/hitl's own 180ms delay — the second sentence merges before either mark answers
		await page.evaluate(() => window.$dictate_widget.dictate.commit("The grass is green too."));
		await sleep(30);
		await page.evaluate(() => window.$dictate_widget.dictate.send_screen());

		const bubbles_before_marks = await page.locator(".ux-dictate-widget-bubbles .chatbox-you").count();
		log("the two sentences merged into one bubble before either mark answered", bubbles_before_marks === 1, `${bubbles_before_marks} bubble(s)`);

		await page.waitForSelector(".ux-dictate-widget-bubbles .chatbox-mark", { timeout: 4000 }).catch(() => {});
		await sleep(200);   // both /api/hitl calls have now had time to answer
		let marks = await page.locator(".ux-dictate-widget-bubbles .chatbox-you .chatbox-mark").count();
		log("a mark that arrives AFTER the merge still lands (both pieces got one)", marks === 2, `${marks} mark(s)`);

		// A THIRD merge, after both marks already landed — review finding 1's own failure
		// mode: the old code bolted a mark onto the DOM node it had at the time, and the
		// NEXT merge's `fill()` wiped it. Both marks must still be there afterward.
		await page.evaluate(() => window.$dictate_widget.dictate.commit("The sun is warm as well."));
		await sleep(30);
		await page.evaluate(() => window.$dictate_widget.dictate.send_screen());
		await sleep(50);   // right after the merge, before the THIRD sentence's own mark has had time to answer
		marks = await page.locator(".ux-dictate-widget-bubbles .chatbox-you .chatbox-mark").count();
		log("both earlier marks survive a LATER merge (review finding 1)", marks === 2, `${marks} mark(s) right after the third sentence merged in`);

		log("no console/page errors (marks)", errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 7: review finding 2 — a streamed reply stays out of speak()'s merge, drops when
	// the real line lands (never a stale fragment), and a SECOND reply streams visibly too.
	{
		const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });

		// FIRST reply: streams, then settles.
		await page.evaluate(() => { window.$dictate_widget.stream("assistant-fast", "One"); });
		await page.evaluate(() => { window.$dictate_widget.stream("assistant-fast", "One moment"); });
		let text = await page.locator(".ux-dictate-widget-bubbles .chatbox-reply").first().innerText();
		log("the first streamed reply shows its growing text", /One moment/.test(text), JSON.stringify(text));

		const first_at = "2026-10-01T12:00:00.000Z";
		await page.evaluate(at => { window.$dictate_widget.say({ chat: { at, from: { kind: "assistant", id: "assistant-fast" }, text: "One moment, let me check." } }); }, first_at);
		await sleep(50);
		let replies = await page.locator(".ux-dictate-widget-bubbles .chatbox-reply").count();
		text = await page.locator(".ux-dictate-widget-bubbles .chatbox-reply").first().innerText();
		log("the real first reply replaces the stream (no stale fragment, no duplicate)", replies === 1 && /let me check/.test(text), `${replies} reply bubble(s): ${JSON.stringify(text)}`);

		// SECOND reply, right after the first settled: must ALSO stream visibly, as its own
		// bubble — this is the exact case review finding 2 named ("a second reply must
		// stream visibly too").
		await page.evaluate(() => { window.$dictate_widget.stream("assistant-fast", "Two"); });
		await page.evaluate(() => { window.$dictate_widget.stream("assistant-fast", "Two things"); });
		replies = await page.locator(".ux-dictate-widget-bubbles .chatbox-reply").count();
		text = await page.locator(".ux-dictate-widget-bubbles .chatbox-reply").last().innerText();
		log("a second reply streams visibly too, as its own bubble", replies === 2 && /Two things/.test(text), `${replies} reply bubble(s), last: ${JSON.stringify(text)}`);

		const second_at = "2026-10-01T12:00:05.000Z";
		await page.evaluate(at => { window.$dictate_widget.say({ chat: { at, from: { kind: "assistant", id: "assistant-fast" }, text: "Two things to check." } }); }, second_at);
		await sleep(50);
		// Both replies are the SAME sender, seconds apart — well under `MERGE_GAP_MS` (10s),
		// so they correctly merge into ONE run, as two paragraphs ("one bubble per run" is
		// the design, not a bug this test should fight). What review finding 2 actually asks
		// is that NEITHER text was lost, duplicated or left as a stale fragment: exactly two
		// paragraphs, the first and second reply's own final words, in order.
		const reply_paragraphs = await page.locator(".ux-dictate-widget-bubbles .chatbox-reply .chatbox-text").allInnerTexts();
		log("both real replies land distinct, neither lost nor duplicated", reply_paragraphs.length === 2 && /let me check/.test(reply_paragraphs[0]) && /Two things to check/.test(reply_paragraphs[1]), JSON.stringify(reply_paragraphs));

		log("no console/page errors (streaming)", errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 8: review finding 5 — the mobile ✦ rail with the mic "on", at 400px: the
	// compose row (mic, Send, ⋯, gear, now inside `.chatbox-compose-row`) must not wrap
	// badly. Headless Chromium has no microphone to actually grant, so the mic's own
	// `set_state("listening")` is called directly — the same visual state a real `start()`
	// reaches, without needing real audio (same technique item 5's own floor.mic_on() proof
	// above uses, for the same reason).
	{
		const page = await browser.newPage({ viewport: { width: 400, height: 800 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.locator(".drawer-rail-ai").click();
		await page.waitForSelector(".drawer-rail-sheet .chatbox-compose-input", { timeout: 8000 });

		await page.evaluate(() => window.$dictate_widget.dictate.set_state("listening"));
		await sleep(100);
		const listening = await page.evaluate(() => !!document.querySelector(".drawer-rail-sheet .ux-dictate-btn.listening"));
		log("the mic shows its listening state", listening);
		const no_overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
		log("the compose row doesn't wrap into horizontal overflow at 400px", no_overflow, `scrollWidth: ${await page.evaluate(() => document.documentElement.scrollWidth)}, innerWidth: ${await page.evaluate(() => window.innerWidth)}`);
		await page.screenshot({ path: path.join(SHOTS, "sheet-400-mic-on.png"), fullPage: true });

		log("no console/page errors (mic-on shot)", errors.length === 0, errors.join(" | "));
		await page.close();
	}
} finally {
	await close_browser();
}

const failed = results.filter(r => !r.ok);
fs.writeFileSync(path.join(HERE, "proof-results.json"), JSON.stringify(results, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exit(1);
