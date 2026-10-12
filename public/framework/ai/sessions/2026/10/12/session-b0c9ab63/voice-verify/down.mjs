/* node down.mjs [origin] — Whisper unreachable from the page for 8 s (requests blocked, Servex untouched), the mic pressed: does the status line say so and recover by itself? */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const ORIGIN = process.argv[2] || "http://10.0.0.135:3104";
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const sleep = ms => new Promise(r => setTimeout(r, ms)), t0 = Date.now(), say = s => console.log(`[${String(Date.now() - t0).padStart(6)}ms] ${s}`);
const b = await browser({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", `--use-file-for-fake-audio-capture=${REPO}/public/framework/ai/recordings/jfk.wav%noloop`, `--unsafely-treat-insecure-origin-as-secure=${ORIGIN}`] });
const ctx = await b.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true, isMobile: true, permissions: ["microphone"] });
try {
	const p = await ctx.newPage();
	await p.goto(ORIGIN + "/framework/ext/Refine/", { waitUntil: "load" });
	await p.waitForSelector(".voice-strip-say"); await sleep(1500);
	const line = () => p.$eval(".voice-strip-say", e => e.textContent.trim()).catch(() => "?");
	// the page has seen Whisper up once (Dictate remembers it); now block it
	say("idle: " + await line());
	const block = u => u.hostname === "127.0.0.1" && u.port === "8178" || u.pathname.startsWith("/whisper");
	await ctx.route(block, r => r.abort());
	const blocked = Date.now(); say("Whisper blocked for this page");
	await p.tap(".ux-dictate-btn"); say("pressed the mic");
	let last = "", lifted = false;
	while (Date.now() - blocked < 30000){
		if (!lifted && Date.now() - blocked > 8000){ await ctx.unroute(block); lifted = true; say("Whisper reachable again"); }
		const l = await line(); if (l !== last){ say(l); last = l; }
		await sleep(400);
	}
	await p.screenshot({ path: path.join(process.env.OUT || ".", "down-400.png") });
} finally { await close(); }
