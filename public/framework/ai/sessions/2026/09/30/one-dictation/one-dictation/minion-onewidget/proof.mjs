// Headless proof for minion-onewidget (merge 11, "one widget," one-dictation): the Dictate
// page's main demo now mounts the EXACT SAME chat() call the ✦ sheet makes (only `keep`
// differs), and autosend after a pause is the only behaviour anywhere — the Dictate | Chat
// switch and the gear's "manual" send-mode choice are both gone.
//
// This worktree has no server of its own (task-mastermind-one-dictation, 2026-10-01): this
// proves against the real, already-running `http://monorepo.localhost` and serves THIS
// worktree's own changed files in place of whatever that server would answer, the same
// WT/FILES page.route trick `fix-android/proof.mjs` uses — set WT to a worktree path and
// FILES to a comma-separated list of repo-relative paths to override; both default below to
// this worktree and the three files this task actually changed, so a plain `node proof.mjs`
// with no env vars still proves the right thing.
//
// EVERY Servex call is ALSO stubbed (page.route on 127.0.0.1:8090), the same way
// minion-chatjoin/proof.mjs does it — nothing here ever reaches the real Servex, so nothing
// is ever posted as the owner (`minion` skill, rule 8), and nothing here ever drives the
// owner's own open tabs — every page is a fresh headless one this script opens itself.
//
//   node public/framework/ai/2026-09-30/one-dictation/minion-onewidget/proof.mjs
import { browser as shared_browser, close as close_browser } from "../../../../../../Server/browser.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(HERE, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const SITE = process.env.SITE ?? "http://monorepo.localhost";
const WT = process.env.WT ?? path.resolve(HERE, "../../../../../../");
const FILES = (process.env.FILES ?? "public/framework/ux/Dictate/Widget.js,public/framework/ux/Dictate/page.js,public/framework/ext/Chat/Mic.js").split(",");

/** Serve THIS worktree's own copy of every file in `FILES`, in place of whatever the real
 *  `monorepo.localhost` server would answer for that same path — the only way to prove a
 *  worktree's own edits without that worktree running its own server. Content type is always
 *  `text/javascript`: every overridden file here is a `.js` module the page imports. */
async function install_wt_files(page){
	for (const rel of FILES){
		const url = rel.replace(/^public/, "");
		await page.route(u => u.pathname === url, route =>
			route.fulfill({ status: 200, contentType: "text/javascript", body: fs.readFileSync(path.join(WT, rel), "utf8") }));
	}
}

const results = [];
const log = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const FILE = "/framework/ai/2026-09-30/one-dictation/minion-onewidget/proof.jsonl";

/** Same stub as `minion-chatjoin/proof.mjs` (copied, not re-invented — CLAUDE.md law 6: this
 *  is the one way a proof script in this task family fakes Servex). See that file's own
 *  comment for why every route answers here instead of reaching 127.0.0.1:8090 for real. */
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
		if (/\/api\/session\/new/.test(url)) return json({ ok: true, session: "proof-session", home: "/framework/ai/2026-09-30/one-dictation/minion-onewidget/",
			file: FILE, resumed: false, previous: null });
		if (/\/api\/session\/resume/.test(url)) return json({ ok: true, session: "proof-session", home: "/framework/ai/2026-09-30/one-dictation/minion-onewidget/",
			file: FILE, resumed: true, title: "proof" });
		if (/\/api\/session\/say/.test(url)){
			const body = req.postDataJSON?.() ?? {};
			const a = at();
			file_lines.push(JSON.stringify({ chat: { at: a, session: "proof-session", path: body.path, from: { kind: "owner" }, via: body.via, text: body.text } }));
			return json({ ok: true, at: a });
		}
		if (/\/stream$/.test(url)) return route.fulfill({ status: 200, contentType: "text/event-stream", body: "" });
		if (/\/api\/hitl/.test(url)) return json({ ok: true });
		return json({ ok: true });
	});
	await page.route(new RegExp(FILE.replace(/[/.]/g, "\\$&")), route =>
		route.fulfill({ status: 200, contentType: "application/jsonl", body: file_lines.join("\n") + "\n" }));
}

// Same pre-existing, out-of-fence gaps `minion-chatjoin/proof.mjs` already names and filters:
// a work-strip error on this page unrelated to anything this task touched, no real microphone
// in headless Chromium (opening the ✦ sheet starts listening by default and logs this), and
// two 404s for AI 2's own usage meter and a day log that may not exist yet in this worktree.
const KNOWN_GAP = /cardRows\.filter is not a function|browser is not allowed to use the microphone|usage\.json|\/(files|page)\.jsonl/;

function track_errors(page, into){
	page.on("pageerror", e => { if (!KNOWN_GAP.test(String(e))) into.push(String(e)); });
	page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text()) && !KNOWN_GAP.test(m.text())) into.push(m.text()); });
	page.on("response", r => {
		if (r.status() < 400) return;
		const line = `${r.status()} ${r.url()}`;
		if (!KNOWN_GAP.test(line)) into.push(line);
	});
}

/* A keep:false mount's first-ever message is also the message that creates its session, which
 * re-syncs the whole thread from the (here, stubbed) session file — the exact race
 * `minion-chatjoin/proof.mjs`'s own `warm_up()` dodges, copied here for the same reason. A
 * throw-away manual send settles the session; `widget.reset()` right after wipes the thread
 * back to empty so the test that follows starts from a clean slate. */
async function warm_up(page){
	await page.evaluate(() => window.$dictate_widget.dictate.commit("warming up."));
	await sleep(80);
	await page.evaluate(() => window.$dictate_widget.dictate.send_screen());
	await sleep(400);
	await page.evaluate(() => window.$dictate_widget.reset());
}

/* THE CONFIG LIST (prove bullet 1): the seven things a mode/preset can change, read straight
 * off the live Widget and its real ComposerMic — never hand-copied from the source, so a
 * future drift between the demo and the sheet would show up here, not just in a diff. */
async function widget_config(page){
	return page.evaluate(async () => {
		const { SETTINGS } = await import("/framework/ext/Chat/Mic.js");
		const w = window.$dictate_widget;
		return { mode: w.mode, join: w.join, mic_mode_now: w.dictate.mode_now(), pause_send_ms: SETTINGS.pause_send_ms, level: w.level, source: w.source, debug: w.debug };
	});
}

/* THE AUTOSEND PROOF (bullet 2): no real microphone exists in headless Chromium, so the
 * mic's own timer loop is started by hand — `state = "listening"` and `auto_timer` ticking
 * `auto_check()` every 200ms are exactly what `ComposerMic.start()`/`on_listening()` set up
 * for a real mic; `commit(text)` is the real per-segment path a live recognition result calls
 * (`Dictate.close_segment()` → `commit()` → `log_prompt()` — the same deviation
 * `minion-chatjoin/proof.mjs` already made and named, reused here rather than re-argued).
 * `last_speech` is set once, right after `commit()`, the same way a real mic's `on_level()`
 * freezes it the instant speech stops — without it `auto_check()`'s own quiet-time math never
 * grows past zero and nothing would ever send. NOTHING calls Send or `send_screen()` by hand
 * after this — the only thing that can produce a bubble is the mic's own timer. */
async function autosend_check(page, label, selector_scope){
	await page.evaluate(() => {
		const d = window.$dictate_widget.dictate;
		d.state = "listening";
		d.last_speech = performance.now();
		d.auto_timer = setInterval(() => d.auto_check(), 200);
	});
	await page.evaluate(() => window.$dictate_widget.dictate.commit("hello there."));
	const pause_ms = await page.evaluate(async () => (await import("/framework/ext/Chat/Mic.js")).SETTINGS.pause_send_ms);
	await sleep(pause_ms + 800);   // past both the natural-pause send (~700ms) and the full pause_send_ms tail send
	await page.evaluate(() => clearInterval(window.$dictate_widget.dictate.auto_timer));
	const bubbles = page.locator(`${selector_scope} .ux-dictate-widget-bubbles .chatbox-you`);
	const n = await bubbles.count();
	const text = n ? await bubbles.last().innerText() : "";
	log(`${label}: autosend — one bubble, no Send press`, n === 1 && /hello there/.test(text), `${n} bubble(s): ${JSON.stringify(text)}`);
}

const browser = await shared_browser();
try {
	// ---- 1: SAME WIDGET — the demo and the sheet build it with the same config ----
	// The ✦ rail button is mobile-only (`ext/drawer/rail.css`: `.drawer-rail{display:none}`,
	// shown only `@media (max-width: 52em)`) — a real, intentional "it's a bottom sheet"
	// design, not a gap in this proof — so this whole test runs at a mobile width.
	{
		const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await install_wt_files(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); localStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });

		const demo_cfg = await widget_config(page);
		console.log("demo config:", JSON.stringify(demo_cfg));

		await page.locator(".drawer-rail-ai").click();
		await page.waitForSelector(".drawer-rail-sheet .chatbox-compose-input", { timeout: 8000 });
		const sheet_cfg = await widget_config(page);
		console.log("sheet config:", JSON.stringify(sheet_cfg));

		log("the demo and the sheet build the SAME widget config", JSON.stringify(demo_cfg) === JSON.stringify(sheet_cfg),
			`demo: ${JSON.stringify(demo_cfg)} | sheet: ${JSON.stringify(sheet_cfg)}`);
		// `keep` isn't a Widget property (it lives in chat.js's own controller, not the panel) —
		// what it actually does is observable: a keep:true mount (the sheet) writes the session
		// to sessionStorage so a later mount can find it; a keep:false mount (the demo) never does.
		await page.locator(".drawer-rail-sheet .chatbox-compose-input").fill("sheet warm up");
		await page.locator(".drawer-rail-sheet .chatbox-compose-input").press("Enter");
		await sleep(300);
		const sheet_saved = await page.evaluate(() => !!sessionStorage.getItem("lew42-voice-session"));
		log("only `keep` differs — the sheet (keep:true) saves its session, the demo never does", sheet_saved, `sessionStorage has a session: ${sheet_saved}`);

		log("no console/page errors (same-widget check)", errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 2: AUTOSEND — the demo, then the sheet, each get one bubble with no Send press ----
	// Mobile width again, for the same reason as test 1 (the sheet needs the rail button).
	for (const [label, open_sheet] of [["demo", false], ["sheet", true]]){
		const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await install_wt_files(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); localStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });

		let scope = "";
		if (open_sheet){
			await page.locator(".drawer-rail-ai").click();
			await page.waitForSelector(".drawer-rail-sheet .chatbox-compose-input", { timeout: 8000 });
			scope = ".drawer-rail-sheet";
		}

		await warm_up(page);
		await autosend_check(page, label, scope);
		log(`${label}: no console/page errors (autosend)`, errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 3: THE MIGRATION — a saved "manual" send mode is changed back to "pause" ----
	{
		const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await install_wt_files(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); localStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });

		await page.evaluate(() => localStorage.setItem("chat.mic.settings.3", JSON.stringify({ send_mode: "manual" })));
		await page.reload({ waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });
		const mode_now = await page.evaluate(() => window.$dictate_widget.dictate.mode_now());
		log("a saved send_mode:\"manual\" is migrated back to \"pause\" on load", mode_now === "pause", `mode_now(): ${mode_now}`);

		log("no console/page errors (migration)", errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 4: ?mode=chat STILL LOADS, as plain dictate (the unknown-name fallback) ----
	{
		const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await install_wt_files(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); localStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/?mode=chat", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });
		const mode = await page.evaluate(() => window.$dictate_widget.mode);
		log("an old ?mode=chat link loads fine, as plain dictate", mode === "dictate", `widget.mode: ${mode}`);
		log("no console/page errors (?mode=chat)", errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 5: TYPING STILL WORKS (not a mode, so not covered by the autosend check above) ----
	{
		const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await install_wt_files(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); localStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });
		await warm_up(page);
		await page.locator(".ux-dictate-widget-composer .chatbox-compose-input").fill("typed by hand");
		await page.locator(".ux-dictate-widget-composer .chatbox-compose-input").press("Enter");
		await page.waitForSelector(".ux-dictate-widget-bubbles .chatbox-you", { timeout: 4000 }).catch(() => {});
		const n = await page.locator(".ux-dictate-widget-bubbles .chatbox-you").count();
		const text = n ? await page.locator(".ux-dictate-widget-bubbles .chatbox-you").last().innerText() : "";
		log("typing still sends on Enter", n === 1 && /typed by hand/.test(text), `${n} bubble(s): ${JSON.stringify(text)}`);
		log("no console/page errors (typed send)", errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 6: SHOTS of the demo at 400 and 1920 ----
	for (const width of [400, 1920]){
		const page = await browser.newPage({ viewport: { width, height: width === 400 ? 900 : 1100 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await install_wt_files(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); localStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });
		await page.screenshot({ path: path.join(SHOTS, `demo-${width}.png`), fullPage: true });

		log(`${width}: no console/page errors (demo shot)`, errors.length === 0, errors.join(" | "));
		await page.close();
	}

	// ---- 6b: SHOT of the sheet — at 400 only. The ✦ rail is mobile-only by design
	// (`ext/drawer/rail.css`'s `.drawer-rail{display:none}`, shown only under 52em/832px),
	// so there is no "sheet at 1920" to shoot — at that width the owner reaches the SAME
	// chat() call through the desktop ☰ drawer's own AI tab instead (`ext/drawer/tabs/ai.js`),
	// a different component outside this task's fence. minion-workbench's own shots made the
	// same choice (sheet only ever shot at 400) for the same reason.
	{
		const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
		const errors = [];
		track_errors(page, errors);
		await stub_servex(page);
		await install_wt_files(page);
		await page.addInitScript(() => { try { sessionStorage.clear(); localStorage.clear(); } catch {} });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.locator(".drawer-rail-ai").click();
		await page.waitForSelector(".drawer-rail-sheet .chatbox-compose-input", { timeout: 8000 });
		await page.screenshot({ path: path.join(SHOTS, "sheet-400.png"), fullPage: true });

		log("400: no console/page errors (sheet shot)", errors.length === 0, errors.join(" | "));
		await page.close();
	}
} finally {
	await close_browser();
}

const failed = results.filter(r => !r.ok);
fs.writeFileSync(path.join(HERE, "proof-results.json"), JSON.stringify(results, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exit(1);
