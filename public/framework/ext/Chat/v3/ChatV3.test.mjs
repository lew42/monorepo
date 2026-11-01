// node ChatV3.test.mjs [base-url] [shots-dir] — headless: Chat v3 draws a session's tasks list (the v2 fixture, then a copy of a real voice log),
// raw gray while moving and solid once settled, live append, and that the log is never changed. Needs the global playwright and the dev server.
import { browser as get_browser } from "../../../../../Server/Browser.mjs";
import { copyFileSync, appendFileSync, rmSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://monorepo.localhost", shots = process.argv[3];
const here = fileURLToPath(new URL(".", import.meta.url)), rel = "public/framework/ext/Chat/v2/fixture/";
const main_tree = (() => { try { return execFileSync("git", ["worktree", "list", "--porcelain"], { cwd: here, windowsHide: true, encoding: "utf8" }).split("\n")[0].replace(/^worktree /, "").trim(); } catch { return null; } })();
const served = process.argv[2] || process.env.SITE_URL || !main_tree ? here + "../v2/fixture/" : `${main_tree}/${rel}`;   // the tree the site at `base` serves (live-*.jsonl there is gitignored)
const fixture = here + "../v2/fixture/session.jsonl", live = `live-v3-${process.pid}.jsonl`, marked = `live-v3-marked-${process.pid}.jsonl`, real = `live-v3-real-${process.pid}.jsonl`;
const real_log = [process.env.REAL_LOG, `${main_tree}/public/framework/ai/sessions/2026/10/25/v-9dvbbrn/session.jsonl`].find(f => f && existsSync(f));
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

copyFileSync(fixture, served + live);
if (real_log) copyFileSync(real_log, served + real);
const before = readFileSync(served + live, "utf8");
const browser = await get_browser(), page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
const errors = []; page.on("pageerror", e => errors.push(String(e)));
const tap = sel => page.$eval(sel, e => e.click());
const ready = () => page.waitForSelector(".chat-v3-prompt", { timeout: 15000 });
const src = f => `/framework/ext/Chat/v2/fixture/${f}`;
const first = ".chat-v3-prompt[data-id='p-1761382800000']";

try {
	// 1. the fixture: prompts in file order, cleaned text solid, replies and questions inside the prompt
	await page.goto(`${base}/framework/ext/Chat/v3/`); await ready();
	const ids = await page.$$eval(".chat-v3 > .chat-v3-card", els => els.map(e => e.dataset.id));
	check("three prompts, in file order", JSON.stringify(ids) === JSON.stringify(["p-1761382800000", "p-1761382900000", "p-1761382950000"]), ids);
	check("title shown", (await page.textContent(first + " .chat-v3-title")).includes("refined prompt first"));
	check("settled text is solid (not gray)", await page.$(first + " .chat-v3-text.is-moving") === null);
	check("cleaned text shown, not the raw whisper", (await page.textContent(first + " .chat-v3-text")).includes("The chat should show the cleaned-up version"));
	check("a reply sits inside its prompt", (await page.textContent(first)).includes("I made two cards from this"));
	check("a question with an answer is inside its prompt, answered", await page.getAttribute(first + " [data-id='q-1761382835000']", "data-phase") === "answered");
	check("raw hidden by default", await page.$(first + " .chat-v3-raw") === null);
	await tap(first + " .chat-v3-toggle");
	check("show raw reveals every raw chunk", (await page.$$(first + " .chat-v3-raw-line")).length === 2);
	check("card has a link to itself", (await page.getAttribute(first + " .chat-v3-link", "href")).endsWith("#p-1761382800000"));
	if (shots) {
		mkdirSync(shots, { recursive: true });
		await page.addStyleTag({ content: ".drawer, .sheet { display: none !important; }" });
		await page.setViewportSize({ width: 1920, height: 1500 }); await page.screenshot({ path: shots + "/chat-v3-1920.png" });
		await page.setViewportSize({ width: 400, height: 2400 }); await page.screenshot({ path: shots + "/chat-v3-400.png" });
		await page.setViewportSize({ width: 1920, height: 1000 });
	}

	// 1b. the marked spelling (D13, Store.marked_lines on): {"#id": {...}} is the prompt <id>, read like the bare line
	copyFileSync(fixture, served + marked);
	appendFileSync(served + marked, JSON.stringify({ "#p-1761382800000": { title: "Marked line" } }) + "\n");
	await page.goto(`${base}/framework/ext/Chat/v3/?src=${src(marked)}`); await ready();
	check("a marked line ({\"#id\": …}) updates the card like a bare one", (await page.textContent(first + " .chat-v3-title")) === "Marked line", await page.textContent(first + " .chat-v3-title"));

	// 2. live: a Prompt appended after load shows in light gray while it moves, then settles solid; a new word is appended to the same card
	await page.goto(`${base}/framework/ext/Chat/v3/?src=${src(live)}`); await ready();
	await page.evaluate(() => { window.__no_reload = true; });
	const id = "p-1761383000000", card = `.chat-v3-prompt[data-id='${id}']`;
	appendFileSync(served + live, JSON.stringify({ tasks: { add: { type: "Prompt", id, raw: ["this one arrived"], paragraphs: [{ id: "a", text: "This one arrived." }] } } }) + "\n");
	await page.waitForSelector(card, { timeout: 8000 });
	check("a live prompt appears without a reload", await page.evaluate(() => window.__no_reload === true));
	check("while moving it is light gray", await page.$(card + " .chat-v3-text.is-moving") !== null);
	appendFileSync(served + live, JSON.stringify({ [id]: { raw: "and more words" } }) + "\n");
	await page.waitForFunction(c => document.querySelector(c + " .chat-v3-text")?.textContent.includes("and more words"), card, { timeout: 8000 }).catch(() => {});
	check("new words append to the same newest card (raw is append-only)", (await page.$$(".chat-v3 > .chat-v3-card")).length === 4 && (await page.textContent(card + " .chat-v3-text")).includes("and more words"), await page.textContent(card));
	appendFileSync(served + live, JSON.stringify({ [id]: { title: "Arrived live", replies: { add: { id: "r-1761383010000", text: "Seen, live.", by: "smart" } } } }) + "\n");
	await page.waitForFunction(c => document.querySelector(c)?.textContent.includes("Seen, live."), card, { timeout: 8000 });
	check("its reply lands inside it", true);
	await page.waitForSelector(card + " .chat-v3-text:not(.is-moving)", { timeout: 15000 });
	check("after the quiet moment it is solid black and shows its title", (await page.textContent(card + " .chat-v3-title")) === "Arrived live");

	// 3. a copy of a real voice log: the other families of lines are ignored, the tasks are drawn
	if (real_log) {
		await page.goto(`${base}/framework/ext/Chat/v3/?src=${src(real)}`); await ready();
		const prompts = (await page.$$(".chat-v3-prompt")).length;
		check("real log: prompts drawn (windowed)", prompts > 0 && prompts <= 40, prompts);
		check("real log: no card text is a raw {chat}/{place} line", !(await page.textContent(".chat-v3")).includes('"place"'));
		const earlier = await page.$eval(".chat-v3-earlier", e => ({ hidden: e.hidden, text: e.textContent }));
		check("real log: older cards sit behind 'show earlier'", earlier.hidden === false || prompts < 40, earlier);
		if (shots) { await page.addStyleTag({ content: ".drawer, .sheet { display: none !important; }" }); await page.setViewportSize({ width: 400, height: 1600 }); await page.screenshot({ path: shots + "/chat-v3-real-400.png" }); }
	}
	check("the log file was only ever appended to", readFileSync(served + live, "utf8").startsWith(before));
	check("no page errors", errors.length === 0, errors);
} finally {
	rmSync(served + live, { force: true }); rmSync(served + marked, { force: true }); rmSync(served + real, { force: true });
	await page.close();
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
