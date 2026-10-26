// Proof: the sent marks and the scroll lock, in the bubble chat and in Chat v2.
//   node public/framework/ux/Dictate/test/chat-sent.mjs <base-url> <shots-dir> [width=400]
// Headless, every Servex verb stubbed (nothing is posted). The session stream is a script: each (re)connect gets the next batch of lines.
//   1. an owner line, then `sent` lines (fast, then smart) -> V1's badge goes nothing -> "✓" -> nothing again
//      once both assistants have it (round 3); V2 draws the same fact as its moving ✓/🧠 cursors instead
//   2. 40 lines, scroll up, 3 more arrive -> the view stays put and the ↓ button shows; press it -> follows the newest again
// Run for the bubble chat, then again with Chat v2 on (the "v2" chip). Exit 1 on any failure.
import fs from "fs";
import Browser from "../../../../../Server/Browser.mjs";

const [base = "http://monorepo.localhost", shots = ".", width = "400"] = process.argv.slice(2);
fs.mkdirSync(shots, { recursive: true });
const browser = await Browser.browser({});
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
const iso = ms => new Date(ms).toISOString();

async function round(v2){
	const tag = (v2 ? "v2" : "bubbles") + "-" + width;
	const ctx = await browser.newContext({ viewport: { width: +width, height: 800 } });
	if (v2) await ctx.addInitScript(() => localStorage.setItem("lew42.sheet.chat_view", "v2"));
	const page = await ctx.newPage();
	const errors = []; page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
	const scratch = new URL("./tmp-chat-sent.jsonl", import.meta.url), file_url = "/framework/ux/Dictate/test/tmp-chat-sent.jsonl";
	fs.writeFileSync(scratch, "");
	const queue = [];   // the lines the next stream (re)connect delivers; the proof pushes into it, and every one is also appended to the scratch file (Chat v2 reads the file)
	queue.push = (...ls) => { fs.appendFileSync(scratch, ls.map(l => JSON.stringify(l) + String.fromCharCode(10)).join("")); return Array.prototype.push.apply(queue, ls); };
	const owner = (n, ms) => v2 ? { tasks: { add: { id: `p-fill-${n}`, type: "Prompt", title: `Prompt number ${n}`, text: `line number ${n} of the proof, with enough words to take a little room in the box` } } } : { chat: { at: iso(ms), from: { kind: "owner" }, text: `line number ${n} of the proof`, via: "voice" } };
	const v2_done = new Set();
	const ev = lines => lines.map(line => `data: ${JSON.stringify({ kind: "line", line })}

`).join("");
	await page.route(/\/api\/session\//, async route => {
		const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
		if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: `retry: 1200

${ev(queue.splice(0))}` });
		let out = { ok: true };
		if (verb === "new" || verb === "resume") out = { ok: true, session: "stub-session", file: file_url };
		if (verb === "say"){
			const body = JSON.parse(req.postData() ?? "{}"), at = iso(Date.now());
			out = { ok: true, at };
			if (!v2_done.has(at)) setTimeout(() => { const r = { refined: { at: iso(Date.now()), re: at, sentences: [{ n: 1, text: "hello from the proof" }], sections: [], flags: [], cost_usd: 0.0123 } }; queue.push(r, r); }, 2200);
			if (v2) queue.push({ tasks: { add: { id: "p-say", type: "Prompt", title: "Said", text: body.text } } });
			queue.push({ chat: { at, from: { kind: "owner" }, text: body.text, via: "text", ...(v2 ? { prompt: "p-say" } : {}) } });
			setTimeout(() => queue.push({ sent: { to: "fast", at: iso(Date.now()), re: [at], delay_ms: 420 } }), 1500);
			setTimeout(() => queue.push({ sent: { to: "smart", at: iso(Date.now()), re: [at], delay_ms: 3100 } }), 5000);
		}
		await route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) });
	});
		await page.route(/\/api\/sessions\?/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ ok: true, sessions: [] }) }));
	await page.route(/\/api\/hitl/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ ok: true, marks: [{ mark: "clear" }] }) }));
	await page.route(/\/log\/prompts/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: "{}" }));
	await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".drawer-rail-ai", { state: "attached", timeout: 20000 });
	await page.evaluate(() => document.querySelector(".drawer-rail-ai").click());   // hidden at desktop widths, still wired
	await page.waitForSelector(".drawer-rail-sheet.on", { timeout: 20000 });
	await page.click(".drawer-rail-sheet.on .dictation-bar-type");
	await page.fill(".drawer-rail-sheet.on .chatbox-field textarea, .drawer-rail-sheet.on .chatbox-field input", "hello from the proof.");
	await page.keyboard.press("Enter");
	await page.waitForTimeout(2800);
	await page.screenshot({ path: `${shots}/${tag}-1-sent-fast.png` });
	// Round 4 (2026-10-25): V1 got its own two moving cursors, the same shape as v2's — gray until the seat
	// has it, then colored, and they never disappear (a cursor marks a place, not a pending/done toggle).
	// One shared class set now, V1 and v2 both (review finding 4) — so the query must stay INSIDE the
	// active view's own container, or the other (hidden) view's cursors would double up in the count.
	const container_sel = v2 ? ".drawer-rail-sheet-v2" : ".drawer-rail-sheet.on", mark_sel = ".chat-cursor, .chat-smart-cursor";
	const marks = () => page.evaluate(({ csel, sel }) => [...document.querySelectorAll(csel)].flatMap(c => [...c.querySelectorAll(sel)]).map(n => n.textContent || n.className), { csel: container_sel, sel: mark_sel });
	console.log(tag, "badges at 2.8 s:", JSON.stringify(await marks()));
	await page.waitForTimeout(4000);
	await page.screenshot({ path: `${shots}/${tag}-1-sent-smart.png` });
	const sentText = await marks();
	console.log(tag, "sent badges:", JSON.stringify(sentText));
	check(sentText.length === 2 && sentText.some(t => /chat-cursor done/.test(t)) && sentText.some(t => /🧠/.test(t)),
		`${tag}: the moving ✓ cursor reached "done" (reached the fast seat) and the 🧠 cursor is drawn (a sentence finished)`);
	if (!v2) check(await page.locator(".ux-dictate-widget-refined").count() === 1, `${tag}: a refined line that arrives twice draws ONE block`);
	queue.push({ tasks: { add: { id: "p-proof", type: "Prompt", title: "A prompt", text: "A prompt about sending." } } });
	queue.push({ "p-proof": { tasks: { add: { id: "q-proof", type: "Question", text: "Do you want the proof to show this question?", from: "p-proof" } } } });
	await page.waitForTimeout(1500);
	if (!v2) check(await page.locator(".chatbox-task[data-id=q-proof]").count() === 1, `${tag}: an open Question from the prompt shows in the chat`);
	if (!v2){   // the real Question, read-only from the owner's own session: it must sit under ITS prompt, not at the end
		const real = fs.readFileSync("C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl", "utf8").split(String.fromCharCode(10)).filter(Boolean);
		// `at`/`said_at` on one clock (near "now", a few ms apart): the real session's own said_at is hours
		// earlier than this run's wall clock, and `mergeable()`'s gap check (`at - last.at < MERGE_GAP_MS`) goes
		// hugely negative across clocks, which trivially passes — not what this proof means to exercise.
		queue.push(...[28, 29, 32, 36, 37].map(i => JSON.parse(real[i])).map((l, k) => (l.chat ? { chat: { ...l.chat, at: iso(Date.now() + k), said_at: iso(Date.now() + k) } } : l)));
		await page.waitForTimeout(1500);
		// Line 29 (chat.prompt "p-1792961349385") and line 37 (chat.prompt "p-1792961433084") are two DIFFERENT,
		// later Prompts, in the same merge window and from the same sender. The owner's rule (open-bubble-last-
		// brief) is "once the Prompt is closed ... it stays where it is": line 29's bubble sits right BEFORE its
		// own Question, untouched, and line 37's later Prompt gets its OWN bubble right AFTER the Question —
		// never merged into line 29's (review finding 3, 2026-10-25).
		const where = await page.evaluate(() => {
			const q = document.querySelector(".drawer-rail-sheet.on .chatbox-task[data-id=q-1792961349]");
			const next = q?.nextElementSibling;
			return q && { before: q.previousElementSibling?.textContent.slice(0, 40), after: next?.textContent, pieces: next?.querySelectorAll("[data-re]").length };
		});
		console.log(tag, "real Question sits:", JSON.stringify(where));
		check(!!where && /So, The words/.test(where.before ?? "") && /And then if I start/.test(where.after ?? "") && where.pieces === 1,
			tag + ": the real Question sits right under its own Prompt's bubble; a later, different Prompt gets its OWN, separate bubble (never merged across the boundary)");
	}
	await page.screenshot({ path: `${shots}/${tag}-5-question.png` });
	queue.push(...Array.from({ length: 40 }, (_, i) => owner(i + 1, Date.now() + i)));

	await page.waitForTimeout(5000);
	const box = () => page.evaluate(isV2 => {
		const b = (isV2 ? document.querySelector(".drawer-rail-sheet-v2 > .chatbox-jump") : [...document.querySelectorAll(".drawer-rail-sheet.on .chatbox-jump")].find(j => !j.closest(".drawer-rail-sheet-v2")))?.parentElement;
		const j = b?.querySelector(".chatbox-jump");
		return b ? { top: Math.round(b.scrollTop), max: Math.round(b.scrollHeight - b.clientHeight), jump: !!j && !j.hidden && getComputedStyle(j).display !== "none", newest_in_view: (() => { const nb = [...b.querySelectorAll("[data-re]")].pop() ?? [...b.querySelectorAll(".chatbox")].pop(); if (!nb) return false; const r = nb.getBoundingClientRect(), br = b.getBoundingClientRect(); return r.bottom > br.top + 1 && r.top < br.bottom - 1; })() } : null;
	}, v2);
	if (v2) console.log("v2 box:", JSON.stringify(await page.evaluate(() => { const b = document.querySelector(".drawer-rail-sheet-v2"); return b ? { cls: b.className, h: b.clientHeight, text: b.innerText.slice(0, 200), ctl: localStorage.getItem("lew42-voice-session") } : null; })));
	const s0 = await box();
	console.log(tag, "after fill:", JSON.stringify(s0));
	check(!!s0 && s0.max > 100 && (v2 ? Math.abs(s0.top - s0.max) < 4 : s0.newest_in_view), `${tag}: ${v2 ? "pinned to the bottom" : "the newest bubble is in view (V1 turns pages: newest top stays visible, blank below)"} by default`);
	await page.screenshot({ path: `${shots}/${tag}-2-pinned.png` });
	await page.evaluate(isV2 => { const b = (isV2 ? document.querySelector(".drawer-rail-sheet-v2 > .chatbox-jump") : [...document.querySelectorAll(".drawer-rail-sheet.on .chatbox-jump")].find(j => !j.closest(".drawer-rail-sheet-v2")))?.parentElement; b.scrollTop = 0; b.dispatchEvent(new Event("scroll")); }, v2);
	await page.waitForTimeout(300);
	const s1 = await box();
	queue.push(...Array.from({ length: 3 }, (_, i) => owner(i + 50, Date.now() + i)));
	await page.waitForTimeout(3000);
	const s2 = await box();
	console.log(tag, "scrolled up:", JSON.stringify(s1), "after new lines:", JSON.stringify(s2));
	check(s2 && s2.top === s1.top && s2.max > s1.max - 1 && s2.jump, `${tag}: scrolled up, new lines arrive, the view stays put and the ↓ button shows`);
	await page.screenshot({ path: `${shots}/${tag}-3-scrolled-up.png` });
	await page.evaluate(isV2 => { const b = (isV2 ? document.querySelector(".drawer-rail-sheet-v2 > .chatbox-jump") : [...document.querySelectorAll(".drawer-rail-sheet.on .chatbox-jump")].find(j => !j.closest(".drawer-rail-sheet-v2")))?.parentElement; b.querySelector(".chatbox-jump").click(); }, v2);
	await page.waitForTimeout(800);
	const s3 = await box();
	console.log(tag, "after the button:", JSON.stringify(s3));
	check(s3 && Math.abs(s3.top - s3.max) < 4 && !s3.jump, `${tag}: the button jumps to the newest and hides`);
	await page.screenshot({ path: `${shots}/${tag}-4-jumped.png` });
	check(errors.length === 0, `${tag}: no page errors ${errors.join(" | ")}`);
	await ctx.close();
	fs.rmSync(scratch, { force: true });
}

await round(false);
await round(true);
await browser.close();
process.exit(failed ? 1 : 0);
