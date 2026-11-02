// The mic light: after stop (or pause), every MediaStreamTrack must be "ended" at once, even while Whisper is slow, and even when
// stop lands while getUserMedia is still opening. Headless, fake mic, Whisper stubbed.
//   node public/framework/ux/Dictate/test/mic-release.mjs <base-url>
import { pathToFileURL } from "url";
const [base = "http://monorepo.localhost"] = process.argv.slice(2);
const { default: Browser } = await import(new URL("../../../../../Server/Browser.mjs", import.meta.url).href);
const browser = await Browser.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const ctx = await browser.newContext({ permissions: ["microphone"] });
const page = await ctx.newPage();
const errors = []; page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
await page.route(/\/(cards\?|api\/agents)/, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "[]" }));
await page.route(/127\.0\.0\.1:8178/, async route => {   // Whisper: up, but each transcription takes 4 s
	const req = route.request(), h = { "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
	if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: h });
	if (req.method() === "GET") return route.fulfill({ status: 200, contentType: "text/html", headers: h, body: "ok" });
	await new Promise(r => setTimeout(r, 4000));
	return route.fulfill({ status: 200, contentType: "application/json", headers: h, body: JSON.stringify({ text: " hello there. ", segments: [] }) });
});
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
await page.goto(base + "/framework/ux/Dictate/", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.querySelector(".page"), null, { timeout: 20000 });
const out = await page.evaluate(async () => {
	const live = [];
	const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
	navigator.mediaDevices.getUserMedia = async c => { const s = await gum(c); live.push(s); return s; };   // every stream ever opened
	const open = () => live.flatMap(s => s.getTracks()).filter(t => t.readyState === "live").length;
	const { default: Capture } = await import("/framework/ux/Dictate/capture.js");
	const { View } = await import("/framework/core/View/View.js");
	const { default: Dictate } = await import("/framework/ux/Dictate/Dictate.js");
	const wait = ms => new Promise(r => setTimeout(r, ms));
	const r = {};
	// 1. plain start / stop
	let c = new Capture(); await c.start(() => {}); r.cap_open = open(); c.stop(); r.cap_after_stop = open();
	// 2. stop lands while getUserMedia is still opening
	c = new Capture(); const p = c.start(() => {}).catch(() => {}); c.stop(); await p; await wait(300); r.cap_race = open();
	// 3. Dictate: stop while the final transcription is slow
	const host = document.createElement("div"); document.body.append(host);
	let d; new View({ el: host, capture: false }).append(() => { d = new Dictate({}); });
	await d.start(); r.dictate_state = d.state; r.dictate_open = open();
	d.mic.chunks.push(new Float32Array(16000).fill(0.3)); d.has_speech = true;   // a second of loud audio
	const stopping = d.stop(); await wait(300);
	r.dictate_after_stop_slow_whisper = open(); r.dictate_state_during = d.state;
	await stopping; r.dictate_final = open();
	// 4. press, press, press (start, stop, start while the first is connecting) then settle
	const d2h = document.createElement("div"); document.body.append(d2h);
	let d2; new View({ el: d2h, capture: false }).append(() => { d2 = new Dictate({}); });
	d2.toggle(); await wait(50); d2.toggle(); await wait(50); d2.toggle(); await wait(1500); d2.toggle(); await wait(6000);
	r.rapid_state = d2.state; r.rapid_open = open();
	return r;
});
console.log(JSON.stringify(out));
check(out.cap_open > 0 && out.cap_after_stop === 0, "Capture.stop ends every track");
check(out.cap_race === 0, "stop during getUserMedia: the late stream is released (" + out.cap_race + " live)");
check(out.dictate_state === "listening", "Dictate listens: " + out.dictate_state);
check(out.dictate_after_stop_slow_whisper === 0, "stop with Whisper slow: tracks ended at once, not after the upload (" + out.dictate_after_stop_slow_whisper + " live)");
check(out.dictate_final === 0, "after the final lands: none live");
check(out.rapid_open === 0 && out.rapid_state === "idle", `press-press-press-press ends off: ${out.rapid_state}, ${out.rapid_open} live`);
check(!errors.length, "no page errors: " + errors.join(" | "));
await browser.close();
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
