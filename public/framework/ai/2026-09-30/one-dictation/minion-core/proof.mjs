import fs from "node:fs";
import { browser, close } from "../../../../../../Server/browser.mjs";
/* minion-core's proof, four parts, one browser each (headless, 400x800, fake mic,
 * stubbed Whisper + Servex — never the owner's own tabs, never a real session).
 * Review pass (a47fd843, 2026-10-02) asked for the real setups, not smaller
 * stand-ins — see the notes on each part below for what changed and why.
 *
 * 1. BUG 2 ("PAR" bubble) — replay the owner's own REAL, LIVE session file (never
 *    a committed copy — review finding 8) through the real ✦ sheet AND a real ai2
 *    card's own sidebar mount, and look for "PAR"/"para" anywhere in either DOM.
 * 2. BUG 3 (baseline) — one normal dictated sentence, mic on, nothing fancy:
 *    exactly one `say` POST should leave the browser.
 * 3. BUG 3 (the real setup, review findings 1/2) — the Dictate page, the ✦ sheet
 *    open, the mic ON, a real `router.go` to a real ai2 card, back to Dictate,
 *    then dictate again: counts every `say` POST and reports any leftover
 *    `.ai2-foot-chat-slot` / `.chatbox-mic` DOM left mounted by the card visit.
 * 4. BUG 4 (sheet closing) — rerun with the mic ON, three dictated sentences, and
 *    the drawer moving between two real ai2 card pages throughout (review finding 4
 *    — the earlier proof had the mic off and said nothing).
 */
const SITE = process.env.SITE ?? "http://localhost:61282";
const HERE = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:");   // this file's own folder, any OS
const OUT = process.argv[2] ?? HERE + "/shots";
// The owner's own real evidence session — read LIVE, every run, never a committed copy
// (review finding 8: a copy made once goes stale the moment Servex appends to the real
// file, and a frozen copy can drift from what it claims to prove). An env var lets this
// be pointed at a different session without editing the script.
const EVIDENCE_FILE = process.env.EVIDENCE_FILE
	?? "C:/Code/lew42/monorepo/public/framework/ai/2026/10/01/remote-access-install-tailscale-on-pc-an/ai/v-pl3m2ih.jsonl";

function servex_stub(session_id, file_route, extra = {}){
	return async route => {
		const req = route.request(), url = req.url();
		const json = o => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(o) });
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
		if (/\/api\/sessions\?/.test(url)) return json({ ok: true, sessions: [] });
		if (/\/api\/session\/(new|resume)/.test(url)) return json({ ok: true, session: session_id, home: "/framework/ux/Dictate/", file: file_route, resumed: true });
		if (/\/api\/session\/say/.test(url)){ extra.says?.push({ at: new Date().toISOString(), ...(req.postDataJSON?.() ?? {}) }); return json({ ok: true, at: new Date().toISOString() }); }
		if (/\/stream/.test(url)) return route.fulfill({ status: 200, contentType: "text/event-stream", body: "" });
		return json({ ok: true, at: new Date().toISOString() });
	};
}

async function newPage(b){
	const ctx = await b.newContext({ viewport: { width: 400, height: 800 }, permissions: ["microphone"] });
	const p = await ctx.newPage();
	const errs = [];
	p.on("pageerror", e => errs.push("pageerror " + e.message));
	p.on("console", m => { if (m.type() === "error") errs.push(m.type() + " " + m.text().slice(0, 250)); });
	return { ctx, p, errs };
}

// Feed finished whisper "final" results, one per POST, in order; after the list is
// exhausted every further POST answers empty (silence) — the real stub `ux/Dictate`
// talks to in dev.
function whisper_script(sentences){
	let n = 0;
	return async route => {
		const req = route.request();
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
		if (req.method() === "POST"){
			const text = sentences[n] ?? "";
			n++;
			return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ text }) });
		}
		return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true }) });
	};
}

const b = await browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
const results = {};

// ---------- 1. BUG 2 — replay the REAL, live evidence session, look for "PAR"/"para" ----------
{
	const { p, errs } = await newPage(b);
	const SID = "v-pl3m2ih", FILE = "/probe-session.jsonl";
	let raw = "(could not read the real evidence file)", read_ok = false;
	try { raw = fs.readFileSync(EVIDENCE_FILE, "utf8"); read_ok = true; } catch (e){ errs.push("evidence file: " + e.message); }
	await p.addInitScript(([sid, file]) => { try { sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: sid, file })); } catch {} }, [SID, FILE]);
	await p.route(u => u.pathname === FILE, route => route.fulfill({ status: 200, contentType: "text/plain", body: raw }));
	await p.route(/127\.0\.0\.1:8178|\/whisper\//, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ text: "" }) }));
	await p.route(/127\.0\.0\.1:8090/, servex_stub(SID, FILE));
	await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
	await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
	await p.waitForTimeout(2500);
	const sheetText = await p.evaluate(() => document.querySelector(".drawer-rail-sheet")?.textContent ?? "(no sheet)");
	// The ☰ drawer AI tab and an ai2 card's own sidebar mount (review finding 3: every
	// surface that draws a `para` line, not just the sheet) — same mount_chat(), same
	// GLOBAL session, so the replay already in sessionStorage is still the one it reads.
	await p.evaluate(u => window.app.router.go(u), "/framework/ai2/2026/09/24/servex/");
	await p.waitForTimeout(1500);
	const cardText = await p.evaluate(() => document.querySelector(".ai2-foot-chat")?.textContent ?? "(no card sidebar — chat_v1 path, or below 40em)");
	await p.screenshot({ path: OUT + "/bug2-replay-no-par-400.png", fullPage: true });
	const has_par = t => t.includes("PAR") || /\bpara\b/i.test(t);
	results.bug2 = {
		evidence_file: EVIDENCE_FILE, evidence_file_read_ok: read_ok, evidence_lines: raw.split("\n").filter(Boolean).length,
		sheet_has_PAR_or_para: has_par(sheetText), card_sidebar_has_PAR_or_para: has_par(cardText),
		errs: errs.slice(0, 10),
	};
	await p.close();
}

// ---------- 2. BUG 3 baseline — one dictated sentence, exactly one say() ----------
{
	const { p, errs } = await newPage(b);
	const says = [];
	await p.route(/127\.0\.0\.1:8178|\/whisper\//, whisper_script(["testing 1", "testing 1.", "testing 1."]));
	await p.route(/127\.0\.0\.1:8090/, servex_stub("proof-baseline", "/proof-baseline.jsonl", { says }));
	await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
	await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
	await p.waitForTimeout(4000);
	await p.evaluate(async () => { const { ComposerMic } = await import("/framework/ext/Chat/Mic.js"); await ComposerMic.on?.stop(); });
	await p.waitForTimeout(1500);
	await p.screenshot({ path: OUT + "/bug3-baseline-one-send-400.png" });
	results.bug3_baseline = { say_count: says.length, says: says.map(s => ({ text: s.text, via: s.via, path: s.path })), errs: errs.slice(0, 10) };
	await p.close();
}

// ---------- 3. BUG 3, the REAL setup (review findings 1/2) ----------
// Dictate page, ✦ sheet open, mic ON; a real `router.go` to a real ai2 card; back to
// Dictate; dictate again. Counts every `say` POST for TWO sentences actually said —
// it must be exactly 2, not 3 or 4 — and reports what the card visit left mounted.
// `say_sentence()` calls `ComposerMic.on.log_prompt(text, id)` directly — the exact
// function `Dictate.commit()` itself calls once a segment's transcription is final
// (`Dictate.js:514`). This is the one honest seam below real-audio capture: headless
// Chromium's fake device needs ~10+ real seconds of accumulated "loudness" before
// `worth_sending()` (Dictate.js:601, the silence/"Thank you" guard) ever lets a segment
// through at all, which makes a MULTI-sentence, real-microphone proof impractical at
// test speed. Everything AFTER this point — `held`, the box, `arm()`'s autosend guard,
// `auto_check()`'s own pause timer, `post_held()`, `Session.say()` — is the real,
// unmodified pipeline; only the raw-audio layer is skipped. Documented, not hidden.
function say_sentence(p, text, id){
	return p.evaluate(async ([text, id]) => {
		const { ComposerMic } = await import("/framework/ext/Chat/Mic.js");
		ComposerMic.on?.log_prompt(text, id);
	}, [text, id]);
}
// Forces out whatever is on screen right now, the same function `auto_check()`'s own
// pause timer calls on its own (`Mic.js:674`) — used here instead of waiting on the
// wall clock because headless fake-audio never reports real "loudness", so `last_speech`
// never updates and the real pause timer never sees quiet time pass (confirmed empirically
// — waiting never sent anything on its own in this harness). The mic stays "listening"
// throughout; this does not stop it, exactly like a real natural-pause send doesn't.
function flush(p){
	return p.evaluate(async () => { const { ComposerMic } = await import("/framework/ext/Chat/Mic.js"); await ComposerMic.on?.send_screen?.(); });
}

{
	const { p, errs } = await newPage(b);
	const says = [];
	await p.route(/127\.0\.0\.1:8178|\/whisper\//, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ text: "" }) }));
	await p.route(/127\.0\.0\.1:8090/, servex_stub("proof-dup", "/proof-dup.jsonl", { says }));
	await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
	await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
	await p.waitForTimeout(1200);   // the mic actually opens
	// "first sentence." is said on the Dictate page, then the reader navigates to a real
	// ai2 card BEFORE it is sent — exactly the review's own setup — and the flush happens
	// AFTER arriving there, so this also proves the path attribution finding 5 fixed.
	await say_sentence(p, "first sentence.", 1);
	await p.evaluate(u => window.app.router.go(u), "/framework/ai2/2026/09/24/servex/");
	await p.waitForTimeout(300);   // the rail.js setTimeout tick (finding 5) that updates `drawer.page()`
	await flush(p);
	await p.waitForTimeout(500);
	await p.evaluate(u => window.app.router.go(u), "/framework/ux/Dictate/");
	await p.waitForTimeout(300);
	await say_sentence(p, "second sentence.", 2);
	await flush(p);
	await p.waitForTimeout(500);
	const mounts = await p.evaluate(() => ({
		chat_slots: document.querySelectorAll(".ai2-foot-chat-slot").length,
		mic_boxes: document.querySelectorAll(".chatbox-mic").length,
	}));
	await p.evaluate(async () => { const { ComposerMic } = await import("/framework/ext/Chat/Mic.js"); await ComposerMic.on?.stop(); });
	await p.waitForTimeout(1000);
	await p.screenshot({ path: OUT + "/bug3-real-setup-400.png" });
	results.bug3_real_setup = {
		say_count: says.length, says: says.map(s => ({ text: s.text, via: s.via, path: s.path })),
		leftover_mounts_after_one_card_visit: mounts, errs: errs.slice(0, 10),
	};
	await p.close();
}

// ---------- 4. BUG 4 — mic ON, three dictated sentences, drawer moving between two pages ----------
{
	const { p, errs } = await newPage(b);
	const says = [];
	await p.route(/127\.0\.0\.1:8178|\/whisper\//, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ text: "" }) }));
	await p.route(/127\.0\.0\.1:8090/, servex_stub("proof-bounce", "/proof-bounce.jsonl", { says }));
	await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
	await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
	await p.waitForTimeout(1200);
	// Three sentences, the drawer moving between two real pages between each one — the
	// sheet must stay open and the mic must stay on through all of it (review finding 4:
	// the earlier proof had the mic off and dictated nothing, so it proved nothing).
	const other = "/framework/ai2/2026/09/24/servex/", home = "/framework/ux/Dictate/";
	await say_sentence(p, "one.", 101);
	await flush(p);
	await p.waitForTimeout(400);
	await p.evaluate(u => window.app.router.go(u), other);
	await p.waitForTimeout(500);
	await p.evaluate(u => window.app.router.go(u), home);
	await p.waitForTimeout(500);
	await say_sentence(p, "two.", 102);
	await flush(p);
	await p.waitForTimeout(400);
	await p.evaluate(u => window.app.router.go(u), other);
	await p.waitForTimeout(500);
	await p.evaluate(u => window.app.router.go(u), home);
	await p.waitForTimeout(500);
	await say_sentence(p, "three.", 103);
	await flush(p);
	await p.waitForTimeout(400);
	const final = await p.evaluate(() => ({ on: document.querySelector(".drawer-rail-sheet")?.classList.contains("on"), search: location.search, path: location.pathname }));
	await p.screenshot({ path: OUT + "/bug4-sheet-survives-bounce-400.png" });
	results.bug4 = {
		final, stayed_open: !!final.on && final.search === "?sheet=open",
		say_count: says.length, says: says.map(s => ({ text: s.text, path: s.path })),
		errs: errs.slice(0, 10),
	};
	await p.close();
}

await close();
console.log(JSON.stringify(results, null, 2));
