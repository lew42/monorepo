// node ChatV2.test.mjs [base-url] [shots-dir] — headless: ChatV2 is now a ChatV3 subclass (views-on-messages.md step 2),
// drawn from the SAME fixture as V3 (session.messages, fixture/messages-session.jsonl, a copy of V3's own plus a few
// {chat}/{sent} broadcast lines so the ✓/🧠 marks have something to read). Proves what V2 adds on top of V3: the marks
// (only on the newest Prompt), a Reply drawn beside the sentence it answers, and live append. Needs the global playwright
// and the dev server.
import { browser as get_browser, close as close_browser } from "../../../../../Server/Browser.mjs";
import { copyFileSync, appendFileSync, rmSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://monorepo.localhost", shots = process.argv[3];
const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = here + "fixture/messages-session.jsonl", live = `live-v2-${process.pid}.jsonl`;
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

copyFileSync(fixture, here + "fixture/" + live);
const browser = await get_browser(), page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
const errors = []; page.on("pageerror", e => errors.push(String(e)));
const ids = sel => page.$$eval(sel, els => els.map(e => e.dataset.id));
const tap = sel => page.$eval(sel, e => e.click());
const ready = () => page.waitForSelector(".chat-v3-prompt", { timeout: 15000 });
const src = `/framework/ext/Chat/v2/fixture/${live}`;
const first = ".chat-v3-prompt[data-id='m-1793586471880']", newest = ".chat-v3-prompt[data-id='m-1793586760769']";

try {
	// 1. the fixture, read-only: card order and nesting are exactly ChatV3's own (no bubbles, Replies/Tasks inside their Prompt).
	await page.goto(`${base}/framework/ext/Chat/v2/`); await ready();
	check("six prompts, in the chat list's own order (same as V3)", JSON.stringify(await ids(".chat-v3 > .chat-v3-card")) === JSON.stringify([
		"m-1793586471880", "m-1793586544363", "m-1793586591861", "m-1793586626953", "m-1793586755261", "m-1793586760769",
	]), await ids(".chat-v3 > .chat-v3-card"));
	check("a Question still nests under its Prompt (through the task link), not at the root", await page.$(first + " .chat-v3-nest [data-id='q-1793586471874']") !== null);

	// every Reply in the fixture (9, placement.test.mjs's own count) lands beside the sentence holding its re.to, none left in a trailing list
	const EXPECTED_BESIDE = [
		["s-1793586471880", "Your words are arriving"], ["s-1793586471880", "there's no voice"],
		["s-1793586544363", "Not really. Chrome on Android"],
		["s-1793586591861", "I asked"], ["s-1793586591861", "The plan avoids query strings"],
		["s-1793586626953", "I asked"], ["s-1793586626953", "it's still the old code"],
		["s-1793586755261", "I'll tell you as soon as"],
		["s-1793586760769", "Yes, refresh now"],
	];
	let beside_ok = true, beside_got = [];
	for (const [sid, snippet] of EXPECTED_BESIDE) {
		const found = await page.$eval(`[data-sentence='${sid}'] .chat-v2-beside`, (el, s) => el.textContent.includes(s), snippet).catch(() => false);
		if (!found) { beside_ok = false; beside_got.push([sid, snippet]); }
	}
	check("every Reply in the fixture (9) lands beside the sentence holding its re.to", beside_ok, beside_got);
	const trailing_total = await page.$$eval(".chat-v3-card > .chat-v3-reply", els => els.length);
	check("no Reply is left in the trailing list (every Prompt here is still in dictation mode)", trailing_total === 0, trailing_total);

	// 2. the marks: only the NEWEST Prompt carries them, even when an older one has sent/answered data too.
	check("the oldest prompt has sent/answered data in the fixture but shows no marks (not the newest)", await page.$(first + " .chat-v2-marks") === null);
	check("the newest prompt shows both marks", await page.$(newest + " .chat-v2-marks .chat-cursor") !== null && await page.$(newest + " .chat-v2-marks .chat-smart-cursor") !== null);
	check("✓ is done (fast has the line)", await page.$eval(newest + " .chat-cursor", e => e.classList.contains("done")));
	check("🧠 is done (a reply already answers it)", await page.$eval(newest + " .chat-smart-cursor", e => e.classList.contains("done")));

	// 3. replies drawn beside the sentence they answer (re.to), not in the trailing list — the first prompt has two
	// replies, both anchored to its first sentence, plus two more sentences pushed later with no reply.
	check("three sentence rows (the original plus two pushed live in the fixture)", (await page.$$(first + " .chat-v2-sentence")).length === 3);
	check("both replies sit beside the sentence they answer", (await page.$$(first + " [data-sentence='s-1793586471880'] .chat-v2-beside .chat-v3-reply")).length === 2);
	check("a reply drawn beside its sentence is not ALSO drawn in the trailing list", (await page.$$(first + " .chat-v3-reply")).length === 2);
	check("a sentence with no reply has no beside box", await page.$(first + " [data-sentence='s-test-2'] .chat-v2-beside") === null);

	// 4. once a Prompt gets refined text, sentence rows (and marks' data source aside) are gone: it draws like plain V3 —
	// a card with no `title`/`text` but an existing `clean` override still shows "show raw" (ChatV3's own feature).
	check("a prompt with per-sentence clean overrides has 'show raw' (ChatV3's own feature, unchanged)", await page.$(first + " .chat-v3-toggle") !== null);

	if (shots) {
		mkdirSync(shots, { recursive: true });
		await page.addStyleTag({ content: ".drawer, .sheet { display: none !important; }" });
		await page.screenshot({ path: shots + "/chat-v2-1920.png", fullPage: true });
		await page.setViewportSize({ width: 400, height: 2200 });
		await page.screenshot({ path: shots + "/chat-v2-400.png", fullPage: true });
		await page.setViewportSize({ width: 1920, height: 1200 });
	}

	// 5. live: ?src= a copy of the fixture, append a Prompt with a Reply beside its sentence, no reload.
	await page.goto(`${base}/framework/ext/Chat/v2/?src=${src}`); await ready();
	await page.evaluate(() => { window.__no_reload = true; });
	const at = "2026-11-01T20:40:00.000-06:00", sid = "s-live-1";
	appendFileSync(here + "fixture/" + live, JSON.stringify({ sentences: { add: { id: sid, at, text: "A live sentence." } }, messages: { add: { type: "Prompt", id: "m-live-1", by: "owner", at, sentences: [sid] } } }) + "\n");
	await page.waitForSelector(".chat-v3-prompt[data-id='m-live-1']", { timeout: 15000 });
	check("appended prompt appears, last, without a reload", (await ids(".chat-v3 > .chat-v3-card")).at(-1) === "m-live-1" && await page.evaluate(() => window.__no_reload === true));

	// the marks themselves, replayed live off the message (views step 3): fast's mark lands, then smart's, then a Reply
	// after smart.at turns 🧠 done — each read straight off `m-live-1`'s own `sent`, no separate broadcast line.
	const newest_sel = ".chat-v3-prompt[data-id='m-live-1']";
	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { "m-live-1": { sent: { fast: { at: "2026-11-01T20:39:40.000-06:00" } } } } }) + "\n");
	await page.waitForSelector(newest_sel + " .chat-v2-marks .chat-cursor.done", { timeout: 15000 });
	check("✓ appears live once fast's sent line lands", await page.$(newest_sel + " .chat-v2-marks .chat-smart-cursor") === null);
	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { "m-live-1": { sent: { smart: { at: "2026-11-01T20:39:50.000-06:00" } } } } }) + "\n");
	await page.waitForSelector(newest_sel + " .chat-v2-marks .chat-smart-cursor", { timeout: 15000 });
	check("🧠 appears live once smart's sent line lands, not yet done (no reply)", await page.$eval(newest_sel + " .chat-v2-marks .chat-smart-cursor", e => !e.classList.contains("done")));

	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { add: { id: "m-live-2", type: "Reply", by: "smart", at, text: "Seen, live.", re: { to: sid } } } }) + "\n");
	await page.waitForFunction(sid => document.querySelector(`[data-sentence="${sid}"] .chat-v2-beside`)?.textContent.includes("Seen, live."), sid, { timeout: 15000 });
	const live_card_replies = await page.$$eval("[data-id='m-live-1'] .chat-v3-reply", els => els.length);
	check("a live reply lands beside its sentence, drawn exactly once (not also in the trailing list)", live_card_replies === 1, live_card_replies);
	await page.waitForSelector(newest_sel + " .chat-v2-marks .chat-smart-cursor.done", { timeout: 15000 });
	check("🧠 turns done once the Reply (after smart.at) lands", true);

	check("no page errors", errors.length === 0, errors);
} finally {
	await close_browser();
	rmSync(here + "fixture/" + live, { force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
