// Headless phone-width proof: dictation grows a bubble in the ✦ sheet's chat, and a reply streams in.
// The session routes are stubbed (nothing reaches the real Servex session log, no agent wakes);
// whisper-server and /api/tidy are real. Screenshots go to OUT.
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs";

const PAD = "C:/Users/mike/AppData/Local/Temp/claude/C--Code-lew42-monorepo/91e5c266-cf51-499e-ab17-3514cfb43137/scratchpad";
const OUT = process.argv[2] ?? PAD + "/shots";
const BASE = process.argv[3] ?? "http://localhost:55612";
fs.mkdirSync(OUT, { recursive: true });
const WAV = PAD + "/speech.wav";

const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${WAV}`, "--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.grantPermissions(["microphone"]);
const page = await ctx.newPage();
const log = [];
page.on("console", m => { if (m.type() === "error") log.push("console error: " + m.text()); });
page.on("pageerror", e => log.push("page error: " + e.message));

const said = [], quiets = [];
let conn = 0;
const REPLY = "Yes, the words now grow in a bubble in the chat while you speak, and this reply is typed out as it is written.";
await page.route(/127\.0\.0\.1:8090\/(log\/prompts|api\/hitl)/, r => r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
await page.route(/\/api\/session\/(new|say|quiet|nav)$/, async r => {
	const verb = r.request().url().split("/").pop();
	const body = JSON.parse(r.request().postData() || "{}");
	if (verb === "say") said.push({ t: Date.now(), ...body });
	if (verb === "quiet") quiets.push({ t: Date.now(), ...body });
	const out = verb === "new" ? { ok: true, session: "v-proof", home: "/framework/ux/Dictate/", file: "/framework/ux/Dictate/ai/v-proof.jsonl", resumed: false, previous: null }
		: verb === "say" ? { ok: true, at: new Date().toISOString() } : { ok: true };
	r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(out) });
});
await page.route(/v-proof\.jsonl/, r => r.fulfill({ status: 404, body: "" }));
// The live wire: each (re)connection is one step of the reply, so the bubble visibly grows. It only
// starts once a quiet event arrived (Servex would only then have sent the thought to the assistant).
await page.route(/\/api\/session\/v-proof\/stream/, r => {
	let body = "retry: 350\n\n";
	if (said.length){
		conn++;
		const words = REPLY.split(" "), n = Math.min(words.length, conn * 4);
		if (n < words.length) body += `data: ${JSON.stringify({ kind: "stream", role: "smart", text: words.slice(0, n).join(" ") })}\n\n`;
		else body += `data: ${JSON.stringify({ kind: "stream", role: "smart", text: "" })}\n\ndata: ${JSON.stringify({ kind: "line", line: { chat: { at: new Date().toISOString(), session: "v-proof", from: { kind: "assistant", id: "smart" }, via: "text", text: REPLY } } })}\n\nretry: 600000\n\n`;
	}
	r.fulfill({ status: 200, headers: { "content-type": "text/event-stream", "access-control-allow-origin": "*" }, body });
});

await page.goto(BASE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
await page.evaluate(() => { try { sessionStorage.clear(); localStorage.removeItem("chat.mic.settings.3"); } catch {} });
await page.click(".drawer-rail-ai");
const t0 = Date.now();
const frames = [];
let shot = 0;
for (let i = 0; i < 60; i++){
	await page.waitForTimeout(500);
	const st = await page.evaluate(() => {
		const d = document.querySelector(".chatbox-draft"), s = document.querySelector(".chatbox-streaming");
		return { draft: d?.textContent ?? null, guess: d?.querySelector(".chatbox-guess")?.textContent ?? null, sent: !!document.querySelector(".chatbox-live-sent"),
			box: document.querySelector(".drawer-rail-sheet .chatbox-compose-input")?.value ?? null,
			you: [...document.querySelectorAll(".drawer-rail-sheet .chatbox-you:not(.chatbox-live)")].map(b => b.textContent),
			streaming: s?.textContent ?? null, replies: [...document.querySelectorAll(".drawer-rail-sheet .chatbox-reply:not(.chatbox-live)")].map(b => b.textContent) };
	});
	const f = { s: ((Date.now() - t0) / 1000).toFixed(1), ...st };
	frames.push(f);
	const interesting = (f.draft && shot < 4) || (f.streaming && shot < 7) || (i === 59);
	if (interesting){ await page.screenshot({ path: `${OUT}/${String(++shot).padStart(2, "0")}-${f.s}s.png` }); }
	if (f.replies.some(r => r.includes("typed out"))){ await page.waitForTimeout(300); await page.screenshot({ path: `${OUT}/${String(++shot).padStart(2, "0")}-final.png` }); break; }
}
fs.writeFileSync(`${OUT}/frames.json`, JSON.stringify({ frames, said, quiets, log }, null, 1));
for (const f of frames) console.log(f.s, "draft:", JSON.stringify(f.draft), "| box:", JSON.stringify(f.box), "| you:", f.you.length, "| stream:", JSON.stringify(f.streaming), "| replies:", f.replies.length);
console.log("said:", JSON.stringify(said.map(s => ({ text: s.text, raw: s.raw, floor: s.floor, quiet_ms: s.quiet_ms }))));
console.log("quiets:", JSON.stringify(quiets));
console.log("errors:", log.length ? log.join("\n") : "none");
await browser.close();

