// Proof for "raw looks raw, a summary swallows" (doc/voice-assistant.md#raw-and-refined). Headless only, never the owner's tabs.
//   PWENTRY=<playwright/index.mjs> node public/framework/ux/Dictate/test/swallow.mjs <base-url> [shots dir]
// Fake mic (jfk.wav) dictates one sentence into a bare Widget (no Servex, no agents, nothing posted): it is drawn raw.
// Then three sentences are placed into one card, and a {summary} line arrives through the same Thread.draw() the chat tail calls:
// the card must fold within a second, show the summary and "N raw lines", and the toggle must unfold the raw words. No line is lost.
import { pathToFileURL } from "url";

const [base = "http://monorepo.localhost", shots] = process.argv.slice(2);
const wav = process.env.WAV ?? new URL("../../../ai/recordings/jfk.wav", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const { chromium } = await import(pathToFileURL(process.env.PWENTRY).href);
const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
const kill = setTimeout(() => { console.log("FAIL killed after 200 s"); process.exit(2); }, 200000);
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };

for (const width of [400, 1200]){
	const ctx = await browser.newContext({ viewport: { width, height: 900 }, permissions: ["microphone"] });
	const page = await ctx.newPage();
	const errors = [];
	page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
	await page.goto(base + "/framework/start/", { waitUntil: "domcontentloaded" }).catch(() => {});
	await page.evaluate(async () => {
		document.body.innerHTML = '<div id="box" style="max-width:40em;margin:1em auto"></div>';
		const { View } = await import("/framework/core/View/View.js");
		const { default: Widget } = await import("/framework/ux/Dictate/Widget.js");
		window.sent = [];
		new View({ el: document.getElementById("box"), capture: false }).append(() => {
			window.w = new Widget({ placeholder: "say something", deliver: e => { window.sent.push(e.text); return true; } });
		});
	});

	// 1. dictate through the fake mic: the settled sentence is raw
	await page.locator(".chatbox-mic .ux-dictate-btn, .chatbox-mic button").first().click();
	for (let i = 0; i < 160; i++){ await page.waitForTimeout(250); if (await page.evaluate(() => window.sent.length)) break; }
	const dictated = await page.evaluate(() => ({ n: window.sent.length, raw: document.querySelectorAll(".ux-dictate-raw").length }));
	await page.locator(".chatbox-mic .ux-dictate-btn, .chatbox-mic button").first().click().catch(() => {});
	check(dictated.n > 0 && dictated.raw >= 1, `${width}: a sentence from the fake mic is drawn raw (${dictated.raw} raw)`);

	// 2. three raw lines into one card; a refined/placed line loses `raw`
	const t = await page.evaluate(async () => {
		w.reset();
		const at = n => `2026-10-17T00:00:0${n}.000-05:00`;
		const words = ["The sheet should open at sixty percent.", "And it should remember the height I drag it to.", "Separately, the inbox labels need a count.",
			"Each label shows how many notes wait.", "The count turns zero when you read them."];
		words.forEach((text, i) => w.say({ chat: { at: at(i), from: { kind: "owner" }, via: "voice", text } }));
		const raw_all = document.querySelectorAll(".ux-dictate-raw").length;
		w.say({ place: { re: at(0), to: "same" } });
		const raw_after_place = document.querySelectorAll(".ux-dictate-raw").length;
		w.say({ place: { re: at(2), to: "card", where: "up", title: "Inbox labels" } });
		w.say({ place: { re: at(3), to: "same" } }); w.say({ place: { re: at(4), to: "same" } });
		const card = [...document.querySelectorAll(".ux-dictate-placed-card")];
		const before = { visible: card[0].querySelectorAll("[data-re]").length, summary: !!card[0].querySelector(".ux-dictate-summary") };
		const t0 = performance.now();
		w.say({ summary: { card: at(2), text: "Inbox labels show an unread count that resets when read." } });
		await new Promise(r => requestAnimationFrame(() => r()));
		const b = document.querySelector(".ux-dictate-placed-card");
		const hidden = [...b.querySelectorAll("[data-re]")].every(n => getComputedStyle(n).display === "none");
		return { raw_all, raw_after_place, before, ms: Math.round(performance.now() - t0), hidden,
			summary: b.querySelector(".ux-dictate-summary-text")?.textContent, toggle: b.querySelector(".ux-dictate-fold-toggle")?.textContent,
			count: b.querySelectorAll("[data-re]").length };
	});
	check(t.raw_all === 5 && t.raw_after_place === 4, `${width}: five raw lines, and a placed one loses the look (${t.raw_all} -> ${t.raw_after_place})`);
	check(!t.before.summary && t.before.visible === 3, `${width}: before the summary the card shows its ${t.before.visible} lines`);
	check(t.hidden && t.ms < 1000 && /^Inbox labels show/.test(t.summary ?? ""), `${width}: the summary folded the lines in ${t.ms} ms`);
	check(t.toggle?.startsWith("3 raw lines"), `${width}: the toggle says "${t.toggle}"`);
	if (shots) await page.screenshot({ path: `${shots}/swallow-folded-${width}.png` });

	// 3. the toggle unfolds the raw words in place; nothing was deleted
	await page.locator(".ux-dictate-fold-toggle").click();
	const open = await page.evaluate(() => {
		const b = document.querySelector(".ux-dictate-placed-card");
		return { shown: [...b.querySelectorAll("[data-re]")].filter(n => getComputedStyle(n).display !== "none").length, text: b.textContent, toggle: b.querySelector(".ux-dictate-fold-toggle").textContent };
	});
	if (shots) await page.screenshot({ path: `${shots}/swallow-open-${width}.png` });
	check(open.shown === 3 && /Separately, the inbox labels need a count\./.test(open.text) && /turns zero/.test(open.text), `${width}: a click shows the raw words (${open.shown} lines, ${open.toggle})`);
	check(!errors.length, `${width}: no page errors ${errors.join(" ")}`);
	await ctx.close();
}
clearTimeout(kill);
await browser.close();
console.log(failed ? `${failed} failed` : "all passed");
process.exit(failed ? 1 : 0);
