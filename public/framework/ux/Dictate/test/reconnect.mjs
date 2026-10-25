// Proof: the sheet's Reconnect button shows only when the live wire to Servex is really down, says what and why, and a press is safe.
//   node public/framework/ux/Dictate/test/reconnect.mjs <base-url> [shots dir]
// Headless, Servex stubbed, nothing restarted. Three phases on the session stream:
//   1. blips: every answer is a 200 whose body ends at once (what the LAN /servex proxy does every 30 s); the browser
//      reopens it in a second. Pass = the button never shows.
//   2. down: 502 for 14 s (what the /servex proxy says while Servex restarts; a 502 CLOSES an EventSource for good).
//      Pass = hidden for the first WIRE_GRACE_MS, then shown with "Servex link down N s: <reason>"; a press asks at once;
//      ten fast presses open no second wire and throw nothing.
//   3. up: the stream passes through again. Pass = the button hides by itself, and the log got "lost" and "reconnected".
// Doc: ux/Dictate/doc/debug-tab.md#reconnect, ext/drawer/doc/sheet.md
import fs from "fs";
import Browser from "../../../../../Server/Browser.mjs";

const [base = "http://monorepo.localhost", dir] = process.argv.slice(2);
const browser = await Browser.browser();
setTimeout(() => { console.log("FAIL killed after 90 s"); process.exit(2); }, 90000).unref();
const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true });
const page = await ctx.newPage();
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
const errors = [];
page.on("pageerror", e => errors.push(e.message));
const json = (r, body) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
await page.route(/\/api\/session\/(new|resume|say|nav|floor|quiet|react|pause|select)/, r => json(r, { ok: true, session: "stub-session", file: "/stub-session.jsonl", at: new Date().toISOString() }));
await page.route(/\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: "" }));
let phase = "blip", hits = 0;
await page.route(/\/api\/session\/[^/]+\/stream/, r => {
	hits++;
	if (phase === "blip") return r.fulfill({ status: 200, contentType: "text/event-stream", headers: { "access-control-allow-origin": "*" }, body: "retry: 1000\n\n" });
	if (phase === "down") return r.fulfill({ status: 502, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"error":"Servex unreachable"}' });
	return r.continue();
});
const logged = [];
page.on("websocket", ws => ws.on("framesent", f => { const s = String(f.payload ?? ""); if (s.includes('"connection"')) logged.push(s); }));
await page.addInitScript(() => {
	sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: "stub-session", file: "/stub-session.jsonl" }));
	// Count the live wires (EventSources on a session stream) and every time the button becomes visible.
	const ES = window.EventSource; window.__wires = new Set(); window.__shows = 0;
	window.EventSource = class extends ES {
		constructor(url, ...a){ super(url, ...a); if (/\/api\/session\//.test(url)) window.__wires.add(this); }
		close(){ window.__wires.delete(this); return super.close(); }
	};
	let was = false;
	new MutationObserver(() => { const b = document.querySelector(".drawer-rail-sheet-reconnect"); const v = !!b && !b.hidden; if (v && !was) window.__shows++; was = v; })
		.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden"] });
});
const shown = () => page.evaluate(() => !document.querySelector(".drawer-rail-sheet-reconnect")?.hidden);
const label = () => page.evaluate(() => document.querySelector(".drawer-rail-sheet-reconnect")?.textContent ?? "");
const wires = () => page.evaluate(() => window.__wires.size);

await page.goto(base + "/framework/ux/Dictate/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
await page.click(".drawer-rail-ai");
await page.waitForSelector(".drawer-rail-sheet.on", { timeout: 20000 });

// 1. blips
await page.waitForTimeout(6000);
const blips = hits;
check(blips >= 3 && await page.evaluate(() => window.__shows) === 0, `${blips} stream cuts in 6 s, each back in a second: the button never showed`);

// 2. down
phase = "down"; hits = 0;
await page.waitForTimeout(5000);
check(!await shown(), "down 5 s: still hidden (inside the 8 s grace)");
await page.waitForTimeout(5000);
const text = await label();
check(await shown() && /Servex link down \d+ s: .*error.*Reconnect/.test(text), `down 10 s: shown, saying “${text}”`);
if (dir){ fs.mkdirSync(dir, { recursive: true }); await page.screenshot({ path: dir + "/reconnect-down.png" }); }
const before = hits, wires_before = await wires();
await page.click(".drawer-rail-sheet-reconnect-go");
await page.waitForTimeout(300);
check(hits > before, `a press asks at once (${hits - before} new request), and says “${await label()}”`);
for (let i = 0; i < 10; i++){ await page.click(".drawer-rail-sheet-reconnect-go"); await page.waitForTimeout(40); }
await page.waitForTimeout(300);
check(await wires() <= Math.max(1, wires_before), `ten fast presses: ${await wires()} live wire(s) open, never two`);
check(!errors.length, errors.length ? "page errors: " + errors.join(" | ") : "no page errors");

// 3. up
phase = "up";
await page.waitForTimeout(9000);   // the next automatic retry is at most 8 s away here
check(!await shown(), "Servex back: the stream reopened by itself and the button hid");
if (dir) await page.screenshot({ path: dir + "/reconnect-up.png" });
const kinds = logged.map(s => (s.match(/"kind":"([^"]+)"/) ?? [])[1]).filter(Boolean);
check(kinds.includes("lost") && kinds.includes("reconnected") && kinds.includes("reconnect pressed"), "log lines written: " + [...new Set(kinds)].join(", "));
await Browser.close();
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
