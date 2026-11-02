// node ReciteBubble.test.mjs [base-url] [shots-dir] — headless: every assistant reply bubble in Chat V1, V2 and V3 carries the one
// Recite.Bubble control. A real click on a finished bubble asks recite-server to speak its FIRST sentence ("speak asked"), the
// control turns to ⏸, and a second click pauses; the place it paused at is then remembered, and a later play starts from it.
// recite-server is stubbed (POST /speak answers a 3 s silent WAV), so nothing needs Kokoro. Run with FENCE_SERVEX=1 so no request
// reaches the live Servex (Server/ServexFence.mjs; core/Test/TestRunner.mjs sets it). Needs the global playwright and the dev server.
import { browser as get_browser } from "../../../../Server/Browser.mjs";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://monorepo.localhost", shots = process.argv[3];
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

/** A 3 s, 8 kHz, 16-bit mono silent WAV: enough to pause inside. */
function wav(seconds = 3){
	const n = 8000 * seconds, b = Buffer.alloc(44 + n * 2);
	b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
	b.writeUInt32LE(8000, 24); b.writeUInt32LE(16000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
	return b;
}

const browser = await get_browser();
const ctx = await browser.newContext({ viewport: { width: 400, height: 860 } });
const errors = [];

/** Polls (in the page) until the shared Recite is playing. */
async function playing(page){
	for (let i = 0; i < 60; i++){
		if (await page.evaluate(async () => (await import("/framework/audio/Recite/Recite.js")).default.shared.state === "playing")) return true;
		await page.waitForTimeout(250);
	}
	return false;
}

/** One view: open `url`, find its first reply bubble, and prove tap -> speak asked -> ⏸ -> pause -> place remembered. */
async function view(name, url, bubble_sel, text_sel, prepare){
	const page = await ctx.newPage(), asked = [];
	page.on("pageerror", e => errors.push(`${name}: ${e}`));
	await page.route("**/speak", async route => {
		if (route.request().method() === "POST") asked.push(JSON.parse(route.request().postData() ?? "{}").text);
		await route.fulfill({ status: 200, headers: { "content-type": "audio/wav", "x-recite-seconds": "3", "access-control-allow-origin": "*", "access-control-expose-headers": "x-recite-seconds" }, body: wav(3) });
	});
	await page.addInitScript(() => { try { localStorage.removeItem("lew42.recite.places"); localStorage.setItem("lew42.recite.auto", "false"); } catch {} });
	await page.goto(url, { waitUntil: "domcontentloaded" });
	await prepare?.(page);
	await page.waitForSelector(bubble_sel + " > .recite-bubble-ctl", { timeout: 15000 });
	const bubble = page.locator(bubble_sel).first();
	check(`${name}: the reply bubble has the ▶ and ↺10 control`, (await bubble.locator(":scope > .recite-bubble-ctl button").allTextContents()).join(" ") === "▶ ↺10", await bubble.locator(":scope > .recite-bubble-ctl").textContent());
	check(`${name}: nothing was spoken before a tap`, asked.length === 0, asked);

	// a real click on the text (user activation, so the browser lets the audio play)
	await bubble.locator(text_sel).first().click({ position: { x: 150, y: 8 } });
	await playing(page);
	const first = await page.evaluate(async () => { const R = (await import("/framework/audio/Recite/Recite.js")).default.shared; return { state: R.state, first: R.chunks[0]?.text, text: R.chunks.map(c => c.text).join(" ").slice(0, 40) }; });
	check(`${name}: a tap on the text asked to speak the bubble's first sentence`, asked.length >= 1 && asked[0] === first.first, { asked: asked[0], first });
	check(`${name}: and it plays`, first.state === "playing", first.state);
	const plain = n => n.replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();
	check(`${name}: that first sentence is the start of what the bubble says`, plain(await bubble.locator(text_sel).first().innerText()).startsWith(plain(first.first).slice(0, 25)), first.first);
	check(`${name}: the control shows ⏸ while it plays`, (await bubble.locator(".recite-bubble-play").textContent()) === "⏸");

	// ⏸ pauses it and the place is kept
	await page.waitForTimeout(700);
	await bubble.locator(".recite-bubble-play").click();
	const paused = await page.evaluate(async () => { const m = await import("/framework/audio/Recite/Recite.js"), R = m.default.shared; return { state: R.state, place: m.default.place_of(R.chunks[R.at]?.key), t: R.audio.currentTime }; });
	check(`${name}: ⏸ pauses it`, paused.state === "paused", paused.state);
	check(`${name}: the place it stopped at is remembered (sentence 0, a little way in)`, paused.place && paused.place.i === 0 && paused.place.t > 0.2, paused);
	check(`${name}: the control is back to ▶`, (await bubble.locator(".recite-bubble-play").textContent()) === "▶");
	const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("lew42.recite.places") ?? "{}"));
	check(`${name}: and kept in the browser's storage for a reload`, Object.keys(stored).length === 1, stored);

	// stop everything, then play again: the bubble starts from where it stopped, not from 0
	await page.evaluate(async () => { (await import("/framework/audio/Recite/Recite.js")).default.shared.stop(); });
	asked.length = 0;
	await bubble.locator(".recite-bubble-play").click();
	await playing(page);
	const again = await page.evaluate(async () => { const R = (await import("/framework/audio/Recite/Recite.js")).default.shared; return { state: R.state, t: R.audio.currentTime }; });
	check(`${name}: playing it again starts where it stopped (${paused.place?.t}s), not at 0`, again.state === "playing" && again.t >= (paused.place?.t ?? 0) - 0.3, { again, place: paused.place });

	// ↺10 in a 3 s sentence goes to the bubble's start
	await bubble.locator(".recite-bubble-back").click();
	await page.waitForTimeout(300);
	const back = await page.evaluate(async () => (await import("/framework/audio/Recite/Recite.js")).default.shared.audio.currentTime);
	check(`${name}: ↺10 steps back to the start of a short bubble`, back < 1.0, back);

	if (shots){ mkdirSync(shots, { recursive: true }); await page.screenshot({ path: `${shots}/${name}.png` }); }
	await page.close();
}

try {
	// V3 and V2 draw their replies through ChatV3.reply(); V1 is the dictation widget's thread
	await view("chat-v3", `${base}/framework/ext/Chat/v3/`, ".chat-v3-reply", ".chat-v3-reply-text", p => p.waitForSelector(".chat-v3-reply", { timeout: 15000 }));
	await view("chat-v2", `${base}/framework/ext/Chat/v2/`, ".chat-v3-reply", ".chat-v3-reply-text", p => p.waitForSelector(".chat-v3-reply", { timeout: 15000 }));
	await view("chat-v1", `${base}/framework/start/`, ".chatbox-reply", ".chatbox-text", async p => {
		await p.evaluate(async () => {
			document.body.innerHTML = '<div id="box" style="max-width:40em;margin:1em auto"></div>';
			const { View } = await import("/framework/core/View/View.js");
			const { default: Widget } = await import("/framework/ux/Dictate/Widget.js");
			new View({ el: document.getElementById("box"), capture: false }).append(() => { window.w = new Widget({ placeholder: "say something", deliver: () => true }); });
			window.w.say({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, via: "voice", text: "Can you read me something?" } });
			window.w.say({ chat: { at: new Date(Date.now() + 1000).toISOString(), from: { kind: "assistant", id: "smart" }, text: "Yes, here is a reply to read aloud. It has a second sentence, so it can be paused." } });
		});
	});
	check("no page errors", errors.length === 0, errors);
} catch (e) {
	check("the test ran to the end", false, String(e?.stack ?? e).slice(0, 1500));
}
console.log(`${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
