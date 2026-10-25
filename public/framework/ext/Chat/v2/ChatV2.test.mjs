// node ChatV2.test.mjs [base-url] [shots-dir] — headless: order, nesting, show raw, live append. Needs the global playwright and the dev server.
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import { copyFileSync, appendFileSync, rmSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:61527", shots = process.argv[3];
const dir = fileURLToPath(new URL("./fixture/", import.meta.url)), copy = dir + "live-copy.jsonl";
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

copyFileSync(dir + "session.jsonl", copy);
const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
const errors = []; page.on("pageerror", e => errors.push(String(e)));
const ids = sel => page.$$eval(sel, els => els.map(e => e.dataset.id));
const tap = sel => page.$eval(sel, e => e.click());   // the dev drawer overlays the page at 1920: click the element itself
const on_chat = () => page.waitForSelector(".chat-v2-prompt", { timeout: 15000 });

try {
	// 1. the fixture page: prompts in file order, replies and cards under their prompt
	await page.goto(`${base}/framework/ext/Chat/v2/`); await on_chat();
	check("two prompts, in file order", JSON.stringify(await ids(".chat-v2 > .chat-v2-prompt")) === JSON.stringify(["p-1761382800000", "p-1761382900000"]), await ids(".chat-v2 > .chat-v2-prompt"));
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
	check("raw hidden by default", (await page.$(first + " .chat-v2-raw")) === null);
	await tap(first + " .chat-v2-toggle");
	check("show raw reveals the whisper text", (await page.textContent(first + " .chat-v2-raw")).includes("yeah so I think the chat"));
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
	await page.goto(`${base}/framework/ext/Chat/v2/?src=/framework/ext/Chat/v2/fixture/live-copy.jsonl`); await on_chat();
	check("?src= draws the copy", (await page.$$(".chat-v2 > .chat-v2-prompt")).length === 2);
	await tap(first + " .chat-v2-toggle");
	await page.evaluate(() => { window.__no_reload = true; });
	appendFileSync(copy, JSON.stringify({ tasks: { add: { type: "Prompt", id: "p-1761383000000", title: "Appended live", text: "This one arrived after the page loaded.", raw: ["this one arrived"] } } }) + "\n");
	appendFileSync(copy, JSON.stringify({ "p-1761383000000": { replies: { add: { id: "r-1761383010000", text: "Seen, live.", by: "smart" } } } }) + "\n");
	await page.waitForSelector(".chat-v2-prompt[data-id='p-1761383000000']", { timeout: 15000 });
	check("appended prompt appears, last, without a reload", (await ids(".chat-v2 > .chat-v2-prompt")).at(-1) === "p-1761383000000" && await page.evaluate(() => window.__no_reload === true), await ids(".chat-v2 > .chat-v2-prompt"));
	await page.waitForSelector("[data-id='p-1761383000000'] [data-id='r-1761383010000']", { timeout: 15000 });
	check("a reply appended to it nests under it", true);
	check("an open 'show raw' survives the live redraw", await page.$(first + " .chat-v2-raw") !== null);
	check("no page errors", errors.length === 0, errors);
} finally {
	await browser.close();
	rmSync(copy, { force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
