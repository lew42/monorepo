// node sentence-send.test.mjs [base-url] — headless: proves views-fix item 0 (send sentence by sentence).
// Needs the global playwright and the dev server. Drives the real ComposerMic class (Mic.js) in a page,
// seeding `held` the same shape `commit()`/`log_prompt()` builds, then calling the real send methods.
import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://views-fix.localhost";
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

const browser = await Browser.browser();
const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
const errors = []; page.on("pageerror", e => errors.push(String(e)));

try {
	await page.goto(`${base}/framework/ext/Chat/v3/`);
	await page.waitForSelector(".chat-v3", { timeout: 15000 });

	// 1. One long final with several sentences -> several messages, in order, none lost (item 0's own test).
	const several = await page.evaluate(async () => {
		const { ComposerMic } = await import("/framework/ext/Chat/Mic.js");
		const delivered = [];
		const mic = new ComposerMic({ deliver: entry => { delivered.push(entry.text); return true; } });
		mic.base = "";
		mic.held = [{ text: "Sentence one. Sentence two. Sentence three.", raw: "Sentence one. Sentence two. Sentence three.", br: false, ready: Promise.resolve() }];
		await mic.send_sentences(1);   // the default, sentences_per_send: 1
		await mic.post_tail;   // enqueue() posts items through its own promise chain, not awaited by send_sentences
		return { delivered, held_after: mic.held.map(h => h.text) };
	});
	check("default sentences_per_send sends one message per sentence", JSON.stringify(several.delivered) === JSON.stringify(["Sentence one.", "Sentence two.", "Sentence three."]), several.delivered);
	check("in order, none lost: nothing left in `held`", JSON.stringify(several.held_after) === JSON.stringify([]), several.held_after);

	// 2. An unfinished tail (no sentence end yet) stays held — a mid-thought pause must not fragment it.
	const tail = await page.evaluate(async () => {
		const { ComposerMic } = await import("/framework/ext/Chat/Mic.js");
		const delivered = [];
		const mic = new ComposerMic({ deliver: entry => { delivered.push(entry.text); return true; } });
		mic.base = "";
		mic.held = [{ text: "Sentence one. and then still going", raw: "Sentence one. and then still going", br: false, ready: Promise.resolve() }];
		await mic.send_sentences(1);
		await mic.post_tail;
		return { delivered, held_after: mic.held.map(h => h.text) };
	});
	check("the finished sentence goes out", JSON.stringify(tail.delivered) === JSON.stringify(["Sentence one."]), tail.delivered);
	check("the unfinished tail stays held, not sent as its own bubble", JSON.stringify(tail.held_after) === JSON.stringify(["and then still going"]), tail.held_after);

	// 3. The safety flush (check_chunk, n=Infinity) must not wait forever on a dictation with no
	// sentence-ending mark anywhere in it — the exact shape of the owner's 20:40 dictation (3,463
	// chars, one `sentences` line, no newline). Before this fix: cut_re found nothing, so send_sentences
	// returned early and the text grew unbounded until `stop()`. Now it flushes as the safety's job is to.
	const no_punct = await page.evaluate(async () => {
		const { ComposerMic, SETTINGS } = await import("/framework/ext/Chat/Mic.js");
		const delivered = [];
		const mic = new ComposerMic({ deliver: entry => { delivered.push(entry.text); return true; } });
		mic.base = "";
		const chunk_chars_was = SETTINGS.chunk_chars;
		SETTINGS.chunk_chars = 1000;   // the real default (1200) over the network, just lowered here so a realistic-length run-on crosses it
		// 1200+ chars, zero punctuation, nothing repeated (collapse_tail, Mic.js:744, would otherwise
		// treat an exact repeat as a Whisper echo and halve it — a real feature, not this bug, so this
		// run-on reads like actual rambling speech instead of one phrase looped).
		const long_run_on = "so it works and then it keeps going without a stop while the owner just keeps talking in one long breath never landing on a period because the thought itself never really finishes it just keeps turning into the next one and the one after that and so on for quite a while longer than anyone would plan for on purpose but that is exactly how a long rambling dictation actually sounds when nobody is pausing long enough to let a single sentence land and the mic just keeps hearing more words arrive one after another without any of them ever closing off what came before so the whole thing grows and grows the longer the owner keeps going without ever stopping to take much of a breath at all which is fairly often how a real phone dictation actually plays out when someone is thinking out loud while walking around the house trying to remember a dozen different errands and half-formed plans all in the same breath with the dog barking somewhere in the background and the kettle starting to whistle on the stove while the words keep arriving faster than any period ever gets a chance to land between them";
		mic.held = [{ text: long_run_on, raw: long_run_on, br: false, ready: Promise.resolve() }];
		mic.chunk_start = performance.now() - 1;   // not the time-based trigger: this proves the char-length trigger alone
		mic.check_chunk();
		await new Promise(r => setTimeout(r, 50));   // check_chunk's send_sentences is async, fire-and-forget from check_chunk
		await mic.post_tail;
		SETTINGS.chunk_chars = chunk_chars_was;
		return { delivered, held_after: mic.held.map(h => h.text), source_len: long_run_on.length };
	});
	check("a punctuation-less run-on past chunk_chars is still flushed (not silently withheld)", no_punct.delivered.length === 1 && no_punct.delivered[0].length === no_punct.source_len,
		{ delivered_count: no_punct.delivered.length, delivered_len: no_punct.delivered[0]?.length, source_len: no_punct.source_len });
	check("nothing left behind after the safety flush", JSON.stringify(no_punct.held_after) === JSON.stringify([]), no_punct.held_after);

	check("no page errors", errors.length === 0, errors);
} finally {
	await Browser.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
