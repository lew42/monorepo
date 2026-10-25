/* `PW_ROOT=<dir holding node_modules/playwright> node test/session-log.mjs <base url> [shots dir]`
 * The prompt-in-the-session-log slice, headless, with NO model call: `/api/refine` is answered by a fixture
 * shaped like the real answer (it carries `prompt`, `session` and `notes`), and a saved log is replayed.
 *   1. Pressing Refine sends the page's session id and shows the Haiku notes (name, tag, alternate) and the
 *      "open the session" link.
 *   2. `PromptRun.from_log(PromptLog.fold(lines))` rebuilds a finished prompt: 0-based cites come back as S numbers. */
import { createRequire } from "module";
const { chromium } = createRequire(process.env.PW_ROOT + "/")("playwright");
const base = process.argv[2], dir = process.argv[3];
const SESSION_RE = /^[0-9a-f-]{36}$/;
const b = await chromium.launch(); let fail = 0;
const check = (name, ok, extra) => { console.log(ok ? "PASS" : "FAIL", name, extra ? JSON.stringify(extra) : ""); if (!ok) fail++; };

const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const errs = []; p.on("pageerror", e => errs.push(String(e)));
let sent = null;
await p.route("**/api/refine", async r => {
	if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" } });
	sent = JSON.parse(r.request().postData());
	await r.fulfill({ status: 200, headers: { "access-control-allow-origin": "*" }, contentType: "application/json", body: JSON.stringify({
		ok: true, ms: 5000, stages: {}, runs: [], prompt: "pfixture", session: sent.session,
		clean: { sentences: [{ n: 1, text: "The page should show a flag when unclear." }] },
		structure: { md: "# Flags\n## Flag unclear [S1]\n- show a flag [S1]\n" },
		clarity: [{ n: 1, clarity: 0.8, why: "clear enough" }],
		notes: [{ i: 0, alternates: ["Flag unclear sentences."], names: ["Yellow flag"], tags: ["ext/Refine"] }],
	}) });
});
await p.goto(base + "/framework/ext/Refine/", { waitUntil: "networkidle" });
await p.waitForSelector(".refine-toolbar textarea", { state: "attached", timeout: 15000 });
await p.evaluate(t => { const el = document.querySelector(".refine-toolbar textarea"); el.value = t; el.dispatchEvent(new Event("input", { bubbles: true })); }, "the page should show a flag when unclear");
await p.getByRole("button", { name: "Refine", exact: true }).click();
await p.waitForSelector(".refine-score", { timeout: 8000 });
const text = await p.locator(".refine-prompt").first().innerText();
check("request carries a session uuid", SESSION_RE.test(sent?.session ?? ""), { session: sent?.session });
check("session id is kept between prompts", sent?.session === await p.evaluate(() => localStorage.getItem("refine.session")));
check("notes shown: name, tag, alternate", /name: Yellow flag/.test(text) && /ext\/Refine/.test(text) && /or: Flag unclear sentences\./.test(text), { text: text.slice(-260) });
const href = await p.locator("a:has-text('open the session')").first().getAttribute("href").catch(() => null);
check("link to the saved session", href === `/framework/ai/sessions/${sent?.session}/`, { href });
if (dir) await p.screenshot({ path: `${dir}/session-log-1400.png` });

// Replay a saved log (no model).
const replay = await p.evaluate(async () => {
	const { default: PromptLog } = await import("/framework/ai/AISession/PromptLog.js");
	const { default: PromptRun } = await import("/framework/ext/Refine/PromptRun.js");
	const at = "2026-10-10T00:00:00Z";
	const lines = [
		{ prompt: "p1", stage: "raw", text: "um raw words", at },
		{ prompt: "p1", stage: "clean", sentences: ["First.", "Second."], final: true, at },
		{ prompt: "p1", stage: "refined", subject: "Two", cards: [{ title: "Card", cites: [0, 1], cards: [{ text: "sub", cites: [1], cards: [] }] }], at },
		{ prompt: "p1", stage: "notes", notes: [{ i: 1, clarity: 0.9, why: "ok", alternates: ["2nd."], names: ["Second"], tags: ["core/Page"] }], at },
	];
	const row = PromptLog.fold(lines).p1;
	const pr = PromptRun.from_log(row, "sess");
	return { status: pr.status, clean: pr.clean.map(s => s.n + ":" + s.text), cites: pr.refined[0].cites, sub: pr.refined[0].cards[0].cites, note: pr.clean[1].names, tags: pr.clean[1].tags, id: pr.prompt_id };
});
check("replay: S numbers come back from indexes", replay.cites.join() === "1,2" && replay.sub.join() === "2" && replay.status === "done", replay);
check("replay: notes land on the right sentence", replay.note[0] === "Second" && replay.tags[0] === "core/Page" && replay.id === "p1");
check("no page errors", errs.length === 0, errs);
await b.close(); process.exit(fail ? 1 : 0);
