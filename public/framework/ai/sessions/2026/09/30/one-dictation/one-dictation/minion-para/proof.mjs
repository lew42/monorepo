// node public/framework/ai/2026-09-30/one-dictation/minion-para/proof.mjs
//
// Proves item 3 (the `para` marker splits a merged bubble) against the real `ux/Dictate`
// Overview demo, headless, on the worktree's own private server (started separately,
// PORT=58391 NO_WHISPER=1 node server.js — see minion-para/requirements.md's "Proof").
//
// Never calls Session.say() or any real Servex endpoint: every /api/session/* and
// /api/sessions call is stubbed (page.route) before the page loads, so nothing here can ever
// post as the owner or spawn a real agent (`minion` skill, "never-list" item 8). The three
// owner lines and the para line are fed straight into the widget's own `say()` — the exact
// shape `ux/Dictate/chat.js`'s `draw(line)` already uses for `{chat: line.chat}` (and will,
// once it is wired, for `{para: line.para}` too — `doc/chat.md`'s own note on that gap).
import { browser, close } from "../../../../../../Server/browser.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(HERE, "shots");
const BASE = process.env.BASE_URL || "http://127.0.0.1:58391";

const results = [];
const check = (name, ok) => { results.push({ name, ok }); console.log((ok ? "OK  " : "FAIL") + "  " + name); };

async function main(){
	const b = await browser();
	const ctx = await b.newContext({ viewport: { width: 400, height: 900 } });
	const page = await ctx.newPage();

	// Stub every Servex session call — a safety net; this proof never calls any of them, since
	// it drives the widget directly, but a stub means a real session could never start even if
	// something unexpected tried.
	await page.route("**/api/session/**", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, error: "stubbed for proof.mjs" }) }));
	await page.route("**/api/sessions**", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, sessions: [] }) }));

	page.on("pageerror", e => console.error("PAGE ERROR:", e.message));
	page.on("console", m => { if (m.type() === "error") console.error("CONSOLE ERROR:", m.text()); });

	await page.goto(BASE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
	await page.waitForFunction(() => !!window.$dictate_widget, { timeout: 10000 });

	// Three owner lines, close together, same sender ("owner") — mergeable() (`ext/Chat/Chat.js`)
	// joins them onto ONE bubble as long as each is within MERGE_GAP_MS (10s) of the last.
	const at1 = "2026-10-01T09:00:00.000-05:00";
	const at2 = "2026-10-01T09:00:02.000-05:00";
	const at3 = "2026-10-01T09:00:04.000-05:00";
	await page.evaluate(({ at1, at2, at3 }) => {
		const w = window.$dictate_widget;
		w.say({ chat: { at: at1, from: { kind: "owner" }, via: "voice", text: "let's talk about the budget" } });
		w.say({ chat: { at: at2, from: { kind: "owner" }, via: "voice", text: "it needs to come down ten percent" } });
		w.say({ chat: { at: at3, from: { kind: "owner" }, via: "voice", text: "actually, remind me to call the dentist" } });
	}, { at1, at2, at3 });

	const before = () => page.evaluate(() => document.querySelectorAll(".ux-dictate-widget-bubbles > .chatbox").length);
	check("three owner lines merge into one bubble", (await before()) === 1);
	await page.screenshot({ path: path.join(SHOTS, "dictate-demo-400-before.png") });

	// The para marker: the THIRD line (at3) is where the fast assistant decided a new topic
	// started — `re` names that line's own `at`, the exact shape Sessions.js writes
	// (`{"para": {"at", "re"}}`) and `Session.entry()` passes through as `{type:"para", re}`.
	await page.evaluate(({ at3 }) => {
		window.$dictate_widget.say({ para: { at: "2026-10-01T09:00:05.000-05:00", re: at3 } });
	}, { at3 });

	const after = () => page.evaluate(() => document.querySelectorAll(".ux-dictate-widget-bubbles > .chatbox").length);
	check("the para marker splits it into two bubbles", (await after()) === 2);

	const second_text = await page.evaluate(() => {
		const bubbles = [...document.querySelectorAll(".ux-dictate-widget-bubbles > .chatbox")];
		return bubbles[1]?.textContent ?? "";
	});
	check("the second bubble holds only the third sentence", second_text.includes("dentist") && !second_text.includes("budget"));

	const first_text = await page.evaluate(() => {
		const bubbles = [...document.querySelectorAll(".ux-dictate-widget-bubbles > .chatbox")];
		return bubbles[0]?.textContent ?? "";
	});
	check("the first bubble keeps the first two sentences", first_text.includes("budget") && first_text.includes("ten percent") && !first_text.includes("dentist"));

	await page.screenshot({ path: path.join(SHOTS, "dictate-demo-400-after.png") });

	// A whole-file redraw from line 0 (`sync()` in a real mount; here, a fresh reset()+replay
	// through the SAME two say() calls, same order) must give back the same two-bubble picture —
	// `doc/chat.md`'s own requirement on this.
	await page.evaluate(({ at1, at2, at3 }) => {
		const w = window.$dictate_widget;
		w.reset();
		w.say({ chat: { at: at1, from: { kind: "owner" }, via: "voice", text: "let's talk about the budget" } });
		w.say({ chat: { at: at2, from: { kind: "owner" }, via: "voice", text: "it needs to come down ten percent" } });
		w.say({ chat: { at: at3, from: { kind: "owner" }, via: "voice", text: "actually, remind me to call the dentist" } });
		w.say({ para: { at: "2026-10-01T09:00:05.000-05:00", re: at3 } });
	}, { at1, at2, at3 });
	const replayed = await page.evaluate(() => document.querySelectorAll(".ux-dictate-widget-bubbles > .chatbox").length);
	check("a whole-file redraw from line 0 gives back the same picture (two bubbles)", replayed === 2);
	await page.screenshot({ path: path.join(SHOTS, "dictate-demo-400-replayed.png") });

	await ctx.close();
	await close();

	const failed = results.filter(r => !r.ok);
	console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
	if (failed.length){ console.error("FAILED:", failed.map(f => f.name)); process.exitCode = 1; }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
