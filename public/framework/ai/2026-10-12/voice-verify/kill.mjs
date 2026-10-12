/* node kill.mjs [origin] — an idle Refine page, Whisper killed, the mic pressed: what the one-line status says, every 1.5 s, until Whisper is back. */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
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
	const status = () => p.$eval(".ux-dictate-status", e => e.textContent.trim()).catch(() => "?");
	say("idle: " + await line());
	const pid = execSync("netstat -ano -p tcp").toString().split(/\r?\n/).find(l => /127\.0\.0\.1:8178\s.*LISTENING/.test(l))?.trim().split(/\s+/).pop();
	if (process.env.MID){ await p.tap(".ux-dictate-btn"); say("pressed the mic; the clip plays"); await sleep(3500); say("box so far: " + JSON.stringify(await p.$eval("textarea", e => e.value))); }
	execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" }); const killed = Date.now(); say("killed Whisper " + pid);
	await sleep(process.env.MID ? 200 : 1500);
	say("idle, 1.5 s after the kill: " + await line());
	if (!process.env.MID){ await p.tap(".ux-dictate-btn"); say("pressed the mic"); }
	let last = "", saw_restart = false;
	while (Date.now() - killed < 20000){
		const l = await line() + " | " + await status(); if (l !== last){ say(l); last = l; }
		if (/restarting it/.test(l)) saw_restart = true;
		if (saw_restart && /^Ready/.test(l) && /restarted it/.test(l)) break;
		await sleep(500);
	}
	say("box at the end: " + JSON.stringify(await p.$eval("textarea", e => e.value)) + " / diag: " + await p.$eval(".ux-dictate-diag", e => e.textContent).catch(() => "?"));
	say("back after " + (Date.now() - killed) + " ms");
	await p.screenshot({ path: path.join(process.env.OUT || ".", "kill-400.png") });
} finally { await close(); }
