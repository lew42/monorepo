/* node dup-e2e.mjs [origin] — duplicate-bubbles, end to end: a real session page, the chat composer's mic fed by a recorded clip,
 * real Whisper + real Servex. Counts how many times the dictated words show on the page (chat bubbles + voice stages) over time.
 * Usage: node dup-e2e.mjs [http://monorepo.localhost] [?session uuid]. Costs nothing (no refine). */
import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url"; import { randomUUID } from "node:crypto";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../..");
const ORIGIN = process.argv[2] || "http://monorepo.localhost", session = process.argv[3] || randomUUID();
const WAV = process.env.WAV || REPO + "/public/framework/ai/recordings/jfk.wav";
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const b = await browser({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", `--use-file-for-fake-audio-capture=${WAV}`] });
const ctx = await b.newContext({ viewport: { width: +(process.env.W || 1400), height: 900 }, permissions: ["microphone"] });
const page = await ctx.newPage(), errs = [];
page.on("pageerror", e => errs.push(String(e.stack).split(String.fromCharCode(10)).slice(0, 4).join(" | ")));
page.on("console", m => { if (process.env.V) console.log("  console", m.type(), m.text().slice(0,200)); });
page.on("request", r => { if (/api[/](session|voice|refine)/.test(r.url()) && r.method() === "POST") console.log("  POST", r.url().split("/api")[1], (r.postData() || "").slice(0, 140)); });
try {
	await page.goto(`${ORIGIN}${process.env.PAGE || "/framework/ux/Dictate/"}`, { waitUntil: "load" });
	await page.waitForSelector(".chatbox-mic .ux-dictate-btn", { timeout: 30000 });
	await page.waitForTimeout(1500);
	const base = await page.evaluate(() => document.querySelectorAll(".chatbox-you").length);
	await page.click(".chatbox-mic .ux-dictate-btn");
	const count = () => page.evaluate(() => {
		const t = "ask not what your country can do for you", txt = document.body.innerText.toLowerCase();
		const bubbles = [...document.querySelectorAll(".chatbox-you")].filter(e => e.textContent.toLowerCase().includes("ask not what")).length, shown = [...document.querySelectorAll(".chatbox-you .chatbox-text")].map(e => e.textContent.trim().slice(0, 200));
		return { youBubbles: bubbles, shown: shown.map(x => x.slice(0, 50)) };
	});
	for (let i = 0; i < +(process.env.SECS || 10); i++){ await page.waitForTimeout(1000); { const c = await count(); console.log(i + 1 + "s", "NEW bubbles:", c.youBubbles - base, "(baseline " + base + ")"); } }
	await page.screenshot({ path: path.join(process.env.OUT || HERE, "dup-e2e.png"), fullPage: false });
	console.log("errors", errs.slice(0, 5), "session", session);
} finally { await close(); }
