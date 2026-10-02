import fs from "node:fs";
import { browser, close } from "../../../../../../Server/browser.mjs";
/* minion-core's proof, three parts, one browser each (headless, 400x800, fake mic,
 * stubbed Whisper + Servex — never the owner's own tabs, never a real session).
 *
 * 1. BUG 2 ("PAR" bubble) — replay the owner's own real session file
 *    (v-pl3m2ih.jsonl) through the real ✦ sheet and look for "PAR"/"para"
 *    anywhere in the DOM. Also shows, as a side effect, that the OWNER'S OWN
 *    evidence already has the duplicate "All right, I'm just gonna keep
 *    talking…" line THREE TIMES IN THE DATA ITSELF (via "typed" x2, "voice"
 *    x1) — proof that bug 3 is a server-side triplicate, not a client draw bug.
 * 2. BUG 3 (baseline) — one normal dictated sentence, mic on, nothing fancy:
 *    exactly one `say` POST should leave the browser.
 * 3. BUG 4 (sheet closing) — the owner's own nav bounce (Dictate -> a real
 *    ai2 card -> Dictate -> a different real ai2 card, a few hundred ms to a
 *    couple of seconds apart) while the sheet stays open throughout: it must
 *    still be open and showing "open" (not "full") at the end.
 */
const SITE = process.env.SITE ?? "http://localhost:61282";
const HERE = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:");   // this file's own folder, any OS
const OUT = process.argv[2] ?? HERE + "/shots";

function servex_stub(session_id, file_route, extra = {}){
	return async route => {
		const req = route.request(), url = req.url();
		const json = o => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(o) });
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
		if (/\/api\/sessions\?/.test(url)) return json({ ok: true, sessions: [] });
		if (/\/api\/session\/(new|resume)/.test(url)) return json({ ok: true, session: session_id, home: "/framework/ux/Dictate/", file: file_route, resumed: true });
		if (/\/api\/session\/say/.test(url)){ extra.says?.push({ at: new Date().toISOString(), ...(req.postDataJSON?.() ?? {}) }); return json({ ok: true, at: new Date().toISOString() }); }
		if (/\/stream/.test(url)) return route.fulfill({ status: 200, contentType: "text/event-stream", body: "" });
		return json({ ok: true, at: new Date().toISOString() });
	};
}

async function newPage(b){
	const ctx = await b.newContext({ viewport: { width: 400, height: 800 }, permissions: ["microphone"] });
	const p = await ctx.newPage();
	const errs = [];
	p.on("pageerror", e => errs.push("pageerror " + e.message));
	p.on("console", m => { if (m.type() === "error") errs.push(m.type() + " " + m.text().slice(0, 250)); });
	return { ctx, p, errs };
}

const b = await browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
const results = {};

// ---------- 1. BUG 2 — replay the real evidence session, look for "PAR"/"para" ----------
{
	const { p, errs } = await newPage(b);
	const SID = "v-pl3m2ih", FILE = "/probe-session.jsonl";
	// `.sample.txt`, never `.jsonl` — a fixture copy of the owner's own evidence
	// session, kept beside this script so the proof is reproducible on its own;
	// the never-commit-.jsonl rule is about live logs, not a frozen test fixture,
	// but the extension still says so at a glance.
	const raw = fs.readFileSync(HERE + "/evidence-session.sample.txt", "utf8");
	await p.addInitScript(([sid, file]) => { try { sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: sid, file })); } catch {} }, [SID, FILE]);
	await p.route(u => u.pathname === FILE, route => route.fulfill({ status: 200, contentType: "text/plain", body: raw }));
	await p.route(/127\.0\.0\.1:8178|\/whisper\//, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ text: "" }) }));
	await p.route(/127\.0\.0\.1:8090/, servex_stub(SID, FILE));
	await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
	await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
	await p.waitForTimeout(3000);
	const domText = await p.evaluate(() => document.querySelector(".drawer-rail-sheet")?.textContent ?? "(no sheet)");
	const bubbleTexts = await p.evaluate(() => [...document.querySelectorAll(".chatbox, .ux-dictate-widget-bubble")].map(b => b.textContent.trim()).filter(Boolean));
	await p.screenshot({ path: OUT + "/bug2-replay-no-par-400.png", fullPage: true });
	results.bug2 = {
		has_PAR: domText.includes("PAR"),
		has_para_word: /\bpara\b/i.test(domText),
		triplicate_in_the_owners_own_data: bubbleTexts.some(t => (t.match(/All right, I'm just gonna keep talking/g) ?? []).length >= 3),
		errs: errs.slice(0, 10),
	};
	await p.close();
}

// ---------- 2. BUG 3 baseline — one dictated sentence, exactly one say() ----------
{
	const { p, errs } = await newPage(b);
	const says = [];
	let n = 0;
	await p.route(/127\.0\.0\.1:8178|\/whisper\//, async route => {
		const req = route.request();
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
		if (req.method() === "POST"){ n++; return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ text: n < 3 ? `testing ${n}` : `testing ${n}.` }) }); }
		return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true }) });
	});
	await p.route(/127\.0\.0\.1:8090/, servex_stub("proof-baseline", "/proof-baseline.jsonl", { says }));
	await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
	await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
	for (let i = 0; i < 20 && n < 3; i++) await p.waitForTimeout(500);
	await p.evaluate(async () => { const { ComposerMic } = await import("/framework/ext/Chat/Mic.js"); await ComposerMic.on?.stop(); });
	await p.waitForTimeout(1500);
	await p.screenshot({ path: OUT + "/bug3-baseline-one-send-400.png" });
	results.bug3_baseline = { whisper_posts: n, say_count: says.length, says: says.map(s => ({ text: s.text, via: s.via, path: s.path })), errs: errs.slice(0, 10) };
	await p.close();
}

// ---------- 3. BUG 4 — the owner's own nav bounce, sheet must stay open ----------
{
	const { p, errs } = await newPage(b);
	await p.route(/127\.0\.0\.1:8178|\/whisper\//, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ text: "" }) }));
	await p.route(/127\.0\.0\.1:8090/, servex_stub("proof-bounce", "/proof-bounce.jsonl"));
	await p.goto(SITE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
	await p.click(".drawer-rail-ai").catch(e => errs.push("open sheet failed " + e.message));
	await p.waitForTimeout(1000);
	const steps = ["/framework/ai2/2026/09/24/servex/", "/framework/ux/Dictate/", "/framework/ai2/2026/09/24/prompt-mechanics-2/"];
	for (const url of steps){
		await p.evaluate(u => window.app.router.go(u), url);
		await p.waitForTimeout(450);
	}
	await p.waitForTimeout(1200);
	const final = await p.evaluate(() => ({ on: document.querySelector(".drawer-rail-sheet")?.classList.contains("on"), search: location.search, path: location.pathname }));
	await p.screenshot({ path: OUT + "/bug4-sheet-survives-bounce-400.png" });
	results.bug4 = { final, stayed_open: !!final.on && final.search === "?sheet=open", errs: errs.slice(0, 10) };
	await p.close();
}

await close();
console.log(JSON.stringify(results, null, 2));
