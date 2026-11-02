// Proof for the owner's rule (v1-raw/requirements.md): V1 is the raw log — every sentence the owner said
// stays visible, in order, whatever an assistant does with it later. A Question or a Task made from a
// sentence is drawn IN ADDITION to it, never in place of it.
//   node public/framework/ux/Dictate/test/raw-stays.mjs <base-url> [shots-dir]
// Fixture (raw-stays-fixture.jsonl): the first four lines are copied verbatim from a real voice session,
// public/framework/ai/sessions/2026/11/01/v-u48msei/session.jsonl lines 3, 4, 10, 12 — a Prompt, the
// owner's own chat line ("All right, are we working?"), the voice assistant's `place`/`improve` edit, then
// the fast seat turning it into a Question ("Are we working?"). The fifth line is synthetic (not in the
// real file, which has no Task tied to a Prompt): a Task from the same Prompt, to cover that path too.
// Replayed through the real ux/Dictate/chat.js pipeline (a stubbed session file, no live stream lines —
// the same "reload from a file" path test/order.mjs's `reload: true` run uses), the same code a live voice
// session runs in production.
import fs from "fs";
import Browser from "../../../../../Server/Browser.mjs";

const [base = "http://monorepo.localhost", shots] = process.argv.slice(2);
const fixture = fs.readFileSync(new URL("./raw-stays-fixture.jsonl", import.meta.url), "utf8")
	.split("\n").filter(Boolean);

const browser = await Browser.browser({});
const kill = setTimeout(() => { console.log("FAIL killed after 60 s"); process.exit(2); }, 60000);
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };

const ctx = await browser.newContext({ viewport: { width: 400, height: 860 } });
const page = await ctx.newPage();
const errors = []; page.on("pageerror", e => errors.push(String(e).slice(0, 200)));

await page.route(/\/api\/session\//, async route => {
	const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
	if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
	if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });   // idle: the fixture arrives through the file poll only, as a reload does
	const out = verb === "new" || verb === "resume" ? { ok: true, session: "stub-session", file: "/stub-raw-stays.jsonl" } : { ok: true };
	await route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) });
});
await page.route(/\/stub-raw-stays\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: fixture.join("\n") }));
await page.route(/\/api\/sessions\?/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ ok: true, sessions: [] }) }));
await page.route(/\/api\/hitl/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ ok: true, marks: [{ mark: "ok" }] }) }));
await page.route(/\/log\/prompts/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: "{}" }));

await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
await page.evaluate(async () => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); window.$sheet = Sheet.of(); await window.$sheet.to("full", { listen: false }); });
await page.waitForSelector(".drawer-rail-sheet.on .ux-dictate-widget", { timeout: 20000 });
await page.evaluate(async () => { await (await import("/framework/ux/Dictate/chat.js")).resume("stub-session"); });
await page.waitForTimeout(2000);

const state = await page.evaluate(() => {
	const sheet = document.querySelector(".drawer-rail-sheet.on");
	const owner_bubble = [...sheet.querySelectorAll(".chatbox-you")].find(b => b.textContent.includes("working"));
	const question = sheet.querySelector(".chatbox-task[data-id=q-1793574312079]");
	const task = sheet.querySelector(".chatbox-task[data-id=t-raw-stays-1]");
	return {
		owner_text: owner_bubble?.textContent ?? null,
		owner_visible: owner_bubble ? getComputedStyle(owner_bubble).display !== "none" : false,
		question_text: question?.textContent ?? null,
		task_text: task?.textContent ?? null,
	};
});

if (shots){ fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: `${shots}/raw-stays-400.png` }); }

check(!!state.owner_text && /working/.test(state.owner_text), `the owner's own sentence is drawn: ${JSON.stringify(state.owner_text)}`);
check(state.owner_visible, "the owner's bubble is still visible once it has a Question (display never set to none)");
check(!!state.question_text && /Are we working/.test(state.question_text), `the Question card is drawn too, in addition to the raw bubble: ${JSON.stringify(state.question_text)}`);
check(!!state.task_text, `a Task from the same prompt is drawn too, in addition to the raw bubble: ${JSON.stringify(state.task_text)}`);
check(!errors.length, `no page errors ${errors.join(" ")}`);

await ctx.close();
clearTimeout(kill);
console.log(failed ? `${failed} failed` : "all passed");
process.exit(failed ? 1 : 0);
