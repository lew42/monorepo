// The Debug tab, proven: a row of lights, all green while you talk; a compact live log, the raw data one click down; a tap on
// a light narrows the log; the handle between the chat and the tab keeps its height over a reload; routed; shot at 390 and 1920.
//   node public/framework/ux/Dictate/test/debug-tab.mjs <base-url> <shots dir>
// Headless; every Servex session verb is stubbed (the "AI" answers from a stub session file), the mic is jfk.wav.
// Exit 1 on any failure.
import fs from "fs";

const [base = "http://monorepo.localhost", shots = "."] = process.argv.slice(2);
fs.mkdirSync(shots, { recursive: true });
const here = new URL("../../../ai/recordings/jfk.wav", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const wav = process.env.WAV ?? (fs.existsSync(here) ? here : "C:/Code/lew42/monorepo/public/framework/ai/recordings/jfk.wav");
const { default: Browser } = await import(new URL("../../../../../Server/Browser.mjs", import.meta.url).href);   // the shared launcher: no window
const browser = await Browser.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
const kill = setTimeout(() => { console.log("FAIL killed after 240 s"); process.exit(2); }, 240000);
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
// An ISO time in this machine's zone with its offset, the shape Servex writes ("2026-10-24T23:15:23.123-05:00")
const local = ms => { const off = -new Date(ms).getTimezoneOffset(), p = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(ms + off * 60000).toISOString().slice(0, -1) + (off >= 0 ? "+" : "-") + p(Math.trunc(off / 60)) + ":" + p(off % 60); };

async function context(viewport, mobile){
	const ctx = await browser.newContext({ viewport, permissions: ["microphone"], ...(mobile ? { hasTouch: true, isMobile: true } : {}) });
	const page = await ctx.newPage();
	const run = { said: [], errors: [] };
	page.on("pageerror", e => run.errors.push(String(e).slice(0, 200)));
	// CHAT_JS=<file>: serve that chat.js instead (to show this test fails on an older one), the way new-session.mjs swaps in a worktree's
	if (process.env.CHAT_JS) await page.route(/\/framework\/ux\/Dictate\/chat\.js(\?.*)?$/, r => r.fulfill({ path: process.env.CHAT_JS, contentType: "application/javascript" }));
	const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
	// A wire that opens and stays quiet, so the proof never reaches the real Servex (a stubbed response would end and read as a dropped wire).
	await page.addInitScript(() => { window.EventSource = class { constructor(url){ this.url = url; this.readyState = 1; setTimeout(() => this.onopen?.({}), 0); } close(){ this.readyState = 2; } }; });
	await page.route(/\/api\/session\//, async route => {
		const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
		if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });   // a wire that stays quiet: the proof never reaches the real Servex
		let body = {}; try { body = JSON.parse(req.postData() ?? "{}"); } catch {}
		if (verb === "say") run.said.push({ text: body.text, at: new Date().toISOString() });
		const out = verb === "new" || verb === "resume" ? { ok: true, session: "stub-session", file: "/stub-session.jsonl" } : verb === "say" ? { ok: true, at: run.said.at(-1).at } : { ok: true };
		await route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) });
	});
	// the session file: the owner's lines, each answered by the "smart" assistant 1 s later, stamped the way Servex stamps them
	// (local time with its offset, "…-05:00", Sessions.js now_ms): a browser-side text compare against "…Z" got this wrong
	await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: run.said.flatMap(s => [
		{ chat: { at: local(Date.parse(s.at)), from: { kind: "owner" }, via: "voice", text: s.text } },
		...(Date.now() - Date.parse(s.at) > 1000 ? [{ chat: { at: local(Date.parse(s.at) + 1000), from: { kind: "assistant", id: "smart" }, text: "Heard you: " + s.text.slice(0, 40) } }] : []),
	]).map(l => JSON.stringify(l)).join("\n") }));
	await page.route(/\/api\/sessions\?/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ ok: true, sessions: [] }) }));
	await page.route(/\/log\/prompts/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: "{}" }));
	return { ctx, page, run };
}
const LIGHTS = ["mic", "whisper", "transcripts", "sentence", "sent", "llm", "wire", "page"];
const layers = page => page.evaluate(() => [...document.querySelectorAll(".dictate-debug .voice-conn-step")].filter(s => s.offsetParent).map(s => s.dataset.step + "=" + s.dataset.state));
const wait_for = async (page, fn, ms) => { const t = Date.now(); while (Date.now() - t < ms){ if (await fn()) return true; await page.waitForTimeout(500); } return false; };

// ---- the phone: the sheet, the mic on, then Debug from the AI ▾ menu, then a reload
{
	const { ctx, page, run } = await context({ width: 390, height: 844 }, true);
	await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
	await page.evaluate(async () => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); window.$sheet = Sheet.of(); await window.$sheet.to("split", { listen: false }); });
	await page.waitForSelector(".drawer-rail-sheet.on .ux-dictate-widget", { timeout: 20000 });
	await page.evaluate(() => globalThis.$dictate_widget.start_mic());
	await wait_for(page, () => run.said.length >= 2, 60000);
	await page.evaluate(() => window.$sheet.$sheet.choose("debug"));
	await page.waitForSelector(".drawer-rail-sheet .dictate-debug", { timeout: 15000 });
	await wait_for(page, async () => (await layers(page)).includes("llm=ok"), 15000);
	const url = new URL(page.url()).pathname, live = await layers(page);
	console.log("  phone:", url, live.join(" "));
	check(url === "/framework/ext/drawer/ai/debug/", "picking Debug routes the sheet to <path>/ai/debug/ (" + url + ")");
	check(LIGHTS.every(id => live.includes(id + "=ok")), "all eight lights are green while dictating: " + live.join(" "));
	const fit = await page.evaluate(() => {   // the lights on top in at most two rows, the log under them with room, the chat still above
		const steps = [...document.querySelectorAll(".drawer-rail-sheet .dictate-debug .voice-conn-step")].filter(s => s.offsetParent);
		const rows = new Set(steps.map(s => Math.round(s.getBoundingClientRect().top))).size;
		const log = document.querySelector(".drawer-rail-sheet .dictate-debug-log")?.getBoundingClientRect();
		const chat = document.querySelector(".drawer-rail-sheet .ux-dictate-widget-thread")?.getBoundingClientRect().height ?? 0;
		const lines = [...document.querySelectorAll(".drawer-rail-sheet .dictate-debug-line")];
		const one_line = lines.slice(0, 20).every(l => l.querySelector("summary").getBoundingClientRect().height < 30);
		return { lights: steps.length, rows, log_h: Math.round(log?.height ?? 0), log_bottom: Math.round(log?.bottom ?? 0), chat: Math.round(chat), lines: lines.length,
			heard: lines.filter(l => l.dataset.layer === "transcripts").length, one_line };
	});
	console.log("  fit:", JSON.stringify(fit));
	check(fit.lights === 8 && fit.rows <= 2, `eight lights in ${fit.rows} row(s) at 390`);
	check(fit.log_h >= 120 && fit.log_bottom <= 844 && fit.chat > 30, `the log has ${fit.log_h}px under the lights, the chat ${fit.chat}px above`);
	check(fit.lines >= 5 && fit.heard >= 2 && fit.one_line, `a compact log: ${fit.lines} lines, ${fit.heard} of them Whisper answers, each one line`);
	// the raw data, one click down
	await page.click('.drawer-rail-sheet .dictate-debug-line[data-layer="transcripts"] summary');
	const raw = await page.evaluate(() => document.querySelector(".drawer-rail-sheet .dictate-debug-line[open] .dictate-debug-raw")?.textContent ?? "");
	check(/"text":/.test(raw) && /"kind":/.test(raw), "a click on a Whisper line shows its raw answer: " + raw.replace(/\s+/g, " ").slice(0, 90));
	await page.screenshot({ path: shots + "/debug-390.png" });
	const raws = await page.evaluate(async () => {
		const out = {};
		for (const layer of ["sent", "llm", "sentence"]){
			const line = document.querySelector(`.drawer-rail-sheet .dictate-debug-line[data-layer="${layer}"]`);
			if (!line) { out[layer] = null; continue; }
			line.querySelector("summary").click();
			out[layer] = { why: line.querySelector(".dictate-debug-why")?.textContent ?? "", raw: line.querySelector(".dictate-debug-raw")?.textContent ?? "" };
		}
		return out;
	});
	check(raws.sent && /"text"/.test(raws.sent.raw), "a Send line has raw data one click down: " + (raws.sent?.raw ?? "none").replace(/\s+/g, " ").slice(0, 70));
	check(raws.llm && /"chat"/.test(raws.llm.raw), "a Reply line has the raw session line one click down: " + (raws.llm?.raw ?? "none").replace(/\s+/g, " ").slice(0, 70));
	check(raws.sentence && /\bso\b/.test(raws.sentence.why), "the Sentence line keeps its letters: " + (raws.sentence?.why ?? "none"));
	// a tap on a light: its last word in full, the log narrowed to it; a second tap for everything
	await page.click('.drawer-rail-sheet .voice-conn-step[data-step="sent"]');
	const only = await page.evaluate(() => ({ detail: document.querySelector(".drawer-rail-sheet .dictate-debug-detail")?.textContent ?? "",
		shown: [...document.querySelectorAll(".drawer-rail-sheet .dictate-debug-line")].filter(l => !l.hidden).map(l => l.dataset.layer) }));
	check(/sent/.test(only.detail) && only.shown.length > 0 && only.shown.every(l => l === "sent"), `a tap on Send: “${only.detail.slice(0, 70)}”, ${only.shown.length} Send lines only`);
	await page.screenshot({ path: shots + "/debug-390-send.png" });
	await page.click('.drawer-rail-sheet .voice-conn-step[data-step="sent"]');
	// the handle: drag it 150 px down (the Debug panel shorter, the chat taller: the panel already fills the sheet); the height survives the reload below
	const tabs_h = () => page.evaluate(() => Math.round(document.querySelector(".drawer-rail-sheet-tabs")?.getBoundingClientRect().height ?? 0));
	const before_h = await tabs_h();
	const g = await page.evaluate(() => { const r = document.querySelector(".drawer-rail-sheet-tabs > .grip")?.getBoundingClientRect(); return r && { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
	if (g){ await page.mouse.move(g.x, g.y); await page.mouse.down(); await page.mouse.move(g.x, g.y + 75, { steps: 5 }); await page.mouse.move(g.x, g.y + 150, { steps: 5 }); await page.mouse.up(); }
	await page.waitForTimeout(300);
	const dragged_h = await tabs_h();
	check(!!g && before_h - dragged_h > 100, `the handle between the chat and Debug drags: ${before_h}px → ${dragged_h}px`);
	page.on("dialog", d => d.accept());
	await page.reload({ waitUntil: "domcontentloaded" });
	await page.waitForSelector(".drawer-rail-sheet.on .dictate-debug", { timeout: 20000 }).catch(() => {});
	const after = await page.evaluate(() => ({ path: location.pathname, debug: !!document.querySelector(".drawer-rail-sheet.on .dictate-debug"), full: !!document.querySelector(".drawer-rail-sheet-full") }));
	console.log("  after reload:", JSON.stringify(after));
	check(after.debug && after.full && after.path === url, "a reload opens the full sheet on the Debug tab again");
	await page.waitForTimeout(800);
	const reload_h = await tabs_h();
	check(Math.abs(reload_h - dragged_h) <= 4, `the dragged height survives the reload: ${dragged_h}px → ${reload_h}px`);
	await page.screenshot({ path: shots + "/debug-390-reloaded.png" });
	check(!run.errors.length, "no page errors on the phone: " + run.errors.join(" | "));
	await ctx.close();
}

// ---- 1920: the chat on <path>/ai/, the mic on, then the Debug view in the page
{
	const { ctx, page, run } = await context({ width: 1920, height: 1080 });
	await page.goto(base + "/framework/ext/drawer/ai/", { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".ux-dictate-widget", { timeout: 20000 });   // at 1920 the chat is in the dock (Sheet.Dock), not the page
	await page.evaluate(() => globalThis.$dictate_widget.start_mic());
	await wait_for(page, () => run.said.length >= 2, 60000);
	await page.waitForTimeout(1500);
	await page.click(".drawer-ai-page-view[href$='/ai/debug/']");
	await page.waitForSelector(".drawer-ai-page-body .dictate-debug", { timeout: 15000 });
	await page.waitForTimeout(1200);
	const live = await layers(page);
	console.log("  1920:", new URL(page.url()).pathname, live.join(" "));
	check(live.length === 8 && live.every(l => l.endsWith("=ok")), "the Debug view shows the eight lights at 1920, all green: " + live.join(" "));
	await page.screenshot({ path: shots + "/debug-1920.png" });
	await page.reload({ waitUntil: "domcontentloaded" });
	await page.waitForSelector(".drawer-ai-page-body .dictate-debug", { timeout: 20000 }).catch(() => {});
	check(await page.$(".drawer-ai-page-body .dictate-debug") !== null, "a reload at 1920 keeps the Debug view (" + new URL(page.url()).pathname + ")");
	check(!run.errors.length, "no page errors at 1920: " + run.errors.join(" | "));
	await ctx.close();
}

// ---- the old name: ?drawer=dictation and <path>/ai/dictation/ still open Debug (one alias, AIPage.old_link), at 390 and 1920
for (const width of [390, 1920]){
	const { ctx, page, run } = await context({ width, height: width < 800 ? 844 : 1080 });
	for (const old of ["/framework/ext/drawer/?drawer=dictation", "/framework/ext/drawer/ai/dictation/"]){
		await page.goto(base + old, { waitUntil: "domcontentloaded" });
		const ok = await page.waitForSelector(".dictate-debug", { state: "attached", timeout: 20000 }).then(() => true, () => false);
		const at = new URL(page.url()).pathname;
		check(ok && at === "/framework/ext/drawer/ai/debug/", `${width}: the old link ${old} opens Debug at ${at}`);
	}
	check(!run.errors.length, `no page errors on the old links at ${width}: ` + run.errors.join(" | "));
	await ctx.close();
}

await browser.close();
clearTimeout(kill);
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
