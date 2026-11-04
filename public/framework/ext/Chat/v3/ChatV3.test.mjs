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

	// 7. a chit-chat Prompt's muted title (same text as its own one-line body) is dropped; a real topic card keeps its title
	appendFileSync(here + "fixture/" + live, JSON.stringify({ sentences: { add: { id: "s-live-2", at: "2026-11-01T20:40:05.000-06:00", text: "Hey.", via: "voice" } }, messages: { add: { type: "Prompt", id: "m-live-chitchat", by: "owner", at: "2026-11-01T20:40:05.000-06:00", sentences: ["s-live-2"] } } }) + "\n");
	await page.waitForSelector(".chat-v3-prompt[data-id='m-live-chitchat']", { timeout: 8000 });
	check("a chit-chat prompt's title (same words as its own body, no refined version) is hidden", await page.$(".chat-v3-prompt[data-id='m-live-chitchat'] .chat-v3-title") === null);

	appendFileSync(here + "fixture/" + live, JSON.stringify({ sentences: { add: { id: "s-live-3", at: "2026-11-01T20:40:10.000-06:00", text: "Build the thing.", via: "voice" } }, messages: { add: { type: "Prompt", id: "m-live-topic", by: "owner", at: "2026-11-01T20:40:10.000-06:00", sentences: ["s-live-3"], text: "A refined answer about building the thing, with more detail than the one-line dictation." } } }) + "\n");
	await page.waitForSelector(".chat-v3-prompt[data-id='m-live-topic']", { timeout: 8000 });
	check("a real topic card (refined text) keeps its title even when short", await page.$(".chat-v3-prompt[data-id='m-live-topic'] .chat-v3-title") !== null);

	// 8. a card: a fresh one draws its title, icon and content; an upgraded Reply draws its title too
	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { add: { id: "m-live-card", type: "Card", by: "owner", at: "2026-11-01T20:40:15.000-06:00", icon: "task", title: "Call the vet" } } }) + "\n");
	await page.waitForSelector(".chat-v3-loose[data-id='m-live-card']", { timeout: 8000 });
	check("a card's title is drawn, not the untitled first-words fallback", await page.$eval(".chat-v3-loose[data-id='m-live-card'] .chat-v3-title", e => e.textContent) === "Call the vet");
	check("…and never the stringified word \"undefined\" anywhere in the card", !(await page.$eval(".chat-v3-loose[data-id='m-live-card']", e => e.textContent)).includes("undefined"));
	check("its icon is drawn", await page.$(".chat-v3-loose[data-id='m-live-card'] .chat-v3-icon") !== null);
	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { "m-live-card": { content: { add: { title: "Ask about the limp" } } } } }) + "\n");
	await page.waitForFunction(() => document.querySelector(".chat-v3-loose[data-id='m-live-card'] .chat-v3-content-line")?.textContent === "Ask about the limp", { timeout: 8000 });
	check("content appended to the card draws as a line below it", true);

	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { "m-live-2": { title: "Phone the owner back", icon: "call" } } }) + "\n");
	await page.waitForSelector(`${card} .chat-v3-reply.is-card .chat-v3-title`, { timeout: 8000 });
	check("upgrading a Reply (title/icon set on it) makes it draw as a card too", await page.$eval(`${card} .chat-v3-reply.is-card .chat-v3-title`, e => e.textContent) === "Phone the owner back");

	// 9a. ask7 review fix #1: a live answer redraws the Question's own row AT ONCE, no reload (find_answered_ids, placement.js
	// + ChatV3.read()) — the earlier version of this test only proved it after a reload; that was finding 1 of the review.
	const order0 = () => page.$$eval(".chat-v3 > .chat-v3-card:not(.chat-v3-draft)", els => els.map(e => e.dataset.id));
	check("no reference yet: the question is still open", await page.$(".chat-v3-refs .chat-v3-ask-ref") === null);
	check("the real card shows it open, before the answer", await page.getAttribute(first + " [data-id='q-1793586471874']", "data-phase") === "open");
	appendFileSync(here + "fixture/" + live, JSON.stringify({ "q-1793586471874": { answer: { text: "Yes, loud and clear.", by: "smart" } } }) + "\n");
	await page.waitForFunction(() => document.querySelector("[data-id='q-1793586471874']")?.dataset.phase === "answered", { timeout: 8000 });
	check("the real card shows the answer LIVE, in place (never moved), no reload needed", await page.getAttribute(first + " [data-id='q-1793586471874']", "data-phase") === "answered");
	check("...and its answer text is drawn on the card", (await page.textContent(first + " [data-id='q-1793586471874'] .chat-v3-answer")).includes("loud and clear"));
	await page.waitForSelector(".chat-v3-refs .chat-v3-ask-ref", { timeout: 8000 });
	check("the real card is still the FIRST root (no move)", (await order0())[0] === "m-1793586471880");
	check("the reference links back to the real card's own id", await page.getAttribute(".chat-v3-refs .chat-v3-ask-ref", "href") === "#q-1793586471874");
	await tap(".chat-v3-refs .chat-v3-ask-ref");
	check("tapping it scrolls the real card into view", await page.evaluate(() => { const r = document.querySelector("[data-id='q-1793586471874']").getBoundingClientRect(); return r.top > -50 && r.top < window.innerHeight; }));

	// 9a-2. review fix #2: a new card arriving AFTER a reference exists must land BEFORE `.chat-v3-refs`, never after it
	// (the refs box used to be a plain append target, so every later card drifted below it, into the middle of the chat).
	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { add: { id: "m-live-after-ref", type: "Message", by: "owner", at: "2026-11-01T20:40:20.000-06:00", text: "One more thing, after the reference already showed." } } }) + "\n");
	await page.waitForSelector(".chat-v3-loose[data-id='m-live-after-ref']", { timeout: 8000 });
	check("a card added after the reference box still lands BEFORE it, never mid-chat drift", await page.evaluate(() => {
		const refs = document.querySelector(".chat-v3-refs"), card = document.querySelector("[data-id='m-live-after-ref']");
		return !!(refs && card) && !!(refs.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_PRECEDING);
	}));

	// 9a-3. review fix #4: "a repeated question links to its existing card" — the item tool writes the link as `also_from`
	// on the EXISTING Question (page_tools.js, Question-dedupe.test.mjs); this is the view's half, drawing a reference
	// under the REPEATING Prompt's own card, pointing back at the original (never a second Question card).
	appendFileSync(here + "fixture/" + live, JSON.stringify({ "p-1793586471873": { "q-1793586471874": { also_from: ["p-1793586544360"] } } }) + "\n");
	await page.waitForSelector(".chat-v3-prompt[data-id='m-1793586544363'] .chat-v3-ask-ref", { timeout: 8000 });
	check("the repeating Prompt's own card draws a reference back to the original (not a second Question)",
		await page.getAttribute(".chat-v3-prompt[data-id='m-1793586544363'] .chat-v3-ask-ref", "href") === "#q-1793586471874");

	// 9. a MOVE reaches the screen as the same node in a new place (never a redraw); an improve patches the text in place
	const order = () => page.$$eval(".chat-v3 > .chat-v3-card:not(.chat-v3-draft)", els => els.map(e => e.dataset.id));
	const lead = ".chat-v3-prompt[data-id='m-1793586471880']";
	await page.$eval(lead, e => { e.__mark = "same-node"; window.__text = e.querySelector(".chat-v3-text"); });
	const was = await order();
	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { move: { id: "m-1793586471880", after: was.at(-1) } } }) + "\n");
	await page.waitForFunction(id => document.querySelector(".chat-v3 > .chat-v3-card:not(.chat-v3-draft):last-of-type") === document.querySelector(`[data-id='${id}']`) || [...document.querySelectorAll(".chat-v3 > .chat-v3-card")].at(-1)?.dataset.id === id, "m-1793586471880", { timeout: 8000 });
	const now = await order();
	check("a move line puts the card last, one copy, the others in order", now.at(-1) === "m-1793586471880" && now.length === was.length && JSON.stringify(now.slice(0, -1)) === JSON.stringify(was.slice(1)), now);
	check("the moved card is the SAME DOM node, with the same text node (not redrawn)", await page.$eval(lead, e => e.__mark === "same-node" && e.querySelector(".chat-v3-text") === window.__text));
	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { "m-1793586471880": { clean: { "s-1793586471880": "Can you hear me, please?" } } } }) + "\n");
	await page.waitForFunction(c => document.querySelector(c + " .chat-v3-text")?.textContent.includes("please"), lead, { timeout: 8000 });
	check("an improve edit patches the text in place: the card keeps its node and its place", await page.$eval(lead, e => e.__mark === "same-node") && (await order()).at(-1) === "m-1793586471880");

	// 9b. ask7: once its own Prompt becomes the newest root (the move just above), the reference goes away — nothing is
	// between the real card and the end of the chat any more, so there is nothing to resurface. Review fix #10: the wait
	// IS the proof (a plain `check(..., true)` after it only passed because a failed wait would have thrown first) — fold
	// it into the check itself, so a regression that makes the wait resolve some OTHER way still reports a real result.
	const gone = await page.waitForFunction(() => document.querySelector(".chat-v3-refs .chat-v3-ask-ref") === null, { timeout: 8000 }).then(() => true, () => false);
	check("the reference disappears once its own card is the newest root", gone && await page.$(".chat-v3-refs .chat-v3-ask-ref") === null);

	check("the fixture copy was only ever appended to", readFileSync(here + "fixture/" + live, "utf8").startsWith(before));
	check("no page errors", errors.length === 0, errors);
} finally {
	rmSync(here + "fixture/" + live, { force: true });
	await page.close();
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
