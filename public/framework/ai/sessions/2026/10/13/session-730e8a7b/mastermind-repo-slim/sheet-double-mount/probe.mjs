// Counts the chat widgets and feeds in the DOM at each size. Headless; posting is stubbed (never posts as the owner).
//   node probe.mjs <base-url> [shots dir]      exit 1 when any count is not 1 and 1 (or 0 and 0 where noted)
import Browser from "../../../../../../../../../../Server/Browser.mjs";
const [base = "http://monorepo.localhost", shots] = process.argv.slice(2);
const wav = process.env.WAV ?? "C:/Code/lew42/monorepo/public/framework/ai/recordings/jfk.wav";
const browser = await Browser.browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };

async function open(width, url){
	const ctx = await browser.newContext({ viewport: { width, height: 800 }, permissions: ["microphone"], hasTouch: width < 800, isMobile: width < 800 });
	const page = await ctx.newPage();
	page.errors = []; page.said = [];
	page.on("pageerror", e => page.errors.push(String(e).slice(0, 200)));
	await page.route(/\/api\/session\//, async route => {
		const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
		let body = {}; try { body = JSON.parse(req.postData() ?? "{}"); } catch {}
		if (verb === "say") page.said.push(body.text);
		const out = verb === "new" || verb === "resume" ? { ok: true, session: "stub-session", file: "/stub-session.jsonl" } : verb === "say" ? { ok: true, at: new Date().toISOString() } : { ok: true };
		await route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(out) });
	});
	await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: "" }));
	await page.route(/\/api\/sessions\?/, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true, sessions: [] }) }));
	await page.route(/\/api\/page-ai|\/log\/(prompts|cards)/, r => r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
	await page.goto(base + url, { waitUntil: "domcontentloaded" });
	return page;
}

const count = page => page.evaluate(() => {
	const vis = el => !!(el.offsetWidth || el.offsetHeight);
	const w = [...document.querySelectorAll(".ux-dictate-widget")], f = [...document.querySelectorAll(".drawer-ai-feed")];
	return { widgets: w.length, feeds: f.length, widgets_visible: w.filter(vis).length, feeds_visible: f.filter(vis).length, where: w.map(e => e.closest(".drawer-rail-sheet") ? "sheet" : e.closest(".drawer-ai-page-body") ? "page" : e.closest(".drawer") ? "dock" : "other") };
});
const show = (page, label, n) => console.log(`     ${label}: widgets ${n.widgets} (visible ${n.widgets_visible}) feeds ${n.feeds} (visible ${n.feeds_visible}) in ${n.where.join("+")}`);
const settle = page => page.waitForTimeout(2500);

const PATH = "/framework/ext/drawer/";
// 1. phone, a link straight to <path>/ai/
for (const size of ["strip", "split", "full"]){
	const page = await open(400, PATH + "ai/");
	await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
	await page.evaluate(async size => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); await Sheet.of().to(size, { listen: false }); }, size);
	await settle(page);
	const n = await count(page); show(page, "400 ai/ " + size, n);
	check(n.widgets === 1 && n.feeds === 1, `400 ${PATH}ai/ at ${size}: one chat, one feed`);
	if (size === "split" && shots) await page.screenshot({ path: shots + "/phone-split.png" });
	if (page.errors.length) console.log("     page errors:", page.errors);
	await page.context().close();
}
// 2. phone, ✦ from the closed page (the sheet first, then the routed page)
{
	const page = await open(400, PATH);
	await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
	await page.click(".drawer-rail-ai"); await settle(page);
	const n = await count(page); show(page, "400 tap ✦", n);
	check(n.widgets === 1 && n.feeds === 1, "400 tapping ✦: one chat, one feed");
	await page.evaluate(async () => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); await Sheet.of().to("full", { listen: false }); }); await settle(page);
	const f = await count(page); show(page, "400 then full", f);
	check(f.widgets === 1 && f.feeds === 1, "400 ✦ then full: one chat, one feed");
	await page.context().close();
}
// 3. a real page's /ai/ at 400 and 1200, and the dock at 1920
for (const [w, url, label] of [[400, "/framework/core/Page/ai/", "core/Page/ai/"], [1200, PATH + "ai/", "drawer ai/ 1200"], [1200, "/framework/core/Page/ai/", "core/Page/ai/ 1200"], [1920, PATH, "dock 1920"], [1920, PATH + "ai/", "dock 1920 ai/"]]){
	const page = await open(w, url);
	await page.waitForSelector("body", { timeout: 20000 });
	await settle(page);
	const n = await count(page); show(page, `${w} ${label}`, n);
	check(n.widgets <= 1 && n.feeds <= 1, `${w} ${label}: at most one chat, one feed`);
	await page.context().close();
}
await browser.close();
process.exit(failed ? 1 : 0);
