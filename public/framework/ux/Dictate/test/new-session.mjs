/* `node public/framework/ux/Dictate/test/new-session.mjs <base url> <repo dir>` (Playwright via Server/Browser.mjs).
 * Tests the "New session" button headless with TYPED sentences (no mic, no Whisper):
 *  A. the demo on /framework/ux/Dictate/ (keep:false): type, press New session, type again.
 * Starts real session agents (a few cents). Exit 1 on any failure. */
import Browser from "../../../../../Server/Browser.mjs";
const [base, repo] = process.argv.slice(2);
const b = await Browser.browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
const p = await (await b.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
const errs = [];
// WT=<worktree dir>: serve THIS checkout's chat.js (the fix) in place of the main tree's copy, so the test proves the fix before merge.
const WT = process.env.WT;
if (WT) await p.route(/\/framework\/ux\/Dictate\/chat\.js(\?.*)?$/,r => r.fulfill({ path: WT + "/public/framework/ux/Dictate/chat.js", contentType: "application/javascript" }));
const api = [];
p.on("response", r => { if (r.url().includes("/api/session")) api.push(r.request().method() + " " + r.url().split("/api/")[1].slice(0, 40) + " " + r.status()); });
p.on("pageerror", e => errs.push("pageerror " + e));
p.on("console", m => { if (m.type() === "error") errs.push("console " + m.text().slice(0, 160)); });
const results = [];
const check = (name, ok, extra = "") => { results.push(ok); console.log(ok ? "PASS" : "FAIL", name, extra); };
const wait = ms => p.waitForTimeout(ms);
const t0 = Date.now(), nav = [];
p.on("framenavigated", fr => { if (fr === p.mainFrame()) nav.push(Math.round((Date.now() - t0) / 1000) + "s " + fr.url().slice(0, 80)); });

await p.goto(base + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
await wait(1000);

// ---- A: the demo (keep:false) ----
const demo = p.locator(".ux-dictate-page-demo").first();
const demo_input = demo.locator("textarea").first();
const demo_btn = p.locator(".ux-dictate-chat-new-session").first();
await demo_input.fill("first demo sentence about sessions");
await demo_input.press("Enter");
await demo.getByText("first demo sentence", { exact: false }).first().waitFor({ timeout: 30000 }).catch(() => {});
const demo_lines_before = await demo.innerText();
const key0 = await p.evaluate(() => sessionStorage.getItem("lew42-voice-session"));
check("A1 demo shows the typed sentence", /first demo sentence/.test(demo_lines_before));
await demo_btn.click();
await wait(1500);
const demo_lines_after = await demo.innerText();
check("A2 New session clears the demo chat", !/first demo sentence/.test(demo_lines_after), JSON.stringify(demo_lines_after.slice(0, 120)));
const key1 = await p.evaluate(() => sessionStorage.getItem("lew42-voice-session"));
check("A3 demo leaves the global key alone (keep:false)", key0 === key1, `${key0} -> ${key1}`);
await demo_input.fill("second demo sentence after reset");
await demo_input.press("Enter");
await demo.getByText("second demo sentence", { exact: false }).first().waitFor({ timeout: 30000 }).catch(() => {});
check("A4 the demo accepts a sentence after reset", /second demo sentence/.test(await demo.innerText()), JSON.stringify((await demo.innerText()).slice(0, 160)) + " nav=" + nav.join(" ; "));

check("A5 page has no errors", errs.length === 0, errs.slice(0, 3).join(" | "));
console.log("api", api.join(" | "));   // POST session/new ×N: the New session press starts a fresh session
console.log(results.every(Boolean) ? "ALL PASS" : `FAILURES: ${results.filter(x => !x).length}`);
await Browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
