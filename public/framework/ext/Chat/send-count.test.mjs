// node send-count.test.mjs [base-url] — headless: a mic's own sentences_per_send (SendAfter "two") still rules when send_sentences() runs with no
// argument, as stop() does. Needs the global playwright and the dev server.
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const base = process.argv[2] ?? "http://localhost:60233";
const browser = await chromium.launch(), page = await browser.newPage();
let fail = 0;
try {
	await page.goto(`${base}/framework/ext/Chat/v3/`);
	await page.waitForSelector(".chat-v3", { timeout: 15000 });
	const got = await page.evaluate(async () => {
		const { ComposerMic } = await import("/framework/ext/Chat/Mic.js");
		const run = async per => {
			const sent = [], mic = new ComposerMic({ deliver: e => { sent.push(e.text); return true; } });
			mic.base = ""; mic.sentences_per_send = per;
			mic.held = [{ text: "One. Two. Three.", raw: "One. Two. Three.", br: false, ready: Promise.resolve() }];
			await mic.send_sentences();
			return sent;
		};
		return { two: await run(2), one: await run(1) };
	});
	const ok = got.two.length === 1 && /One\.\s*Two\./.test(got.two[0]) && !/Three/.test(got.two[0]) && got.one.length === 1 && !/Two/.test(got.one[0]);
	console.log(ok ? "PASS" : "FAIL", JSON.stringify(got)); if (!ok) fail++;
} finally { await browser.close(); }
process.exit(fail ? 1 : 0);
