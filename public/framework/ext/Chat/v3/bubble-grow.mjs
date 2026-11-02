// node bubble-grow.mjs <site-url> — headless: the owner's bubble GROWS while words arrive, then wraps at the cap (ext/Chat/bubbles.css).
// V3 (and V2, which inherits the draft): fires the same "chat-live" window event a mic composer sends, with more words each time.
// V1: types into the live `.chatbox-you` bubble's text. Checks at 360 (the cap is 80%) and 1920 (the cap is 40rem).
// "No jump when the guess becomes settled": the same words, moved from `guess` to `settled`, keep the width.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const { default: Browser } = await import(pathToFileURL(path.join(repo, "Server/Browser.mjs")).href);
const base = process.argv[2] ?? process.env.SITE_URL ?? "http://monorepo.localhost";
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };
const STEPS = ["Hi", "Hi there, can you", "Hi there, can you make the chat look more like Claude's chat", "Hi there, can you make the chat look more like Claude's chat on my phone, where my messages are small bubbles on the right and yours are plain text"];
const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36";

const browser = await Browser.browser();
try {
	for (const [name, w, h, mobile] of [["360", 360, 740, true], ["1920", 1920, 1000, false]]) {
		const ctx = await browser.newContext({ viewport: { width: w, height: h }, ...(mobile ? { userAgent: UA, isMobile: true } : {}) });
		const page = await ctx.newPage();
		const errors = []; page.on("pageerror", e => errors.push(String(e)));

		await page.goto(`${base}/framework/ext/Chat/v3/`, { waitUntil: "networkidle" });
		await page.waitForSelector(".chat-v3-you", { timeout: 15000 });
		const widths = [];
		for (const text of STEPS) {
			await page.evaluate(t => window.dispatchEvent(new CustomEvent("chat-live", { detail: { text: t, settled: "", guess: t, sent: false } })), text);
			await page.waitForSelector(".chat-v3-draft .chat-v3-you", { timeout: 3000 });
			widths.push(await page.evaluate(() => document.querySelector(".chat-v3-draft .chat-v3-you").getBoundingClientRect().width));
		}
		const frame = await page.evaluate(() => document.querySelector(".chat-v3-draft").parentElement.getBoundingClientRect().width);
		check(`${name} V3: the draft bubble widens as words arrive (${widths.map(Math.round).join(" → ")})`, widths.every((x, i) => i === 0 || x > widths[i - 1] - 0.5) && widths[1] > widths[0] + 20, widths);
		check(`${name} V3: a one-word draft is a small pill`, widths[0] < frame * 0.3, [widths[0], frame]);
		check(`${name} V3: the last draft stops at the cap (80% or 40rem) and wraps`, widths.at(-1) <= Math.max(frame * 0.8, 0) + 1 && widths.at(-1) <= 640 + 1, [widths.at(-1), frame]);

		const last = STEPS.at(-1);
		await page.evaluate(t => window.dispatchEvent(new CustomEvent("chat-live", { detail: { text: t, settled: t, guess: "", sent: false } })), last);
		const settled = await page.evaluate(() => document.querySelector(".chat-v3-draft .chat-v3-you").getBoundingClientRect().width);
		check(`${name} V3: guess becoming settled keeps the width (${Math.round(widths.at(-1))} → ${Math.round(settled)})`, Math.abs(settled - widths.at(-1)) < 2, [widths.at(-1), settled]);
		check(`${name} V3: no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), null);

		await page.goto(`${base}/framework/ext/Chat/`, { waitUntil: "networkidle" });
		await page.waitForSelector(".chatbox-you", { timeout: 15000 });
		const v1 = await page.evaluate(async steps => {
			const you = [...document.querySelectorAll(".chatbox-you")].pop(), t = you.querySelector(".chatbox-text"), out = [];
			for (const s of steps) { t.textContent = s; out.push(you.getBoundingClientRect().width); }
			return { out, frame: you.parentElement.getBoundingClientRect().width };
		}, STEPS);
		check(`${name} V1: the bubble widens as words arrive (${v1.out.map(Math.round).join(" → ")}) and stops at the cap`, v1.out.every((x, i) => i === 0 || x >= v1.out[i - 1] - 0.5) && v1.out[1] > v1.out[0] + 20 && v1.out.at(-1) <= v1.frame * 0.8 + 1, v1);
		check(`${name}: no page errors`, errors.length === 0, errors);
		await ctx.close();
	}
} finally {
	await Browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
