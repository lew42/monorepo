// node ChatV2.test.mjs [base-url] [shots-dir] — headless: order, nesting, show raw, live append, in-place patching. Needs the global playwright and the dev server.
import { browser as get_browser, close as close_browser } from "../../../../../Server/Browser.mjs";
import { copyFileSync, appendFileSync, rmSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://monorepo.localhost", shots = process.argv[3];   // base: the main site; pass a worktree url to test a branch
// The live copy goes in the tree the site at `base` serves: with no url that is the main tree (first in `git worktree list`), even when
// this file runs from a worktree or merge.mjs's .merge-base checkout; with a url, this checkout. One name per run, so two runs never share a file.
const here = fileURLToPath(new URL(".", import.meta.url)), rel = "public/framework/ext/Chat/v2/fixture/";
const main_tree = (() => { try { return execFileSync("git", ["worktree", "list", "--porcelain"], { cwd: here, windowsHide: true, encoding: "utf8" }).split("\n")[0].replace(/^worktree /, "").trim(); } catch { return null; } })();
const served = process.argv[2] || !main_tree ? here + "fixture/" : `${main_tree}/${rel}`;
const dir = here + "fixture/", name = `live-${process.pid}.jsonl`, copy = served + name, src = `/framework/ext/Chat/v2/fixture/${name}`;
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

copyFileSync(dir + "session.jsonl", copy);
const browser = await get_browser(), page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
const errors = []; page.on("pageerror", e => errors.push(String(e)));
const ids = sel => page.$$eval(sel, els => els.map(e => e.dataset.id));
const tap = sel => page.$eval(sel, e => e.click());   // the dev drawer overlays the page at 1920: click the element itself
const on_chat = () => page.waitForSelector(".chat-v2-prompt", { timeout: 15000 });

try {
	// 1. the fixture page: prompts in file order, replies and cards under their prompt
	await page.goto(`${base}/framework/ext/Chat/v2/`); await on_chat();
	check("three prompts, in file order", JSON.stringify(await ids(".chat-v2 > .chat-v2-prompt")) === JSON.stringify(["p-1761382800000", "p-1761382900000", "p-1761382950000"]), await ids(".chat-v2 > .chat-v2-prompt"));
	const first = ".chat-v2-prompt[data-id='p-1761382800000']";
	check("refined title shown", (await page.textContent(first + " .chat-v2-title")).includes("refined prompt first"));
	check("plain reply sits under its prompt", await page.$(first + " .chat-v2-nest [data-id='r-1761382840000']") !== null);
	check("anchored reply is in the prompt, with its quote and marked words", (await page.textContent(first + " .chat-v2-nest [data-id='r-1761382830000'] .chat-v2-mark")) === "The raw words");
	check("children: 2 questions + 2 tasks under the first prompt", (await page.$$(first + " .chat-v2-nest > .chat-v2-child")).length === 4);
	check("answered question phase", await page.getAttribute(first + " [data-id='q-1761382835000']", "data-phase") === "answered");
	check("question answered by a later line", await page.getAttribute(first + " [data-id='q-1761382836000']", "data-phase") === "answered");
	check("done task", await page.getAttribute(first + " [data-id='t-1761382837000']", "data-phase") === "complete");
	check("open task (running)", await page.getAttribute(first + " [data-id='t-1761382838000']", "data-phase") === "running");
	const second = ".chat-v2-prompt[data-id='p-1761382900000']";
	check("paragraph-only prompt shows its paragraphs as sentences", (await page.$$(second + " .chat-v2-sentence")).length === 2);
	check("root Question with `from` sits under its prompt, open", await page.getAttribute(second + " [data-id='q-1761382910000']", "data-phase") === "open");
	const third = ".chat-v2-prompt[data-id='p-1761382950000']";
	check("a `subject` with no `title` reads as the title (Prompt.label's order)", (await page.textContent(third + " .chat-v2-title")) === "A quick aside about naming");
	check("an anchor given as {from,to} marks the same words as {words}", (await page.textContent(third + " .chat-v2-nest [data-id='r-1761382955000'] .chat-v2-mark")) === "Call it");
	check("raw hidden by default", (await page.$(first + " .chat-v2-raw")) === null);
	await tap(first + " .chat-v2-toggle");
	check("show raw reveals the whisper text", (await page.textContent(first + " .chat-v2-raw")).includes("yeah so I think the chat"));
	check("show raw moves the anchored reply beside its sentence, drawn once", (await page.$$("[data-id='r-1761382830000']")).length === 1 && await page.$(first + " .chat-v2-beside [data-id='r-1761382830000']") !== null);
	check("raw open: anchored reply now sits beside its sentence", await page.$(first + " .chat-v2-sentence[data-sentence='a2'] .chat-v2-beside [data-id='r-1761382830000']") !== null);
	if (shots) {
		mkdirSync(shots, { recursive: true });
		// The dev drawer covers the page in a headless profile and the page scrolls inside its own frame: hide the drawer, make the window tall.
		await page.addStyleTag({ content: ".drawer, .sheet { display: none !important; }" });
		await page.setViewportSize({ width: 1920, height: 1500 });
		await page.screenshot({ path: shots + "/chat-v2-1920.png" });
		await page.setViewportSize({ width: 390, height: 2400 });
		await page.screenshot({ path: shots + "/chat-v2-390.png" });
		await tap(first + " .chat-v2-toggle");   // raw closed again for the live check
		await page.setViewportSize({ width: 1920, height: 1000 });
	} else await tap(first + " .chat-v2-toggle");

	// 2. live: ?src= a copy of the fixture, append a Prompt, it appears without a reload; raw state survives the redraw
	await page.goto(`${base}/framework/ext/Chat/v2/?src=${src}`); await on_chat();
	check("?src= draws the copy", (await page.$$(".chat-v2 > .chat-v2-prompt")).length === 3);
	await tap(first + " .chat-v2-toggle");
	await page.evaluate(() => { window.__no_reload = true; });
	appendFileSync(copy, JSON.stringify({ tasks: { add: { type: "Prompt", id: "p-1761383000000", title: "Appended live", text: "This one arrived after the page loaded.", raw: ["this one arrived"] } } }) + "\n");
	appendFileSync(copy, JSON.stringify({ "p-1761383000000": { replies: { add: { id: "r-1761383010000", text: "Seen, live.", by: "smart" } } } }) + "\n");
	await page.waitForSelector(".chat-v2-prompt[data-id='p-1761383000000']", { timeout: 15000 });
	check("appended prompt appears, last, without a reload", (await ids(".chat-v2 > .chat-v2-prompt")).at(-1) === "p-1761383000000" && await page.evaluate(() => window.__no_reload === true), await ids(".chat-v2 > .chat-v2-prompt"));
	await page.waitForSelector("[data-id='p-1761383000000'] [data-id='r-1761383010000']", { timeout: 15000 });
	check("a reply appended to it nests under it", true);
	check("an open 'show raw' survives the live redraw", await page.$(first + " .chat-v2-raw") !== null);

	// 3. in-place updates: each append patches only what it touched. Every element not named by that
	// line keeps its exact DOM object (never recreated) and stays connected; the scroll position holds.
	await page.goto(`${base}/framework/ext/Chat/v2/?src=${src}`); await on_chat();
	// The page scrolls inside its own frame, not the window: find the chat's scrolling ancestor and scroll it mid-page.
	await page.setViewportSize({ width: 1920, height: 600 });
	await page.evaluate(() => {
		let el = document.querySelector(".chat-v2");
		while (el && !(el.scrollHeight > el.clientHeight + 50 && /auto|scroll/.test(getComputedStyle(el).overflowY))) el = el.parentElement;
		window.__scroller = el ?? document.scrollingElement;
		window.__scroller.scrollTop = 300;
	});
	check("the chat's scroller is scrolled mid-page, so a jump would show", await page.evaluate(() => window.__scroller.scrollTop > 0), await page.evaluate(() => [window.__scroller.className, window.__scroller.scrollTop]));
	await page.evaluate(() => {
		window.__refs = new Map([...document.querySelectorAll("[data-id]")].map(el => [el.dataset.id, el]));
		window.__scroll = [window.scrollY, window.__scroller.scrollTop];
	});
	const untouched = (...skip) => page.evaluate(skip => {
		for (const [id, el] of window.__refs) {
			if (skip.includes(id)) continue;
			if (document.querySelector(`[data-id="${id}"]`) !== el || !document.body.contains(el)) return id;
		}
		return null;
	}, skip);
	const scroll_held = () => page.evaluate(() => window.scrollY === window.__scroll[0] && window.__scroller.scrollTop === window.__scroll[1]);
	const live_append = line => appendFileSync(copy, JSON.stringify(line) + "\n");

	live_append({ "p-1761382900000": { paragraphs: { append: { id: "c", text: " And scroll to the newest one." } } } });
	await page.waitForFunction(() => [...document.querySelectorAll(".chat-v2-prompt[data-id='p-1761382900000'] .chat-v2-sentence-text")].at(-1)?.textContent.includes("scroll to the newest"), { timeout: 15000 });
	check("paragraph append: every other element keeps its DOM object", await untouched() === null, await untouched());
	check("paragraph append: scroll position holds", await scroll_held());

	live_append({ "p-1761382800000": { replies: { add: { id: "r-1761383100000", text: "One more note.", by: "smart" } } } });
	await page.waitForSelector("[data-id='r-1761383100000']", { timeout: 15000 });
	check("reply add: every other element keeps its DOM object", await untouched() === null, await untouched());
	check("reply add: scroll position holds", await scroll_held());

	live_append({ "t-1761382838000": { complete: {} } });
	await page.waitForFunction(() => document.querySelector("[data-id='t-1761382838000']")?.getAttribute("data-phase") === "complete", { timeout: 15000 });
	check("child task state change: other elements keep their DOM object", await untouched("t-1761382838000") === null, await untouched("t-1761382838000"));
	check("child task state change: the touched element shows the new phase", await page.getAttribute("[data-id='t-1761382838000']", "data-phase") === "complete");
	check("child task state change: scroll position holds", await scroll_held());

	// The same change addressed through the task's prompt, the way the item tool writes it ({"<prompt>":{"<task>":{…}}}).
	live_append({ "p-1761382800000": { "t-1761382837000": { start: {} } } });
	await page.waitForFunction(() => document.querySelector("[data-id='t-1761382837000']")?.getAttribute("data-phase") === "running", { timeout: 15000 });
	check("task changed through its prompt: the task shows the new phase", await page.getAttribute("[data-id='t-1761382837000']", "data-phase") === "running");

	live_append({ "q-1761382910000": { answer: { text: "Yes, every time.", by: "smart", at: "2026-10-25T09:03:00Z" } } });
	await page.waitForFunction(() => document.querySelector("[data-id='q-1761382910000']")?.getAttribute("data-phase") === "answered", { timeout: 15000 });
	check("question answer: other elements keep their DOM object", await untouched("q-1761382910000") === null, await untouched("q-1761382910000"));
	check("question answer: the touched element shows the answer", (await page.textContent("[data-id='q-1761382910000'] .chat-v2-answer")).includes("every time"));
	check("question answer: scroll position holds", await scroll_held());

	live_append({ "p-1761382900000": { title: "One more thing" } });
	await page.waitForFunction(() => document.querySelector(".chat-v2-prompt[data-id='p-1761382900000'] .chat-v2-title")?.textContent === "One more thing", { timeout: 15000 });
	check("title set: other elements (its own children included) keep their DOM object", await untouched("p-1761382900000") === null, await untouched("p-1761382900000"));
	check("title set: scroll position holds", await scroll_held());

	live_append({ "p-1761382800000": { tasks: { add: { type: "Task", id: "t-1761383200000", title: "A task added live", state: "running" } } } });
	await page.waitForSelector("[data-id='t-1761383200000']", { timeout: 15000 });
	check("new child task: every other element keeps its DOM object", await untouched() === null, await untouched());
	check("new child task: scroll position holds", await scroll_held());

	live_append({ tasks: { add: { type: "Prompt", id: "p-1761383300000", title: "One more after that", text: "Said once everything above had already landed." } } });
	await page.waitForSelector(".chat-v2-prompt[data-id='p-1761383300000']", { timeout: 15000 });
	check("new root prompt: appended last", (await ids(".chat-v2 > .chat-v2-prompt")).at(-1) === "p-1761383300000");
	check("new root prompt: every other element keeps its DOM object", await untouched() === null, await untouched());
	check("new root prompt: scroll position holds", await scroll_held());

	// Most root adds in a real session are plain Tasks, and a Question filed at the root names its prompt in `from`.
	live_append({ tasks: { add: { type: "Task", id: "t-1761383400000", title: "A root task added live", state: "idle" } } });
	await page.waitForSelector(".chat-v2 > [data-id='t-1761383400000']", { timeout: 15000 });
	check("new root task: drawn at the root, other elements keep their DOM object", await untouched() === null, await untouched());
	live_append({ tasks: { add: { type: "Question", id: "q-1761383500000", text: "Asked at the root, about the first prompt?", from: "p-1761382800000" } } });
	await page.waitForSelector("[data-id='p-1761382800000'] .chat-v2-nest > [data-id='q-1761383500000']", { timeout: 15000 });
	check("root question with from: nests under its prompt, other elements keep their DOM object", await untouched() === null, await untouched());
	check("root adds: scroll position holds", await scroll_held());

	check("no page errors", errors.length === 0, errors);
} finally {
	await close_browser();
	rmSync(copy, { force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
