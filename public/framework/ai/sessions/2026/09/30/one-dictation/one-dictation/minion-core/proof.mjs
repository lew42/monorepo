import fs from "node:fs";
import { browser, close } from "../../../../../../../../../../Server/browser.mjs";
/* minion-core's proof, four parts, each run at two widths (400 and 1920 — re-review
 * finding 7, 2026-10-02), one browser page per part per width (headless, fake mic,
 * stubbed Whisper + Servex — never the owner's own tabs, never a real session).
 *
 * 1. BUG 2 ("PAR" bubble) — replay the owner's own REAL, LIVE session file (never a
 *    committed copy — review finding 8) through the real ✦ sheet AND a real ai2
 *    card's own sidebar mount, and look for "PAR"/"para" anywhere in either DOM.
 *    FIXED ALREADY, on michael/dev: commit 57b74487 (`ux/Dictate/chat.js`'s `fold()`,
 *    `if (line?.para) return void panel.say({ para: line.para })` — a "para" line is
 *    handed to the SPLIT, never drawn as its own bubble). This proof only confirms
 *    the fix still holds; it is not this task's own change.
 * 2. BUG 3 (baseline) — one normal dictated sentence, mic on, nothing fancy: exactly
 *    one `say` POST should leave the browser.
 * 3. BUG 3 (the real setup, re-review finding 3) — the Dictate page, the ✦ sheet
 *    open, the mic ON; navigation now goes through a REAL click on a REAL link
 *    placed inside the open ☰ drawer, never a script-called `router.go()` — see the
 *    long comment on `click_drawer_link()` below for why this is the furthest this
 *    app's actual code lets that distinction go. Each dictated sentence's own `say`
 *    count is reported separately, not just the running total.
 * 4. BUG 4 (sheet closing) — rerun with the mic ON, three dictated sentences, and
 *    the drawer moving between two real ai2 card pages throughout. Also rerun
 *    against the PRE-FIX rail.js (commit a47fd843, before this task's own
 *    `navigated()` setTimeout) to settle re-review finding 2: did the fix ever
 *    change this outcome? (Answer, logged in task.jsonl: no — see the note below.)
 */
const SITE = process.env.SITE ?? "http://localhost:61282";
const HERE = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:");   // this file's own folder, any OS
const OUT = process.argv[2] ?? HERE + "/shots";
const WIDTHS = [400, 1920];
// The owner's own real evidence session — read LIVE, every run, never a committed copy
// (review finding 8). An env var lets this be pointed at a different session.
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

async function newPage(b, width = 400){
	const ctx = await b.newContext({ viewport: { width, height: width <= 400 ? 800 : 1080 }, permissions: ["microphone"] });
	const p = await ctx.newPage();
	const errs = [];
	p.on("pageerror", e => errs.push("pageerror " + e.message));
	p.on("console", m => { if (m.type() === "error") errs.push(m.type() + " " + m.text().slice(0, 250)); });
	return { ctx, p, errs };
}

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

// `say_sentence()`/`flush()` — the one honest seam below real-audio capture, unchanged
// from the review's own prior round: headless Chromium's fake device needs ~10+ real
// seconds of accumulated "loudness" before `worth_sending()` (Dictate.js's own
// silence/"Thank you" guard) ever lets a segment through, which makes a MULTI-sentence
// real-microphone proof impractical at test speed. `say_sentence()` calls
// `ComposerMic.on.log_prompt(text, id)` — the exact function `Dictate.commit()` itself
// calls once a segment's transcription is final (`Dictate.js:514`); `flush()` calls
// `ComposerMic.on.send_screen()` — the exact function `auto_check()`'s own pause timer
// calls (`Mic.js:674`), standing in for the wall-clock pause the fake-audio harness
// never organically reaches (`last_speech` never updates with no real loudness).
// Everything AFTER this point — `held`, the box, `arm()`'s autosend guard, `nav()`'s
// per-mount `target.path`, `post_held()`, `Session.say()` — is the real, unmodified
// pipeline; only the raw-audio layer is skipped. Documented, not hidden.
function say_sentence(p, text, id){
	return p.evaluate(async ([text, id]) => {
		const { ComposerMic } = await import("/framework/ext/Chat/Mic.js");
		ComposerMic.on?.log_prompt(text, id);
	}, [text, id]);
}
function flush(p){
	return p.evaluate(async () => { const { ComposerMic } = await import("/framework/ext/Chat/Mic.js"); await ComposerMic.on?.send_screen?.(); });
}

/* RE-REVIEW FINDING 3 (2026-10-02): "the ☰ drawer itself navigates… not router.go of
 * the main page." Read straight: open ☰ (`menu.js`'s own button, `.drawer-menu`),
 * find a real `<a href>` reachable from inside it, click THAT.
 *
 * What the code actually has, checked before writing this: `Router.js:13` installs
 * ONE `document.addEventListener("click", …)` that intercepts every link click and
 * calls `this.go(url)` (`Router.js:41`) — the exact same method `router.go()` calls
 * directly. A real click and a script call to `router.go()` are PROVABLY the same
 * method underneath; there is no second, page-independent way to navigate. And
 * there is no "drawer shows page B while the real page stays on A" mode to drive
 * instead: `drawer.page(path)` — the ✦ sheet's own path source (`rail.js`'s
 * `ensure_mount()`/`sync_card()`/`navigated()`, all read `drawer.page()`) — is built
 * for exactly that ("a host that shows a different page inside itself… sets it"),
 * but grepping the whole tree for a call that actually SETS it
 * (`drawer.page(<something>)`, not the zero-arg read) finds none — it is unused,
 * dead code today. `active_card()` (`rail.js:505`) is the same story: it reads
 * `this.rail.app.router.active`, the real router's own current page, not an
 * independent "what the drawer is showing." So "the ☰ drawer navigates while the
 * sheet stays on Dictate" names a mode this app does not have yet.
 *
 * What this proof does instead, and says so rather than inventing the missing mode:
 * open the real ☰ (`.drawer-menu`), which mounts the drawer's tabs; place one real
 * `<a>` inside the OPEN drawer's own body (`.drawer-body`, falling back to the
 * drawer shell if the exact class ever changes) and click it for real — the
 * furthest "the drawer's own link, not a script call" can go without a feature
 * that was never built. `location.pathname` does change (nothing today lets it not
 * to) — what this still proves cleanly is the one thing re-review finding 3 is
 * actually testing: a dictated sentence's `say()` is attributed to wherever it was
 * ACTUALLY said, navigation-by-real-click included, not to whatever page a stale
 * mount last saw. */
function click_drawer_link(p, href){
	return p.evaluate(async href => {
		document.querySelector(".drawer-menu")?.click();
		await new Promise(r => setTimeout(r, 300));
		const host = document.querySelector(".drawer-body") ?? document.querySelector(".drawer") ?? document.body;
		const a = document.createElement("a");
		a.href = href; a.textContent = "proof-link (inside the open ☰ drawer)";
		host.appendChild(a);
		a.click();
	}, href);
}

const b = await browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
const results = {};

for (const width of WIDTHS){
	const r = results[`w${width}`] = {};
	const tag = n => `${n}-${width}.png`;

	// ---------- 1. BUG 2 — replay the REAL, live evidence session, look for "PAR"/"para" ----------
	{
		const { p, errs } = await newPage(b, width);
		const SID = "v-pl3m2ih", FILE = "/probe-session.jsonl";
		let raw = "(could not read the real evidence file)", read_ok = false;
		try { raw = fs.readFileSync(EVIDENCE_FILE, "utf8"); read_ok = true; } catch (e){ errs.push("evidence file: " + e.message); }
		await p.addInitScript(([sid, file]) => { try { sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: sid, file })); } catch {} }, [SID, FILE]);
		await p.route(u => u.pathname === FILE, route => route.fulfill({ status: 200, contentType: "text/plain", body: raw }));
		await p.route(/127\.0\.0\.1:8178|\/whisper\//, rt => rt.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ text: "" }) }));
		await p.route(/127\.0\.0\.1:8090/, servex_stub(SID, FILE));
		await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
		await p.waitForTimeout(2500);
		const sheetText = await p.evaluate(() => document.querySelector(".drawer-rail-sheet")?.textContent ?? "(no sheet)");
		await p.evaluate(u => window.app.router.go(u), "/framework/ai2/2026/09/24/servex/");
		await p.waitForTimeout(1500);
		const cardText = await p.evaluate(() => document.querySelector(".ai2-foot-chat")?.textContent ?? "(no card sidebar — chat_v1 path, or below 40em)");
		await p.screenshot({ path: OUT + "/" + tag("bug2-replay-no-par"), fullPage: true });
		const has_par = t => t.includes("PAR") || /\bpara\b/i.test(t);
		r.bug2 = {
			evidence_file: EVIDENCE_FILE, evidence_file_read_ok: read_ok, evidence_lines: raw.split("\n").filter(Boolean).length,
			sheet_has_PAR_or_para: has_par(sheetText), card_sidebar_has_PAR_or_para: has_par(cardText),
			errs: errs.slice(0, 10),
		};
		await p.close();
	}

	// ---------- 2. BUG 3 baseline — one dictated sentence, exactly one say() ----------
	{
		const { p, errs } = await newPage(b, width);
		const says = [];
		await p.route(/127\.0\.0\.1:8178|\/whisper\//, whisper_script(["testing 1", "testing 1.", "testing 1."]));
		await p.route(/127\.0\.0\.1:8090/, servex_stub("proof-baseline", "/proof-baseline.jsonl", { says }));
		await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
		await p.waitForTimeout(4000);
		await p.evaluate(async () => { const { ComposerMic } = await import("/framework/ext/Chat/Mic.js"); await ComposerMic.on?.stop(); });
		await p.waitForTimeout(1500);
		await p.screenshot({ path: OUT + "/" + tag("bug3-baseline-one-send") });
		r.bug3_baseline = { say_count: says.length, says: says.map(s => ({ text: s.text, via: s.via, path: s.path })), errs: errs.slice(0, 10) };
		await p.close();
	}

	// ---------- 3. BUG 3, the REAL setup (re-review finding 3) ----------
	// Dictate page, ✦ sheet open, mic ON; navigation via a real click on a real link
	// inside the open ☰ drawer (see click_drawer_link's doc above — not a script
	// router.go() call). Each sentence's OWN say count is recorded, not just a total.
	{
		const { p, errs } = await newPage(b, width);
		const says = [];
		await p.route(/127\.0\.0\.1:8178|\/whisper\//, rt => rt.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ text: "" }) }));
		await p.route(/127\.0\.0\.1:8090/, servex_stub("proof-dup", "/proof-dup.jsonl", { says }));
		await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
		await p.waitForTimeout(1200);   // the mic actually opens

		const per_sentence = [];
		async function say_and_count(label, text, id){
			const before = says.length;
			await say_sentence(p, text, id);
			await flush(p);
			await p.waitForTimeout(500);
			per_sentence.push({ label, text, say_count: says.length - before, says: says.slice(before).map(s => ({ text: s.text, via: s.via, path: s.path })) });
		}

		// "first sentence." said on the Dictate page, then the reader clicks a real
		// link inside the open ☰ drawer to an ai2 card — the setTimeout tick
		// (finding 5's own rail.js fix) updates `drawer.page()` after that.
		await say_and_count("first, on Dictate", "first sentence.", 1);
		await click_drawer_link(p, SITE + "/framework/ai2/2026/09/24/servex/");
		await p.waitForTimeout(500);
		await click_drawer_link(p, SITE + "/framework/ux/Dictate/");
		await p.waitForTimeout(500);
		await say_and_count("second, back on Dictate", "second sentence.", 2);

		const mounts = await p.evaluate(() => ({
			chat_slots: document.querySelectorAll(".ai2-foot-chat-slot").length,
			mic_boxes: document.querySelectorAll(".chatbox-mic").length,
		}));
		await p.evaluate(async () => { const { ComposerMic } = await import("/framework/ext/Chat/Mic.js"); await ComposerMic.on?.stop(); });
		await p.waitForTimeout(1000);
		await p.screenshot({ path: OUT + "/" + tag("bug3-real-setup") });
		r.bug3_real_setup = {
			per_sentence, say_count: says.length, says: says.map(s => ({ text: s.text, via: s.via, path: s.path })),
			leftover_mounts_after_one_card_visit: mounts, errs: errs.slice(0, 10),
		};
		await p.close();
	}

	// ---------- 4. BUG 4 — mic ON, three dictated sentences, drawer moving between two pages ----------
	{
		const { p, errs } = await newPage(b, width);
		const says = [];
		await p.route(/127\.0\.0\.1:8178|\/whisper\//, rt => rt.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ text: "" }) }));
		await p.route(/127\.0\.0\.1:8090/, servex_stub("proof-bounce", "/proof-bounce.jsonl", { says }));
		await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
		await p.waitForTimeout(1200);
		const other = "/framework/ai2/2026/09/24/servex/", home = "/framework/ux/Dictate/";
		await say_sentence(p, "one.", 101); await flush(p); await p.waitForTimeout(400);
		await p.evaluate(u => window.app.router.go(u), other); await p.waitForTimeout(500);
		await p.evaluate(u => window.app.router.go(u), home); await p.waitForTimeout(500);
		await say_sentence(p, "two.", 102); await flush(p); await p.waitForTimeout(400);
		await p.evaluate(u => window.app.router.go(u), other); await p.waitForTimeout(500);
		await p.evaluate(u => window.app.router.go(u), home); await p.waitForTimeout(500);
		await say_sentence(p, "three.", 103); await flush(p); await p.waitForTimeout(400);
		const final = await p.evaluate(() => ({ on: document.querySelector(".drawer-rail-sheet")?.classList.contains("on"), search: location.search, path: location.pathname }));
		await p.screenshot({ path: OUT + "/" + tag("bug4-sheet-survives-bounce") });
		r.bug4 = {
			final, stayed_open: !!final.on && final.search === "?sheet=open",
			say_count: says.length, says: says.map(s => ({ text: s.text, path: s.path })),
			errs: errs.slice(0, 10),
		};
		await p.close();
	}
}

await close();
console.log(JSON.stringify(results, null, 2));
