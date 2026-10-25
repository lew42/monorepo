// Proof: opening the sheet on a long session asks the model to mark NEW owner lines only, never the replayed history.
//   node public/framework/ux/Dictate/test/marks.mjs <base-url>
// Each mark is a paid /api/hitl call on Servex (ux/Understand). Before the fix, opening a session of 177 owner lines made
// 177 of them on every open (dictation-debug/load-perf/report.md, item 3). Headless, Servex stubbed; the hitl stub
// answers with a mark, so nothing is paid. Pass = 0 calls for the 40 replayed lines, 1 for a line written after the open.
import Browser from "../../../../../Server/Browser.mjs";

const [base = "http://monorepo.localhost"] = process.argv.slice(2);
const browser = await Browser.browser();
setTimeout(() => { console.log("FAIL killed after 60 s"); process.exit(2); }, 60000).unref();
const page = await (await browser.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true })).newPage();
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
const json = (r, body) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
const old = Date.now() - 3600e3;
const lines = Array.from({ length: 40 }, (_, i) => JSON.stringify({ chat: { at: new Date(old + i * 1000).toISOString(), text: `old sentence ${i}.`, via: "voice", from: { kind: "owner" } } }));
let file = lines.join("\n") + "\n", marks = 0;
await page.route(/\/api\/hitl/, r => { if (r.request().method() === "POST") marks++; return json(r, { ok: true, marks: [{ mark: "clear", purpose: "stub" }] }); });
await page.route(/\/api\/session\/(new|resume|say|nav|floor|quiet|react|pause|select)/, r => json(r, { ok: true, session: "stub-session", file: "/stub-session.jsonl", at: new Date().toISOString() }));
await page.route(/\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
await page.route(/\/api\/session\/[^/]+\/stream/, r => r.fulfill({ status: 200, contentType: "text/event-stream", headers: { "access-control-allow-origin": "*" }, body: "retry: 60000\n\n" }));
await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: file }));
await page.addInitScript(() => sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: "stub-session", file: "/stub-session.jsonl" })));
await page.goto(base + "/framework/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
await page.click(".drawer-rail-ai");
await page.waitForSelector(".drawer-rail-sheet.on", { timeout: 20000 });
await page.waitForFunction(() => document.body.textContent.includes("old sentence 39."), null, { timeout: 15000 });
await page.waitForTimeout(2000);
check(marks === 0, `40 replayed owner lines drawn: ${marks} paid mark call(s)`);
file += JSON.stringify({ chat: { at: new Date().toISOString(), text: "a new sentence.", via: "voice", from: { kind: "owner" } } }) + "\n";
await page.waitForFunction(() => document.body.textContent.includes("a new sentence."), null, { timeout: 15000 });
await page.waitForTimeout(1500);
check(marks === 1, `one new owner line: ${marks} mark call(s)`);
await Browser.close();
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
