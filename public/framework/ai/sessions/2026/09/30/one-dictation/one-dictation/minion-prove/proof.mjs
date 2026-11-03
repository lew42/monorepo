// Headless proof for minion-prove (one-dictation, 2026-10-01): proves or disproves the
// owner's 7 checks (requirements.md) against the LIVE main-tree site, http://monorepo.localhost —
// NOT a worktree, because the brief says these fixes are "live... now, uncommitted" and this
// minion changes no code. Every Servex call is stubbed (page.route on 127.0.0.1:8090), so
// nothing here ever posts as the owner (`minion` skill, rule 8). No owner tab is driven —
// every page is a fresh headless one, through the one shared browser in `Server/browser.mjs`.
//
//   node public/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-prove/proof.mjs
import { browser as shared_browser, close as close_browser } from "../../../../../../../../../../Server/browser.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(HERE, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const SITE = "http://monorepo.localhost";
const FILE = "/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-prove/proof.jsonl";

const results = [];
const log = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Wrap one check so a thrown error becomes a FAIL line instead of killing every check
 *  after it (ui-test skill's own lesson: a hand-rolled probe that dies on one throw loses
 *  the whole run). */
async function safe(name, fn){
	try { await fn(); }
	catch (e){ log(name, false, "THREW: " + (e?.stack ?? e)); }
}

// Same filter minion-chatjoin/proof.mjs uses: real, pre-existing gaps on this page that have
// nothing to do with any of the 7 checks under test here (the "what's in flight" strip's own
// known bug, headless Chromium having no real mic to grant for a demo that ALSO starts
// listening by default, and a couple of 404s for files that don't exist in this exact
// worktree state). Filtered, not hidden — if a NEW error appears it still fails the run.
const KNOWN_GAP = /cardRows\.filter is not a function|browser is not allowed to use the microphone|usage\.json|permission is not defined at/;

function track_errors(page, into){
	page.on("pageerror", e => { if (!KNOWN_GAP.test(String(e))) into.push(String(e)); });
	page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text()) && !KNOWN_GAP.test(m.text())) into.push(m.text()); });
	page.on("response", r => { if (r.status() >= 400 && !KNOWN_GAP.test(`${r.status()} ${r.url()}`)) into.push(`${r.status()} ${r.url()}`); });
}

/** The same Servex stub minion-chatjoin uses, extended with `queue_reply()` so a check can
 *  make an assistant line arrive through BOTH channels `ux/Dictate/chat.js` listens on at
 *  once: the file poll (`Session.watch()`, every 1.5s) and the SSE push (`Session.stream()`).
 *  The `/stream` route deliberately HOLDS the response open (polling a local flag every
 *  50ms, not a real network wait) until `queue_reply()` sets one, so the SSE delivery and the
 *  file-poll delivery of the SAME line are never far apart — exactly the race the owner's
 *  own bug report described ("both messages... added twice"). */
async function stub_servex(page){
	let n = 0, file_lines = [];
	const at = () => new Date(Date.now() + (n++)).toISOString();
	let pending_sse = null;
	await page.route(/127\.0\.0\.1:8090/, async route => {
		const req = route.request(), url = req.url();
		const json = o => route.fulfill({ status: 200, contentType: "application/json",
			headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(o) });
		if (req.method() === "OPTIONS")
			return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
		if (/\/api\/sessions\?/.test(url)) return json({ ok: true, sessions: [] });
		if (/\/api\/session\/new/.test(url)) return json({ ok: true, session: "proof-session",
			home: "/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-prove/", file: FILE, resumed: false, previous: null });
		if (/\/api\/session\/resume/.test(url)) return json({ ok: true, session: "proof-session",
			home: "/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-prove/", file: FILE, resumed: true, title: "proof" });
		if (/\/api\/session\/say/.test(url)){
			const body = req.postDataJSON?.() ?? {};
			const a = at();
			file_lines.push(JSON.stringify({ chat: { at: a, session: "proof-session", path: body.path, from: { kind: "owner" }, via: body.via, text: body.text } }));
			return json({ ok: true, at: a });
		}
		if (/\/stream$/.test(url)){
			const deadline = Date.now() + 3000;
			while (!pending_sse && Date.now() < deadline) await sleep(40);
			const body = pending_sse ? `data: ${JSON.stringify({ kind: "line", line: { chat: pending_sse } })}\n\n` : "";
			pending_sse = null;   // each connection (first load or a reconnect) only ever gets ONE queued line
			return route.fulfill({ status: 200, contentType: "text/event-stream", body });
		}
		if (/\/api\/hitl/.test(url)) return json({ ok: true });
		return json({ ok: true });
	});
	await page.route(new RegExp(FILE.replace(/[/.]/g, "\\$&")), route =>
		route.fulfill({ status: 200, contentType: "application/jsonl", body: file_lines.join("\n") + "\n" }));
	return {
		/** Puts the SAME assistant line into the polled file AND the held SSE response at
		 *  once — the two-channel race item 1 of the brief asks to prove was fixed. */
		queue_reply(text, from = "assistant-fast"){
			const a = at();
			const line = { at: a, session: "proof-session", from: { kind: "assistant", id: from }, text };
			file_lines.push(JSON.stringify({ chat: line }));
			pending_sse = line;
			return a;
		},
	};
}

async function new_page(browser, { width, height = 900 } = {}){
	const page = await browser.newPage({ viewport: { width, height } });
	const errors = [];
	track_errors(page, errors);
	const stub = await stub_servex(page);
	await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
	return { page, errors, stub };
}

const osc_wrap = () => {
	window.__osc = [];
	const orig = AudioContext.prototype.createOscillator;
	AudioContext.prototype.createOscillator = function (...a){
		window.__osc.push(Date.now());
		return orig.apply(this, a);
	};
};

const browser = await shared_browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
try {

	// ================= CHECK 1 — No duplicates (checklist item 1) =================
	// One typed send draws ONE bubble (the mount's own echo, deduped against the file poll
	// by `own_ats`), and one assistant reply delivered through BOTH the SSE push and the file
	// poll draws ONE bubble too (`seen_chat` — the fix for "both messages... added twice...
	// four messages total"). Proved on the demo (`keep:false`) AND the ✦ sheet (`keep:true`),
	// because the brief asks for both surfaces.
	async function duplicates_check(label, build_mount){
		const { page, errors, stub } = await new_page(browser, { width: 400 });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		const input_sel = await build_mount(page);

		await page.fill(input_sel, "warming up");
		await page.keyboard.press("Enter");
		await sleep(1700);   // past Session.watch()'s own 1.5s poll tick, so the session really exists

		const OWN_MSG = "this is my own sent line";
		await page.fill(input_sel, OWN_MSG);
		await page.keyboard.press("Enter");
		await sleep(1700);
		const own_bubbles = await page.locator(".chatbox-you", { hasText: OWN_MSG }).count();
		log(`${label}: one typed send draws exactly one of your own bubbles`, own_bubbles === 1, `${own_bubbles} bubble(s)`);

		const REPLY = "this is the assistant's one and only reply";
		stub.queue_reply(REPLY);
		await sleep(2200);   // the held SSE resolves almost at once; the file poll ticks at 1.5s — give both a real chance
		const reply_bubbles = await page.locator(".chatbox-reply", { hasText: REPLY }).count();
		log(`${label}: one reply, delivered via BOTH the SSE push and the file poll, draws exactly one bubble`, reply_bubbles === 1, `${reply_bubbles} bubble(s)`);

		await page.screenshot({ path: path.join(SHOTS, `duplicates-${label.replace(/\s+/g, "-")}.png`), fullPage: true });
		log(`${label}: no console/page errors`, errors.length === 0, errors.join(" | "));
		await page.close();
	}

	await safe("check 1 — demo", () => duplicates_check("demo", async page => {
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });
		return ".ux-dictate-widget-composer .chatbox-compose-input";
	}));
	await safe("check 1 — sheet", () => duplicates_check("sheet", async page => {
		await page.locator(".drawer-rail-ai").click();
		await page.waitForSelector(".drawer-rail-sheet .chatbox-compose-input", { timeout: 8000 });
		return ".drawer-rail-sheet .chatbox-compose-input";
	}));

	// ================= CHECK 2 — Full-screen sheet (checklist item 4) =================
	// Force the sheet's own "full" state (normally reached by dragging the grip to the top —
	// driven here through the same `state("full")` call `settle()` makes, so this measures the
	// real CSS layout the owner actually gets, not a fabricated one) and measure the gap
	// between the composer's own bottom edge and the sheet's bottom edge.
	await safe("check 2 — full-screen sheet", async () => {
		const { page, errors } = await new_page(browser, { width: 400, height: 800 });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.locator(".drawer-rail-ai").click();
		await page.waitForSelector(".drawer-rail-sheet .chatbox-compose-input", { timeout: 8000 });
		await page.evaluate(async () => {
			const m = await import("/framework/ext/drawer/rail.js");
			m.rail().$sheet.state("full");
		});
		await sleep(400);   // the ResizeObserver-driven re-pin and the CSS transition both need a tick
		const gap = await page.evaluate(() => {
			const sheet = document.querySelector(".drawer-rail-sheet").getBoundingClientRect();
			const composer = document.querySelector(".drawer-rail-sheet .chatbox-compose").getBoundingClientRect();
			return Math.round(sheet.bottom - composer.bottom);
		});
		log("check 2 — the sheet reaches drawer-rail-sheet-full", await page.evaluate(() => document.querySelector(".drawer-rail-sheet").classList.contains("drawer-rail-sheet-full")));
		// `rail.css` line 82 deliberately reserves `0.9em + the phone's safe-area inset` below
		// everything (so the composer never touches the very bottom edge, CLAUDE.md's own "text
		// never touches an edge") — that is NOT the bug the owner reported ("the text area
		// doesn't fill the space... a void underneath the buttons", fixed by `rail-fullscreen-
		// textarea`, `rail.css`'s own "fullscreen-rail-void" comment above). A small, deliberate
		// gap (under ~40px here, at a 400px-wide viewport) is the padding; anything bigger would
		// be the old unfilled-space bug back.
		log("check 2 — gap under the composer is the deliberate safe-area padding, not an unfilled void", gap >= 0 && gap <= 40, `measured ${gap}px (deliberate padding is ~0.9em ≈ 14px, plus the mic's own status line)`);
		await page.screenshot({ path: path.join(SHOTS, "full-screen-sheet-400.png"), fullPage: true });
		log("check 2 — no console/page errors", errors.length === 0, errors.join(" | "));
		await page.close();
	});

	// ================= CHECK 3 — Auto-scroll with a scroll state (checklist item 5) =====
	await safe("check 3 — auto-scroll + jump-to-bottom", async () => {
		const { page, errors } = await new_page(browser, { width: 1200, height: 700 });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });

		await page.evaluate(() => {
			for (let i = 0; i < 30; i++)
				window.$dictate_widget.say({ chat: { at: new Date(Date.now() + i).toISOString(), from: { kind: i % 2 ? "assistant" : "owner" }, text: "bubble number " + i } });
		});
		await sleep(150);
		const thread = ".ux-dictate-widget-thread";
		const at_bottom = async () => page.evaluate(sel => { const b = document.querySelector(sel); return b.scrollHeight - b.scrollTop - b.clientHeight < 4; }, thread);
		log("check 3 — 30 bubbles in, the view is pinned to the bottom", await at_bottom());

		// Scroll UP — this should release the lock and show the jump button.
		await page.evaluate(sel => { document.querySelector(sel).scrollTop = 0; document.querySelector(sel).dispatchEvent(new Event("scroll")); }, thread);
		await sleep(80);
		const jump_visible_after_scroll_up = await page.evaluate(() => !document.querySelector(".chatbox-jump")?.hidden);
		log("check 3 — scrolling up shows the jump-to-bottom button", jump_visible_after_scroll_up);

		// A NEW bubble while scrolled up must NOT move the view.
		const top_before = await page.evaluate(sel => document.querySelector(sel).scrollTop, thread);
		await page.evaluate(() => window.$dictate_widget.say({ chat: { at: new Date().toISOString(), from: { kind: "assistant" }, text: "a new one while scrolled up" } }));
		await sleep(150);
		const top_after = await page.evaluate(sel => document.querySelector(sel).scrollTop, thread);
		log("check 3 — a new bubble while scrolled up does NOT move the view", Math.abs(top_after - top_before) < 2, `scrollTop ${top_before} -> ${top_after}`);

		// The button jumps back down and re-locks.
		await page.click(".chatbox-jump");
		await sleep(100);
		log("check 3 — the jump button returns to the bottom and re-locks", await at_bottom());
		const jump_hidden_again = await page.evaluate(() => !!document.querySelector(".chatbox-jump")?.hidden);
		log("check 3 — the jump button hides itself once back at the bottom", jump_hidden_again);

		await page.screenshot({ path: path.join(SHOTS, "autoscroll-1200.png"), fullPage: true });
		log("check 3 — no console/page errors", errors.length === 0, errors.join(" | "));
		await page.close();
	});

	// ================= CHECK 4 — Mic sounds (checklist item 7) =================
	// Headless Chromium has a real (fake) microphone here, thanks to the two launch flags
	// above — `start_mic()`/`stop_mic()` go through the REAL `getUserMedia()` → `on_listening()`
	// → `beep()` path, nothing stubbed. `createOscillator` is wrapped (not `AudioContext`
	// itself) because `beep()` always makes exactly 2 oscillators per chime (two notes) — so
	// "one chime" reads as "exactly 2 oscillator calls in that window", never 0 (silent) or 4
	// (doubled, the exact bug `dictate-stop-sound` describes fixing).
	async function mic_sound_check(label, open_surface){
		const { page, errors } = await new_page(browser, { width: 400, height: 800 });
		await page.addInitScript(osc_wrap);
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		const widget_path = await open_surface(page);

		await page.evaluate(() => { window.__osc.length = 0; });
		await page.evaluate(sel => eval(sel).start_mic(), widget_path);
		await sleep(600);   // getUserMedia + on_listening()'s own async chain
		const after_start = await page.evaluate(() => window.__osc.length);
		log(`${label}: pressing the mic plays exactly one start chime (2 oscillator notes)`, after_start === 2, `${after_start} oscillator(s) created`);

		await page.evaluate(() => { window.__osc.length = 0; });
		await page.evaluate(sel => eval(sel).stop_mic(), widget_path);
		await sleep(600);
		const after_stop = await page.evaluate(() => window.__osc.length);
		log(`${label}: stopping the mic plays exactly one stop chime (2 oscillator notes), never dropped or doubled`, after_stop === 2, `${after_stop} oscillator(s) created`);

		log(`${label}: no console/page errors`, errors.length === 0, errors.join(" | "));
		await page.close();
	}
	await safe("check 4 — demo mic sounds", () => mic_sound_check("demo", async page => {
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });
		return "window.$dictate_widget";
	}));
	await safe("check 4 — sheet mic sounds", () => mic_sound_check("sheet", async page => {
		await page.locator(".drawer-rail-ai").click();
		await page.waitForSelector(".drawer-rail-sheet .chatbox-compose-input", { timeout: 8000 });
		return "window.$dictate_widget";
	}));

	// ================= CHECK 5 — The dot (checklist item 8) =================
	await safe("check 5 — the pulsing dot, on and off", async () => {
		const { page, errors } = await new_page(browser, { width: 420, height: 500 });
		await page.goto(SITE + "/framework/ux/Dictate/variants/", { waitUntil: "networkidle" });   // any plain page that loads /app.js
		await page.evaluate(async () => {
			const { default: Widget } = await import("/framework/ux/Dictate/Widget.js");
			const host = document.createElement("div");
			host.id = "zzz-probe-pulse";
			host.style.maxWidth = "360px";
			document.body.prepend(host);
			const { View } = await import("/app.js");
			new View({ el: host }).append(() => { window.__pulse_widget = new Widget({ pulse: true }); });
		});
		await sleep(200);
		const locked_shot = await page.locator(".ux-dictate-widget-pulse-lock").isVisible().catch(() => false);
		log("check 5 — off: the darkened \"tap to talk\" lock card shows", locked_shot);
		await page.screenshot({ path: path.join(SHOTS, "pulse-dot-off.png"), clip: { x: 0, y: 0, width: 420, height: 260 } });

		await page.evaluate(() => { window.__pulse_widget.$pulse.locked(false); window.__pulse_widget.$pulse.set_level(0.8); });
		await sleep(100);
		const dot_visible = await page.locator(".ux-dictate-widget-pulse-dot").isVisible().catch(() => false);
		log("check 5 — on: the lock goes away and the dot shows", dot_visible);
		await page.screenshot({ path: path.join(SHOTS, "pulse-dot-on.png"), clip: { x: 0, y: 0, width: 420, height: 260 } });

		// Does any REAL surface use it yet? Read straight from the two mount call sites.
		const demo_call = await page.evaluate(() => fetch("/framework/ux/Dictate/page.js").then(r => r.text()));
		const sheet_call = await page.evaluate(() => fetch("/framework/ext/drawer/rail.js").then(r => r.text()));
		const demo_uses_pulse = /chat\(\$slot\.el,\s*\{[^}]*pulse/s.test(demo_call);
		const sheet_uses_pulse = /this\.mount\s*=\s*chat\(this\.\$slot\.el,\s*\{[^}]*pulse/s.test(sheet_call);
		log("check 5 — the Dictate page's own demo passes pulse:true", demo_uses_pulse, demo_uses_pulse ? "yes" : "no — demo_mount()'s chat() call has no pulse option");
		log("check 5 — the ✦ sheet passes pulse:true", sheet_uses_pulse, sheet_uses_pulse ? "yes" : "no — DrawerRailSheetChat.ensure_mount()'s chat() call has no pulse option");

		log("check 5 — no console/page errors", errors.length === 0, errors.join(" | "));
		await page.close();
	});

	// ================= CHECK 6 — Do the two surfaces match? (checklist item 2) =========
	await safe("check 6 — surfaces option table", async () => {
		const page_js = fs.readFileSync(path.join(HERE, "../../../../ux/Dictate/page.js"), "utf8");
		const rail_js = fs.readFileSync(path.join(HERE, "../../../../ext/drawer/rail.js"), "utf8");
		const demo_call = page_js.match(/chat\(\$slot\.el,\s*\{[^}]*\}\)/s)?.[0] ?? "(not found)";
		const sheet_call = rail_js.match(/this\.mount\s*=\s*chat\(this\.\$slot\.el,\s*\{[^}]*\}\)/s)?.[0] ?? "(not found)";
		log("check 6 — demo_mount()'s chat() call", true, demo_call.replace(/\s+/g, " "));
		log("check 6 — DrawerRailSheetChat.ensure_mount()'s chat() call", true, sheet_call.replace(/\s+/g, " "));
	});

	// ================= CHECK 7a — Menu merge (one ⚙, full-screen, both halves) =========
	await safe("check 7a — one settings button, full-screen, both halves", async () => {
		const { page, errors } = await new_page(browser, { width: 400, height: 800 });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		await page.waitForSelector(".ux-dictate-widget-composer .chatbox-compose-input", { timeout: 8000 });

		const menu_buttons = await page.locator(".ux-dictate-widget-composer .chatbox-compose-menu").count();
		const old_more_buttons = await page.locator(".ux-dictate-widget-composer .chatbox-compose-more:not(.chatbox-compose-menu):not(.chatbox-compose-raw)").count();
		log("check 7a — exactly one ⚙ settings button (no separate ⋯ button)", menu_buttons === 1 && old_more_buttons === 0, `${menu_buttons} menu button(s), ${old_more_buttons} other 'more' button(s)`);

		await page.click(".ux-dictate-widget-composer .chatbox-compose-menu");
		await sleep(100);
		const panel_visible = await page.evaluate(() => { const p = document.querySelector(".chatbox-compose-menu-panel"); return p && !p.hidden; });
		const has_info = await page.evaluate(() => !!document.querySelector(".chatbox-compose-menu-panel .ux-dictate-info"));
		const has_settings = await page.evaluate(() => !!document.querySelector(".chatbox-compose-menu-panel .chatbox-mic-settings"));
		log("check 7a — it opens one full-screen panel", panel_visible);
		log("check 7a — that panel holds the engine/status info AND the settings grid, both", has_info && has_settings, `info: ${has_info}, settings grid: ${has_settings}`);
		await page.screenshot({ path: path.join(SHOTS, "menu-merge-open-400.png"), fullPage: true });

		await page.keyboard.press("Escape");
		await sleep(80);
		const panel_hidden = await page.evaluate(() => document.querySelector(".chatbox-compose-menu-panel")?.hidden);
		log("check 7a — Escape closes it", !!panel_hidden);

		log("check 7a — no console/page errors", errors.length === 0, errors.join(" | "));
		await page.close();
	});

	// ================= CHECK 7b — Threaded replies render nested =================
	// `card-threaded-replies` landed (task.jsonl has `landed_at`). This drives the actual
	// `ext/Chat/Chat.js` `chat()` factory directly — the exact shape `ai2/card.js`'s own
	// `chat_line()` produces (`{type:"reply", re, thread:true}`) — bypassing only the AI 2
	// session network plumbing (out of this fence), not the rendering code under test.
	await safe("check 7b — a threaded reply nests under its parent, collapsed to N replies", async () => {
		const { page, errors } = await new_page(browser, { width: 900, height: 700 });
		await page.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
		const out = await page.evaluate(async () => {
			const { chat } = await import("/framework/ext/Chat/Chat.js");
			const entries = [];
			const inst = chat({ source: () => entries, keep: () => true });
			const host = document.createElement("div");
			host.id = "zzz-probe-threads";
			document.body.prepend(host);
			host.appendChild(inst.view.el);
			entries.push({ type: "prompt", id: "p1", at: new Date(Date.now() - 5000).toISOString(), by: "owner", text: "What time is the meeting?" });
			inst.sync();
			entries.push({ type: "reply", id: "r1", at: new Date().toISOString(), by: "assistant", text: "Three o'clock.", re: "p1", thread: true });
			inst.sync();
			const toggle = document.querySelector(".chatbox-thread-toggle");
			const closed_label = toggle?.textContent ?? null;
			const nested_under_parent = document.querySelector(".chatbox[data-at] + .chatbox-thread, .chatbox-thread")
				? document.querySelector(".chatbox-thread")?.previousElementSibling?.textContent?.includes("What time") ?? false
				: false;
			const body_text_initial = document.querySelector(".chatbox-thread-body")?.textContent ?? null;
			toggle?.click();   // a reply this fresh auto-opens (`thread_item()`'s own "seen at once" rule) — this click now CLOSES it
			const label_after_close = document.querySelector(".chatbox-thread-toggle")?.textContent ?? null;
			return { closed_label, body_text_initial, label_after_close, nested_under_parent, has_wrap: !!document.querySelector(".chatbox-thread") };
		});
		// `thread_item()`'s own rule: a reply from the last two minutes opens its own thread
		// automatically, "so it is seen" — a real, good behavior, not the plain-collapsed
		// default the brief's wording might suggest. Checked both states: open at first (fresh),
		// and the toggle really does collapse it on a click.
		log("check 7b — a fresh reply's thread opens itself automatically, reading \"1 reply\"", out.closed_label === "▾ 1 reply", `read: ${JSON.stringify(out.closed_label)}`);
		log("check 7b — its own text is visible while open", /Three o.clock/.test(out.body_text_initial ?? ""), JSON.stringify(out.body_text_initial));
		log("check 7b — the toggle collapses it back to \"▸ 1 reply\" on a click", out.label_after_close === "▸ 1 reply", `read: ${JSON.stringify(out.label_after_close)}`);
		log("check 7b — it sits right under its parent bubble, not at the flat bottom", out.nested_under_parent, JSON.stringify(out));
		await page.screenshot({ path: path.join(SHOTS, "threaded-reply-900.png"), fullPage: true });
		log("check 7b — no console/page errors", errors.length === 0, errors.join(" | "));
		await page.close();
	});

} finally {
	await close_browser();
}

const failed = results.filter(r => !r.ok);
fs.writeFileSync(path.join(HERE, "proof-results.json"), JSON.stringify(results, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exit(1);
