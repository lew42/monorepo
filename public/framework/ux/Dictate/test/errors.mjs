// Proof: nothing in dictation fails silently. Each error lands on its stage's light (red) and in the Debug log, with the raw error one click down.
//   node public/framework/ux/Dictate/test/errors.mjs <base-url>
// Headless phone sheet, Servex stubbed. Five faults, one at a time:
//   draw      drawing one session line throws: that line is reported on the Page light, and the lines after it still draw
//   poll      the session file answers 500, then 200 again: the Wire log says the poll failed, then that it works again
//   uncaught  a script throws with nobody catching it: the Page light turns red
//   rejection a promise rejects with nobody catching it: the Page light turns red
//   send      Servex refuses a sentence: the Send light turns red with Servex's own reason, the raw error in the log
// Exit 1 on any failure. Doc: ux/Dictate/doc/debug-tab.md#every-error-caught
import Browser from "../../../../../Server/Browser.mjs";

const [base = "http://monorepo.localhost"] = process.argv.slice(2);
const browser = await Browser.browser();
setTimeout(() => { console.log("FAIL killed after 90 s"); process.exit(2); }, 90000).unref();
const page = await (await browser.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true })).newPage();
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
const json = (r, body, status = 200) => r.fulfill({ status, contentType: "application/json", headers: cors, body: JSON.stringify(body) });
const line = (text, i) => JSON.stringify({ chat: { at: new Date(Date.now() - 600000 + i * 1000).toISOString(), text, via: "voice", from: { kind: "owner" } } });
let file = ["first line.", "BOOM line.", "third line."].map(line).join("\n") + "\n", file_status = 200, say = "ok";
await page.route(/\/api\/session\//, async r => {
	const req = r.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
	if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
	if (verb.endsWith("/stream")) return r.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });
	if (verb === "say" && say === "refuse") return json(r, { ok: false, error: 'no session "stub-session"' }, 404);
	return json(r, { ok: true, session: "stub-session", file: "/stub-session.jsonl", at: new Date().toISOString() });
});
await page.route(/\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
await page.route(/\/api\/hitl/, r => json(r, { ok: true, marks: [] }));
await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: file_status, contentType: "text/plain", body: file_status === 200 ? file : "boom" }));
await page.addInitScript(() => {
	sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: "stub-session", file: "/stub-session.jsonl" }));
	// The fault for "draw": the chat's thread throws on the line that says BOOM (installed as soon as the widget exists).
	const arm = setInterval(() => {
		const t = globalThis.$dictate_widget?.$thread;
		if (!t || t.$armed) return;
		const draw = t.draw.bind(t); t.$armed = true;
		t.draw = entry => { if (/BOOM/.test(entry?.chat?.text ?? "")) throw new Error("test fault: this line cannot be drawn"); return draw(entry); };
		clearInterval(arm);
	}, 20);
});
const health = () => page.evaluate(() => ({ layers: globalThis.DictateHealth.layers, events: globalThis.DictateHealth.events }));
const text = () => page.evaluate(() => document.querySelector(".drawer-rail-sheet")?.textContent ?? "");
const wait_for = async (fn, ms) => { const t = Date.now(); while (Date.now() - t < ms){ if (await fn()) return true; await page.waitForTimeout(250); } return false; };

await page.goto(base + "/framework/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
await page.click(".drawer-rail-ai");
await page.waitForSelector(".drawer-rail-sheet.on", { timeout: 20000 });
await page.evaluate(() => globalThis.$dictate_widget?.stop_mic?.());   // no mic in this test

// draw
await wait_for(async () => (await text()).includes("third line."), 10000);
let h = await health();
check((await text()).includes("third line.") && !(await text()).includes("BOOM"), "draw: the line that throws is skipped, the line after it still drawn");
check(h.layers.page.state === "bad" && /drawing a (session|live) line|drawing a bubble/.test(h.layers.page.why), `draw: the Page light is red: “${h.layers.page.why}”`);
check(h.events.some(e => e.layer === "page" && e.raw?.error?.includes("test fault")), "draw: the Debug log holds the raw error");

// poll
file_status = 500;
const poll_down = await wait_for(async () => (await health()).events.some(e => e.layer === "wire" && /poll .* failed/.test(e.why)), 6000);
file_status = 200;
const poll_up = await wait_for(async () => (await health()).events.some(e => e.layer === "wire" && /works again/.test(e.why)), 6000);
check(poll_down && poll_up, `poll: a failed poll is logged (${poll_down}) and so is its recovery (${poll_up})`);

// uncaught
await page.evaluate(() => setTimeout(() => { throw new Error("test uncaught error"); }));
check(await wait_for(async () => /test uncaught error/.test((await health()).layers.page.why), 3000), "uncaught: the Page light says “" + (await health()).layers.page.why + "”");

// rejection
await page.evaluate(() => { Promise.reject(new Error("test rejection")); });
check(await wait_for(async () => /test rejection/.test((await health()).layers.page.why), 3000), "rejection: the Page light says “" + (await health()).layers.page.why + "”");

// send
say = "refuse";
await page.evaluate(() => { const w = globalThis.$dictate_widget; w.deliver({ text: "a typed sentence.", via: "typed", at: new Date().toISOString() }); });
check(await wait_for(async () => /no session/.test((await health()).layers.sent.why), 12000), "send: the Send light says “" + (await health()).layers.sent.why + "”");
check((await health()).events.some(e => e.layer === "sent" && e.raw?.error?.includes("no session")), "send: the Debug log holds the raw error");

await Browser.close();
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
