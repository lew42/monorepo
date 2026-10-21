// Proof: the sheet's live wire survives a Servex restart. Headless; nothing is restarted for real.
//   node public/framework/ux/Dictate/test/reconnect.mjs <base-url> [shots dir]
// The session stream answers 502 for 4 s (what the /servex proxy says while Servex restarts; a 502 CLOSES an EventSource
// for good), then passes through again. Pass = the Reconnect button shows while down, the stream reopens by itself,
// the button hides, and the Whisper bucket got a "lost" and a "reconnected" line. Doc: ext/drawer/doc/sheet.md
import fs from "fs";
import Browser from "../../../../../Server/Browser.mjs";

const [base = "http://monorepo.localhost", dir] = process.argv.slice(2);
const browser = await Browser.browser();
setTimeout(() => { console.log("FAIL killed after 90 s"); process.exit(2); }, 90000).unref();
const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true });
const page = await ctx.newPage();
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
const json = (r, body) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
await page.route(/\/api\/session\/(new|resume|say|nav|floor|quiet|react|pause|select)/, r => json(r, { ok: true, session: "stub-session", file: "/stub-session.jsonl", at: new Date().toISOString() }));
await page.route(/\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: "" }));
let down = true, hits = 0;
await page.route(/\/api\/session\/[^/]+\/stream/, r => { hits++; return down
	? r.fulfill({ status: 502, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"error":"Servex unreachable"}' })
	: r.continue(); });
const logged = [];
page.on("websocket", ws => ws.on("framesent", f => { const s = String(f.payload ?? ""); if (s.includes('"connection"')) logged.push(s); }));
await page.addInitScript(() => sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: "stub-session", file: "/stub-session.jsonl" })));

await page.goto(base + "/framework/ux/Dictate/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
await page.click(".drawer-rail-ai");
await page.waitForSelector(".drawer-rail-sheet.on", { timeout: 20000 });
await page.waitForTimeout(2500);
const shown = () => page.evaluate(() => !document.querySelector(".drawer-rail-sheet-reconnect")?.hidden);
check(await shown(), "Reconnect button shows while Servex answers 502");
if (dir){ fs.mkdirSync(dir, { recursive: true }); await page.screenshot({ path: dir + "/reconnect-down.png" }); }
const before = hits;
await page.click(".drawer-rail-sheet-reconnect");
await page.waitForTimeout(400);
check(hits > before, `the button tries again at once (${hits - before} new request)`);
down = false;   // Servex is back
await page.waitForTimeout(9000);   // the next automatic retry is at most 8 s away here
check(!await shown(), "the stream reopened by itself and the button hid");
check(hits >= 3, `stream requests: ${hits} (retries happened)`);
if (dir) await page.screenshot({ path: dir + "/reconnect-up.png" });
const kinds = logged.map(s => (s.match(/"kind":"([^"]+)"/) ?? [])[1]).filter(Boolean);
check(kinds.includes("lost") && kinds.includes("reconnected"), "log lines written: " + kinds.join(", "));
await Browser.close();
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
