/* node walk.mjs <phone|desktop> [wav] — try-it.md, step by step, headless, with a recorded clip as the microphone.
 *   phone:   400 px wide, touch, http://10.0.0.135:3104 (the phone's address; the insecure-origin flag stands in for the https the owner's phone lacks)
 *   desktop: 1400 px, http://monorepo.localhost
 * Prints the time each stage showed on the session page, counted from the end of the audio and from the Refine tap.
 * Needs the live Servex + site up. Costs two small model calls per run. */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../..");
const mode = process.argv[2] || "phone";
const WAV = path.resolve(process.argv[3] || REPO + "/public/framework/ai/recordings/jfk.wav");
const CLIP_S = Number(process.env.CLIP_S || 7.85);
const ORIGIN = process.env.ORIGIN || (mode === "phone" ? "http://10.0.0.135:3104" : "http://monorepo.localhost");
const VIEW = mode === "phone" ? { width: 400, height: 800 } : { width: 1400, height: 900 };
const OUT = process.env.OUT || HERE;
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const t0 = Date.now(), now = () => Date.now() - t0, say = s => console.log(`[${String(now()).padStart(6)}ms] ${s}`);
const b = await browser({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", `--use-file-for-fake-audio-capture=${WAV}%noloop`, `--unsafely-treat-insecure-origin-as-secure=${ORIGIN}`] });
const ctx = await b.newContext({ viewport: VIEW, ...(mode === "phone" ? { hasTouch: true, isMobile: true } : {}), permissions: ["microphone"] });
const session = randomUUID(), errs = [];
try {
	const refine = await ctx.newPage();
	refine.on("pageerror", e => errs.push("refine: " + e.message));
	refine.on("console", m => { if (m.type() === "error") errs.push("refine console: " + m.text().slice(0, 160)); });
	await refine.goto(`${ORIGIN}/framework/ext/Refine/?session=${session}`, { waitUntil: "load" });
	await refine.waitForSelector(".refine-watch", { timeout: 30000 }).catch(() => {}); await sleep(1000);
	const watch = await refine.$eval(".refine-watch", e => e.getAttribute("href")).catch(() => null);
	say("watch link: " + watch);
	const watcher = await ctx.newPage();
	watcher.on("pageerror", e => errs.push("watcher: " + e.message));
	await watcher.goto(`${ORIGIN}${watch}`, { waitUntil: "load" });
	const seen = {};
	const poll = setInterval(async () => {
		try { for (const [k, txt] of await watcher.$$eval(".voice-stage:not([hidden])", els => els.map(e => [e.getAttribute("data-stage"), e.textContent]))) if ((k === "raw" || k === "clean") && /do for your country/i.test(txt) && !seen[k + "-last-words"]) { seen[k + "-last-words"] = now(); say(k + " stage shows the last words"); } } catch {}
		try { for (const s of await watcher.$$eval(".voice-stage:not([hidden])", els => els.map(e => e.getAttribute("data-stage")))) if (!seen[s]) { seen[s] = now(); say("stage visible on session page: " + s); } } catch {}
	}, 100);
	const strip = await refine.$eval(".voice-strip-say", e => e.textContent).catch(() => "?");
	say("strip says before mic: " + strip);
	const mic_at = now();
	await refine[mode === "phone" ? "tap" : "click"](".ux-dictate-btn");
	say("tapped mic");
	await sleep(1500);
	say("strip says after tap: " + await refine.$eval(".voice-strip-say", e => e.textContent).catch(() => "?"));
	const audio_end = mic_at + CLIP_S * 1000 + 600;   // the clip starts when the mic opens (about 0.6 s after the tap)
	while (now() < audio_end + 1500) await sleep(250);
	const box = await refine.$eval("textarea", e => e.value);
	say("box after the clip: " + JSON.stringify(box));
	await refine.screenshot({ path: path.join(OUT, `walk-${mode}-refine.png`) });
	if (process.env.KILL_WHISPER){
		const { execSync } = await import("node:child_process");
		const pid = execSync("netstat -ano -p tcp").toString().split(/\r?\n/).find(l => /127\.0\.0\.1:8178\s.*LISTENING/.test(l))?.trim().split(/\s+/).pop();
		const line = () => refine.$eval(".voice-strip-say", e => e.textContent.replace(/\s+/g, " ").trim()).catch(() => "?");
		say("strip says before the kill: " + await line());
		const press = () => refine[mode === "phone" ? "tap" : "click"](".ux-dictate-btn");
		if (/Listening/.test(await line())){ await press(); await sleep(800); say("mic stopped: " + await line()); }
		execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" }); const killed = now(); say("killed Whisper pid " + pid);
		await sleep(1500); await press(); say("pressed the mic with Whisper down");
		await sleep(1500); say("strip says right away: " + await line());
		const before = (await fetch("http://127.0.0.1:8090/api/whisper").then(r => r.json())).crashes;
		let back = null, shown = null;
		while (now() - killed < 60000){
			const l = await line(); if (/Whisper stopped/.test(l) && !shown){ shown = now(); say("strip says: " + l); }
			const r = await fetch("http://127.0.0.1:8090/api/whisper").then(r => r.json()).catch(() => null);
			if (r?.status === "online" && r.crashes > before && !back){ back = now(); say("Servex API: online again, crashes " + r.crashes); }
			if (back && /^Ready/.test(l) && /restarted it/.test(l)){ say("strip says when it is back: " + l); shown ??= now(); back = now(); break; }
			await sleep(250);
		}
		console.log(`WHISPER back after ${back ? back - killed : "never"} ms; page said so after ${shown ? shown - killed : "never"} ms`);
		await refine.screenshot({ path: path.join(OUT, `walk-${mode}-whisper.png`) });
	}
	say("rects: " + await refine.evaluate(() => { const r = s => { const e = document.querySelector(s); const b = e?.getBoundingClientRect(); return b && [Math.round(b.top), Math.round(b.bottom)]; }; return JSON.stringify({ go: r(".refine-go"), toolbar: r(".refine-toolbar"), foot: r(".refine-foot"), scrollY: Math.round(scrollY), vh: innerHeight, docH: document.documentElement.scrollHeight }); }));
	say("tapping Refine");
	const go_at = now();
	await refine[mode === "phone" ? "tap" : "click"](".refine-go", { timeout: 6000 }).catch(async e => { await refine.screenshot({ path: path.join(OUT, `walk-${mode}-tapfail.png`) }); throw e; });
	await sleep(40000);
	clearInterval(poll);
	const rel = k => seen[k] == null ? "never" : `${seen[k] - audio_end} ms after audio end, ${seen[k] - go_at} ms after Refine`;
	for (const k of ["raw", "raw-last-words", "clean", "clean-last-words", "structure", "refined", "cards"]) console.log(`STAGE ${k.padEnd(9)} ${rel(k)}`);
	console.log("overflow:", await watcher.evaluate(() => document.documentElement.scrollWidth - innerWidth), "/ refine page:", await refine.evaluate(() => document.documentElement.scrollWidth - innerWidth));
	console.log("errors:", errs.slice(0, 6));
	await watcher.screenshot({ path: path.join(OUT, `walk-${mode}-session.png`), fullPage: true });
	console.log("SESSION", session);
} finally { await close(); }
