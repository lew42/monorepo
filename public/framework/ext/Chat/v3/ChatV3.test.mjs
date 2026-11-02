// node ChatV3.test.mjs [base-url] [shots-dir] — headless: Chat v3 draws a session's real chat list (session.messages, views-on-messages.md
// step 1): prompts in list order, cleaned text solid, replies found by `re.to` drawn inside their prompt, a pause-based paragraph break,
// live append. Needs the global playwright and the dev server. fixture/messages-session.jsonl is a copy of a range from a real voice
// session (public/framework/ai/sessions/2026/11/01/v-u48msei/session.jsonl); the original is never touched.
import { browser as get_browser } from "../../../../../Server/Browser.mjs";
import { copyFileSync, appendFileSync, rmSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://monorepo.localhost", shots = process.argv[3];
const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = here + "fixture/messages-session.jsonl", live = `live-v3-${process.pid}.jsonl`;
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

copyFileSync(fixture, here + "fixture/" + live);
const before = readFileSync(here + "fixture/" + live, "utf8");
const browser = await get_browser(), page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
const errors = []; page.on("pageerror", e => errors.push(String(e)));
const tap = sel => page.$eval(sel, e => e.click());
const ready = () => page.waitForSelector(".chat-v3-prompt", { timeout: 15000 });
const src = `/framework/ext/Chat/v3/fixture/${live}`;
const first = ".chat-v3-prompt[data-id='m-1793586471880']";

try {
	await page.goto(`${base}/framework/ext/Chat/v3/?src=${src}`); await ready();

	// 1. prompts in the chat list's own order, not sorted by task id
	const ids = await page.$$eval(".chat-v3 > .chat-v3-card", els => els.map(e => e.dataset.id));
	check("six prompts, in the chat list's own order", JSON.stringify(ids) === JSON.stringify([
		"m-1793586471880", "m-1793586544363", "m-1793586591861", "m-1793586626953", "m-1793586755261", "m-1793586760769",
	]), ids);
	check("with no AI title yet, the first words are the muted title", (await page.textContent(first + " .chat-v3-title.is-untitled")).startsWith("Can you hear me?"));
	check("settled text is solid (not gray)", await page.$(first + " .chat-v3-text.is-moving") === null);

	// 2. a Reply is found by re.to, not by a {chat} line, and lands inside its own Prompt
	check("both replies to the first prompt land inside it", (await page.$$(first + " .chat-v3-reply")).length === 2);
	check("a reply's markdown renders (the ## heading in the second reply)", !!(await page.$(first + " .chat-v3-reply-text.md")));
	const second_card_replies = await page.$$eval(".chat-v3-prompt[data-id='m-1793586544363'] .chat-v3-reply", els => els.length);
	check("a reply never lands under the wrong prompt (second prompt has exactly its own one reply)", second_card_replies === 1, second_card_replies);

	// 3. a Question task, nested beside its Prompt through the `prompt` link, not drawn as its own root card
	check("a Question nested under its prompt (not a root card)", await page.getAttribute(first + " [data-id='q-1793586471874']", "data-phase") === "open");
	check("the chat list has exactly 6 root cards (Questions are not roots)", (await page.$$(".chat-v3 > .chat-v3-card")).length === 6);

	// 4. a pause makes a paragraph (the fixture grew the first Prompt with a same-breath sentence, then one after a long pause)
	const paras = await page.$$eval(first + " .chat-v3-para", els => els.map(e => e.textContent));
	check("no pause: two sentences share one paragraph", paras.length === 2 && paras[0].includes("Can you hear me?") && paras[0].includes("second thought"), paras);
	check("a long pause starts a new paragraph", paras[1] === "A third thought, after a long pause.", paras);

	// 5. "show raw" (the first prompt has a `clean` override on its first sentence)
	check("raw hidden by default", await page.$(first + " .chat-v3-raw") === null);
	await tap(first + " .chat-v3-toggle");
	check("show raw reveals every sentence's own words (3: the original + two synthetic)", (await page.$$(first + " .chat-v3-raw-line")).length === 3);

	if (shots) {
		mkdirSync(shots, { recursive: true });
		await page.addStyleTag({ content: ".drawer, .sheet { display: none !important; }" });
		await page.setViewportSize({ width: 1200, height: 1500 }); await page.screenshot({ path: shots + "/chat-v3-1200.png" });
		await page.setViewportSize({ width: 400, height: 860 }); await page.screenshot({ path: shots + "/chat-v3-400.png" });
		await page.setViewportSize({ width: 1920, height: 1000 });
	}

	// 6. live: a Prompt with a Reply appended after load shows without a reload, the reply found by re.to
	await page.goto(`${base}/framework/ext/Chat/v3/?src=${src}`); await ready();
	await page.evaluate(() => { window.__no_reload = true; });
	const sid = "s-live-1", mid = "m-live-1", card = `.chat-v3-prompt[data-id='${mid}']`;
	appendFileSync(here + "fixture/" + live, JSON.stringify({ sentences: { add: { id: sid, at: "2026-11-01T20:40:00.000-06:00", text: "A live question.", via: "voice" } }, messages: { add: { type: "Prompt", id: mid, by: "owner", at: "2026-11-01T20:40:00.000-06:00", sentences: [sid] } } }) + "\n");
	await page.waitForSelector(card, { timeout: 8000 });
	check("a live prompt appears without a reload", await page.evaluate(() => window.__no_reload === true));
	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { add: { id: "m-live-2", type: "Reply", by: "smart", at: "2026-11-01T20:40:02.000-06:00", text: "A live reply, found by re.to.", re: { to: sid } } } }) + "\n");
	await page.waitForFunction(c => document.querySelector(c)?.textContent.includes("found by re.to"), card, { timeout: 8000 });
	check("its reply lands inside it, found by re.to (no {chat} line involved)", true);

	check("the fixture copy was only ever appended to", readFileSync(here + "fixture/" + live, "utf8").startsWith(before));
	check("no page errors", errors.length === 0, errors);
} finally {
	rmSync(here + "fixture/" + live, { force: true });
	await page.close();
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
