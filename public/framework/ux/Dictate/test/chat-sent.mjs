// Proof: the sent marks and the scroll lock, in the bubble chat and in Chat v2.
//   node public/framework/ux/Dictate/test/chat-sent.mjs <base-url> <shots-dir> [width=400]
// Headless, every Servex verb stubbed (nothing is posted). The session stream is a script: each (re)connect gets the next batch of lines.
//   1. an owner line, then `sent` lines (fast, then smart) -> the line's badge goes "fast … · smart …" -> "fast ✓ · smart ✓"
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
	const owner = (n, ms) => ({ chat: { at: iso(ms), from: { kind: "owner" }, text: `line number ${n} of the proof`, via: "voice" } });
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
			queue.push({ chat: { at, from: { kind: "owner" }, text: body.text, via: "text" } });
			setTimeout(() => queue.push({ sent: { to: "fast", at: iso(Date.now()), re: [at], delay_ms: 420 } }), 1500);
			setTimeout(() => queue.push({ sent: { to: "smart", at: iso(Date.now()), re: [at], delay_ms: 3100 } }), 5000);
		}
		await route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) });
	});
		await page.route(/\/api\/sessions\?/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ ok: true, sessions: [] }) }));
	await page.route(/\/api\/hitl/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ ok: true, marks: [{ mark: "clear" }] }) }));
	await page.route(/\/log\/prompts/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: "{}" }));
	await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
	await page.click(".drawer-rail-ai");
	await page.waitForSelector(".drawer-rail-sheet.on", { timeout: 20000 });
	await page.click(".drawer-rail-sheet.on .dictation-bar-type");
	await page.fill(".drawer-rail-sheet.on .chatbox-field textarea, .drawer-rail-sheet.on .chatbox-field input", "hello from the proof");
	await page.keyboard.press("Enter");
	await page.waitForTimeout(2800);
	await page.screenshot({ path: `${shots}/${tag}-1-sent-fast.png` });
	console.log(tag, "badges at 2.8 s:", JSON.stringify(await page.evaluate(() => [...document.querySelectorAll(".chatbox-sent")].map(n => n.textContent))));
	await page.waitForTimeout(4000);
	await page.screenshot({ path: `${shots}/${tag}-1-sent-smart.png` });
	const sentText = await page.evaluate(() => [...document.querySelectorAll(".chatbox-sent")].map(n => n.textContent));
	console.log(tag, "sent badges:", JSON.stringify(sentText));
	if (!v2) check(sentText.some(t => /fast ✓.*smart ✓/.test(t)), `${tag}: the owner line shows both "fast ✓" and "smart ✓"`);
	queue.push(...Array.from({ length: 40 }, (_, i) => owner(i + 1, Date.now() + i)));

	await page.waitForTimeout(5000);
	const box = () => page.evaluate(isV2 => {
		const b = (isV2 ? document.querySelector(".drawer-rail-sheet-v2 > .chatbox-jump") : [...document.querySelectorAll(".drawer-rail-sheet.on .chatbox-jump")].find(j => !j.closest(".drawer-rail-sheet-v2")))?.parentElement;
		const j = b?.querySelector(".chatbox-jump");
		return b ? { top: Math.round(b.scrollTop), max: Math.round(b.scrollHeight - b.clientHeight), jump: !!j && !j.hidden && getComputedStyle(j).display !== "none" } : null;
	}, v2);
	const s0 = await box();
	console.log(tag, "after fill:", JSON.stringify(s0));
	check(!!s0 && s0.max > 100 && Math.abs(s0.top - s0.max) < 4, `${tag}: pinned to the bottom by default`);
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
