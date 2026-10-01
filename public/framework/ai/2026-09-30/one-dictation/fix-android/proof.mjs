import fs from "node:fs";
// The phone's fallback path, headless: whisper unreachable, Chrome-on-Android's recognizer simulated
// (each result is the WHOLE phrase so far, marked final; the recognizer ends after every pause and
// throws "aborted" once on a restart). Stubbed Servex. Prints what would be sent, chimes, errors.
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const SITE = process.env.SITE ?? "http://monorepo.localhost";
const PATH = process.argv[2] ?? "/framework/ux/Dictate/";
const SHEET = process.argv[3] === "sheet", W = +(process.argv[4] ?? 400), TAG = process.argv[5] ?? "now";
const b = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: W, height: 800 }, permissions: ["microphone"] });
const p = await ctx.newPage();
const says = [], errs = [];
p.on("pageerror", e => errs.push("pageerror " + e.message));
p.on("console", m => { if (m.type() === "error" && !/Failed to load resource|cardRows/.test(m.text())) errs.push(m.text().slice(0, 160)); });
await p.addInitScript(() => {
	window.__osc = 0; window.__starts = 0;
	const o = AudioContext.prototype.createOscillator;
	AudioContext.prototype.createOscillator = function(){ window.__osc++; return o.call(this); };
	const PHRASES = [["so", "tell", "me", "why"], ["there's", "a", "lot", "of", "beeping"], ["after", "every", "pause"]];
	let phrase = 0, aborted_once = false;
	class FakeRec {
		start(){
			window.__starts++;
			if (this.live) throw new DOMException("already started", "InvalidStateError");
			this.live = true;
			setTimeout(() => { this.onstart?.(); this.run(); }, 30);
		}
		run(){
			const words = PHRASES[phrase++];
			if (!words){ return; }   // nothing more to say: stays open until stop()
			const results = []; let i = 0;
			const tick = () => {
				if (!this.live) return;
				if (i < words.length){
					const t = words.slice(0, ++i).join(" ");
					const r = [{ transcript: (results.length ? " " : "") + t, confidence: 0.9 }]; r.isFinal = true;
					results.push(r);
					this.onresult?.({ resultIndex: results.length - 1, results });
					return setTimeout(tick, 120);
				}
				// the pause: Android ends the session; once, it says "aborted" first
				setTimeout(() => {
					if (!this.live) return;
					this.live = false;
					if (!aborted_once && phrase === 2){ aborted_once = true; this.onerror?.({ error: "aborted" }); }
					this.onend?.();
				}, 300);
			};
			tick();
		}
		stop(){ if (!this.live) return; this.live = false; setTimeout(() => this.onend?.(), 20); }
		abort(){ this.stop(); }
	}
	window.SpeechRecognition = window.webkitSpeechRecognition = FakeRec;
});
await p.route(/127\.0\.0\.1:8178|\/whisper\//, route => route.abort());
await p.route(/127\.0\.0\.1:8090|servex\.localhost/, async route => {
	const req = route.request(), url = req.url();
	const json = o => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(o) });
	if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
	if (/\/api\/sessions\?/.test(url)) return json({ ok: true, sessions: [] });
	if (/\/api\/session\/(new|resume)/.test(url)) return json({ ok: true, session: "repro", home: PATH, file: "/repro-none.jsonl", resumed: false });
	if (/\/api\/session\/say/.test(url)){ says.push(req.postDataJSON?.() ?? {}); return json({ ok: true, at: new Date().toISOString() }); }
	if (/\/stream/.test(url)) return route.fulfill({ status: 200, contentType: "text/event-stream", body: "" });
	return json({ ok: true });
});
if (process.env.WT){ const files = (process.env.FILES ?? "public/framework/ux/Dictate/Dictate.js").split(","); for (const rel of files){ const url = rel.replace(/^public/, ""); await p.route(u => u.pathname === url, r => r.fulfill({ status: 200, contentType: "text/javascript", body: fs.readFileSync(process.env.WT + "/" + rel, "utf8") })); } }
await p.goto(SITE + PATH, { waitUntil: "networkidle" });
if (SHEET){ await p.evaluate(() => document.querySelector(".drawer-rail-ai").click()).catch(e => errs.push("no ✦ " + e.message)); await p.waitForTimeout(400); }
else await p.click(".chatbox-mic button").catch(e => errs.push("mic click " + e.message));
await p.waitForTimeout(6500);
const during = await p.evaluate(async () => { const { ComposerMic } = await import("/framework/ext/Chat/Mic.js"); const m = ComposerMic.on; return { state: m?.state, engine: m?.engine, box: m?.box()?.value, error: document.querySelector(".ux-dictate-error, .ux-dictate .error")?.textContent ?? null }; });
await p.screenshot({ path: `android-${TAG}-${SHEET ? "sheet" : "demo"}-${W}.png` });
await p.click(".chatbox-mic button").catch(e => errs.push("mic stop " + e.message));
await p.waitForTimeout(3000);
const tail = await p.evaluate(() => ({ osc: window.__osc, starts: window.__starts }));
console.log(JSON.stringify({ PATH, SHEET, W, during, ...tail, chimes: tail.osc / 2, says: says.map(s => s.text), errs: errs.slice(0, 8) }, null, 1));
await b.close();
