// The settings panel: the send delay holds across a reload, and it really is the wait before a send.
//   node public/framework/ux/Dictate/test/settings.mjs <base-url> [shots-dir]
// Headless, phone sheet at 400 , every Servex call stubbed (nothing is posted). The mic is driven by hand, as in test/order.mjs.
// Checks: (1) change the send delay to 3 s, reload, the gear panel still shows 3; (2) with the delay at 3 s, two sentences 1 s apart leave as ONE prompt,
// and with it at 0.5 s the same two sentences leave as TWO; (3) the smart assistant's batch seconds POST /api/session/settings {gap_ms}.
import fs from "fs";
import path from "path";

const [base = "http://monorepo.localhost", shots_arg] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const shots = shots_arg ?? path.resolve(here, "../../../ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/settings/shots");
fs.mkdirSync(shots, { recursive: true });
const { default: Browser } = await import(new URL("../../../../../Server/Browser.mjs", import.meta.url).href);
const browser = await Browser.launch();
const kill = setTimeout(() => { console.log("FAIL killed after 120 s"); process.exit(2); }, 120000);
let fails = 0;
const check = (ok, what) => { console.log((ok ? "ok   " : "FAIL ") + what); if (!ok) fails++; };

async function open(ctx, store){
	const page = await ctx.newPage();
	const errors = [], said = [], knobs = [];
	page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
	const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
	const json = (route, out) => route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) }).catch(() => {});
	await page.route(/\/api\/session\//, async route => {
		const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
		if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });
		let body = {}; try { body = JSON.parse(req.postData() ?? "{}"); } catch {}
		if (verb === "say"){ said.push(body.text); return json(route, { ok: true, at: new Date().toISOString() }); }
		if (verb === "settings"){ knobs.push(body); return json(route, { ok: true }); }
		return json(route, verb === "new" || verb === "resume" ? { ok: true, session: "stub-session", file: "/stub-session.jsonl" } : { ok: true });
	});
	await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: "" }));
	await page.route(/\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
	await page.route(/\/log\/prompts/, r => json(r, {}));
	await page.route(/\/api\/hitl/, r => json(r, { ok: true, marks: [{ mark: "ok" }] }));
	await page.route(/\/api\/refine\/live/, r => json(r, { ok: true, slots: [], outline: { sections: [] } }));
	await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".drawer-rail-ai", { state: "attached", timeout: 20000 });
	await page.evaluate(async () => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); window.$sheet = Sheet.of(); await window.$sheet.to("full", { listen: false }); });
	await page.waitForSelector(".drawer-rail-sheet.on .ux-dictate-widget", { timeout: 20000 });
	await page.waitForTimeout(800);
	return { page, errors, said, knobs };
}
const gear = async page => {   // open the gear panel (the old "Dictation settings" sheet)
	await page.locator(".drawer-rail-sheet.on .dictation-bar-gear").first().click();
	await page.waitForSelector(".chatbox-compose-menu-panel:not([hidden]) input[data-key=send_delay]");
};

// 1. the value holds across a reload
{
	const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true, isMobile: true });
	let { page, errors } = await open(ctx);
	await gear(page);
	check(await page.inputValue("input[data-key=send_delay]") === "2", "default send delay is 2 s");
	await page.screenshot({ path: path.join(shots, "panel-400.png") });
	await page.fill("input[data-key=send_delay]", "3");
	await page.locator("input[data-key=send_delay]").dispatchEvent("change");
	await page.close();
	({ page, errors } = await open(ctx));
	await gear(page);
	check(await page.inputValue("input[data-key=send_delay]") === "3", "after a reload the send delay still reads 3 s");
	check(errors.length === 0, "no page errors" + (errors[0] ? ": " + errors[0] : ""));
	await ctx.close();
}
// 2 and 3: the delay is the wait
for (const [delay_s, want] of [[3, 1], [0.5, 2]]){
	const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true, isMobile: true });
	const { page, errors, said, knobs } = await open(ctx);
	await gear(page);
	await page.fill("input[data-key=send_delay]", String(delay_s));
	await page.locator("input[data-key=send_delay]").dispatchEvent("change");
	await page.evaluate(async () => { await new Promise(r => setTimeout(r, 0)); document.querySelector(".chatbox-compose-menu-close")?.click(); });
	const trace = await page.evaluate(async delay_s => {   // the mic is driven by hand; the automatic-send timer is the real one
		const m = globalThis.$dictate_widget.dictate, wait = ms => new Promise(r => setTimeout(r, ms));
		m.state = "listening"; m.revise = false;
		clearInterval(m.auto_timer); m.auto_timer = setInterval(() => m.auto_check(), 250);
		let chunk = 0;
		const say = async text => {
			const words = text.replace(/[.!?]$/, "").split(" ");
			for (let n = 1; n <= words.length; n++){ m.partial_text = words.slice(0, n).join(" "); m.draw_caption(); m.last_speech = performance.now(); await wait(60); }
			m.partial_text = "";
			m.log_prompt(text, ++chunk);
			m.last_speech = performance.now();
		};
		await wait(300);
		await say("Let us start with the flicker.");
		await wait(1000 - 60 * 3);   // the second one starts about a second after the first
		await say("Then check the order of words.");
		const trace = [];
		for (let i = 0; i < 6; i++){ await wait(delay_s * 1000 / 4 + 400); trace.push(Math.round(performance.now() - m.last_speech) + "ms quiet, box=" + JSON.stringify(m.box()?.value) + ", held=" + (m.held ?? []).length); }
		clearInterval(m.auto_timer);
		return trace;
	}, delay_s);
	if (process.env.TRACE) console.log(trace.join("; ") + " said: " + JSON.stringify(said));
	await page.waitForTimeout(500);
	check(said.length === want, `delay ${delay_s} s, sentences 1 s apart: ${said.length} prompt(s) sent (want ${want})${said.length ? ": " + said.map(t => JSON.stringify(t)).join(" + ") : ""}`);
	if (want === 1) check(/flicker/i.test(said[0] ?? "") && /order/i.test(said[0] ?? ""), "the one prompt holds both sentences");
	// 3. the smart assistant's knob goes to Servex (the session exists now that something was sent)
	await gear(page);
	await page.fill("input[data-key=wake_gap_s]", "12");
	await page.locator("input[data-key=wake_gap_s]").dispatchEvent("change");
	await page.waitForTimeout(500);
	check(knobs.some(k => k.session === "stub-session" && k.gap_ms === 12000), "batch seconds POSTed as gap_ms 12000 to the session: " + JSON.stringify(knobs.at(-1) ?? null));
	check(errors.length === 0, "no page errors" + (errors[0] ? ": " + errors[0] : ""));
	await ctx.close();
}
// the same panel on a wide screen (the gear is the composer's own there, not the bar's)
{
	const ctx = await browser.newContext({ viewport: { width: 1920, height: 1000 } });
	const page = await ctx.newPage();
	await page.goto(base + "/framework/ux/Dictate/", { waitUntil: "domcontentloaded" });
	const g = page.locator(".chatbox-compose-menu").first();
	await g.waitFor({ state: "attached", timeout: 20000 });
	await g.scrollIntoViewIfNeeded().catch(() => {});
	await g.click({ timeout: 5000 }).catch(() => g.evaluate(b => b.click()));
	await page.waitForSelector(".chatbox-compose-menu-panel:not([hidden]) input[data-key=send_delay]");
	check(await page.locator("input[data-key=wake_gap_s]").count() === 1, "1920: the smart assistant rows are in the panel");
	await page.screenshot({ path: path.join(shots, "panel-1920.png") });
	await ctx.close();
}
clearTimeout(kill);
await browser.close();
process.exit(fails ? 1 : 0);
