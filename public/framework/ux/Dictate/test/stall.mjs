// The stall, reproduced: does dictation keep sending when one layer misbehaves? Headless only; every Servex session verb is stubbed.
//   node public/framework/ux/Dictate/test/stall.mjs <base-url> [scenario]
// Scenarios (default: all):
//   hang      Servex takes the first `say` and never answers it. Do the next sentences still go out?
//   refuse    Servex answers every `say` with an error (a lost session). Does the reader see why?
//   whisper   whisper-server stops answering mid-dictation. Does the reader see why?
//   reload    the page reloads while the mic is on. Was every mic track stopped first?
//   late      Servex answers the first `say` after 12 s (past the 10 s limit) and its line then arrives. One bubble, not "not sent" plus a copy?
// Opens the phone sheet at 400 (split), starts the fake mic (jfk.wav looping) and reads the mic, the bar and the Debug layers.
// Exit 1 on any failure.
import { pathToFileURL } from "url";
import fs from "fs";

const [base = "http://monorepo.localhost", only] = process.argv.slice(2);
const PW = process.env.PWENTRY ?? "C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const here = new URL("../../../ai/recordings/jfk.wav", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const wav = process.env.WAV ?? (fs.existsSync(here) ? here : "C:/Code/lew42/monorepo/public/framework/ai/recordings/jfk.wav");   // recordings/ is git-ignored: a worktree has none
const { chromium } = await import(pathToFileURL(PW).href);
const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
const kill = setTimeout(() => { console.log("FAIL killed after 300 s"); process.exit(2); }, 300000);
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };

async function open({ say = "ok", whisper_dies_after = Infinity } = {}){
	const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, permissions: ["microphone"], hasTouch: true, isMobile: true });
	const page = await ctx.newPage();
	const run = { said: [], hung: 0, inference: 0, errors: [], lines: [] };
	page.on("pageerror", e => run.errors.push(String(e).slice(0, 200)));
	await page.route(/\/api\/session\//, async route => {
		const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
		if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: { "access-control-allow-origin": "*" }, body: "retry: 60000\n\n" });
		let body = {}; try { body = JSON.parse(req.postData() ?? "{}"); } catch {}
		if (verb === "say"){
			run.said.push(body.text);
			if (say === "hang" && run.said.length === 1){ run.hung++; return; }   // never answered: the request stays open
			if (say === "late" && run.said.length === 1){   // a slow success: written at once, answered after the client gave up
				const at = new Date().toISOString(); run.lines.push({ chat: { at, from: { kind: "owner" }, via: "voice", text: body.text } });
				await new Promise(r => setTimeout(r, 12000));
				return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true, at }) }).catch(() => {});
			}
			if (say === "refuse") return route.fulfill({ status: 404, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: false, error: 'no session "stub-session"' }) });
		}
		const out = verb === "new" || verb === "resume" ? { ok: true, session: "stub-session", file: "/stub-session.jsonl" } : verb === "say" ? { ok: true, at: new Date().toISOString() } : { ok: true };
		await route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(out) });
	});
	await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: run.lines.map(l => JSON.stringify(l)).join("\n") }));
	await page.route(/\/api\/sessions\?/, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true, sessions: [] }) }));
	await page.route(/\/log\/prompts/, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "{}" }));
	await page.route(/:8178\/inference/, route => {
		run.inference++;
		if (run.inference > whisper_dies_after) return route.abort("connectionrefused");
		return route.continue();
	});
	await page.addInitScript(() => {
		// count every mic track stop, and keep the count across a reload
		const stop = MediaStreamTrack.prototype.stop;
		MediaStreamTrack.prototype.stop = function(){ if (this.kind === "audio" && this.readyState === "live") sessionStorage.setItem("stall.stopped", String(+(sessionStorage.getItem("stall.stopped") ?? 0) + 1)); return stop.call(this); };
		const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
		navigator.mediaDevices.getUserMedia = async c => { const s = await gum(c); sessionStorage.setItem("stall.opened", String(+(sessionStorage.getItem("stall.opened") ?? 0) + s.getAudioTracks().length)); return s; };
	});
	await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
	await page.evaluate(async () => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); window.$sheet = Sheet.of(); await window.$sheet.to("split", { listen: false }); });
	await page.waitForSelector(".drawer-rail-sheet.on .ux-dictate-widget", { timeout: 20000 });
	await page.waitForTimeout(600);
	await page.evaluate(() => globalThis.$dictate_widget.start_mic());
	return { ctx, page, run };
}

// What the reader can see, and the mic's own state.
const look = page => page.evaluate(() => {
	const m = globalThis.$dictate_widget?.dictate, bar = document.querySelector(".drawer-rail-sheet .dictation-bar[data-size=full]");
	return { state: m?.state, posting: m?.posting ?? 0, held: (m?.held ?? []).length, bar: bar?.textContent?.replace(/\s+/g, " ").trim(),
		failed: document.querySelectorAll(".drawer-rail-sheet .chatbox-failed").length,
		last: [...document.querySelectorAll(".drawer-rail-sheet .chatbox")].slice(-2).map(b => b.outerHTML.slice(0, 300)),
		lines: [...(globalThis.$dictate_widget?.$thread?.lines?.keys?.() ?? [])],
		health: globalThis.DictateHealth?.snapshot?.() ?? null };
});
const wait_for = async (page, fn, ms) => { const t = Date.now(); while (Date.now() - t < ms){ if (await fn()) return true; await page.waitForTimeout(500); } return false; };

const scenarios = {
	async hang(){
		const { ctx, page, run } = await open({ say: "hang" });
		await wait_for(page, () => run.said.length >= 1, 40000);
		await page.waitForTimeout(25000);   // jfk.wav loops: several more sentences are spoken in this time
		const v = await look(page);
		console.log("  hang:", JSON.stringify({ said: run.said.length, ...v, health: v.health?.sent }));
		check(run.said.length >= 2, `after one say never answered, later sentences still go out (${run.said.length} say posts)`);
		check(v.failed >= 1 || /not sent|did not answer/i.test(JSON.stringify(v)), "the unanswered send is shown as not sent, with the reason");
		await ctx.close();
	},
	async refuse(){
		const { ctx, page, run } = await open({ say: "refuse" });
		await wait_for(page, () => run.said.length >= 1, 40000);
		await page.waitForTimeout(3000);
		const v = await look(page);
		console.log("  refuse:", JSON.stringify({ said: run.said.length, ...v, health: v.health?.sent }));
		check(v.failed >= 1, "a refused send is marked not sent on its bubble");
		check(/no session/i.test(JSON.stringify(v.health ?? {})), "the Debug layers say Servex's own reason (no session)");
		await ctx.close();
	},
	async whisper(){
		const { ctx, page, run } = await open({ whisper_dies_after: 4 });
		await wait_for(page, async () => (await look(page)).state === "error", 45000);
		const v = await look(page);
		console.log("  whisper:", JSON.stringify({ inference: run.inference, ...v, health: v.health?.whisper }));
		check(v.state === "error", "the mic stops with an error when Whisper stops answering");
		check(/whisper/i.test(v.bar ?? ""), "the bar says it was Whisper: " + v.bar);
		await ctx.close();
	},
	async late(){
		const { ctx, page, run } = await open({ say: "late" });
		await page.evaluate(() => globalThis.$dictate_widget.stop_mic());   // one sentence is enough: the first say is the slow one
		await wait_for(page, () => run.said.length >= 1, 40000);
		await page.evaluate(() => globalThis.$dictate_widget.stop_mic());
		await page.waitForTimeout(16000);   // past the 10 s limit, the 12 s answer, and a 1.5 s poll
		const v = await page.evaluate(t => ({ copies: [...document.querySelectorAll(".drawer-rail-sheet .chatbox-you .chatbox-text")].filter(n => n.textContent.includes(t.slice(0, 20))).length,
			failed: document.querySelectorAll(".drawer-rail-sheet .chatbox-failed").length, sent: globalThis.DictateHealth.layers.sent.why }), run.said[0]);
		console.log("  late:", JSON.stringify(v));
		check(v.copies === 1, `a send that timed out but succeeded is drawn once (${v.copies})`);
		check(v.failed === 0, "and its \"not sent\" mark is taken off");
		check(/^sent/.test(v.sent), "and the Sent row says it was sent: " + v.sent);
		await ctx.close();
	},
	async reload(){
		const { ctx, page } = await open();
		await wait_for(page, async () => (await look(page)).state === "listening", 20000);
		const before = await page.evaluate(() => ({ opened: +sessionStorage.getItem("stall.opened"), stopped: +sessionStorage.getItem("stall.stopped") }));
		page.on("dialog", d => d.accept());   // the reload guard asks first while the mic is live
		await page.reload({ waitUntil: "domcontentloaded" });
		const after = await page.evaluate(() => ({ opened: +sessionStorage.getItem("stall.opened"), stopped: +sessionStorage.getItem("stall.stopped") }));
		console.log("  reload:", JSON.stringify({ before, after }));
		check(after.stopped >= before.opened, `every mic track opened before the reload was stopped by the page (${after.stopped} of ${before.opened})`);
		await ctx.close();
	},
};

for (const [name, fn] of Object.entries(scenarios)){
	if (only && only !== name) continue;
	console.log("--", name);
	try { await fn(); } catch (e){ check(false, name + " threw: " + e.message); }
}
await browser.close();
clearTimeout(kill);
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
