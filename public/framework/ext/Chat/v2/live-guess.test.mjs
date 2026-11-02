// node live-guess.test.mjs [base-url] [shots-dir] — headless: proves views-fix item 2 (V2 shows the live guess).
// Fires the real "chat-live" window event -- the exact one every mic composer dispatches (Widget.js:828,
// "Chat v3 draws the same unsent words") and the one ChatV3 already listens to (ChatV3.js:204-207) -- at
// V2's own demo page. Not a V2-only mechanism: proof that ChatV2 now subscribes to the shared one (law 6).
import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://views-fix.localhost";
const shots = process.argv[3] ?? "C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/views-fix/shots";
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

const browser = await Browser.browser();
const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
const errors = []; page.on("pageerror", e => errors.push(String(e)));

try {
	await page.goto(`${base}/framework/ext/Chat/v2/`, { waitUntil: "networkidle" });
	await page.waitForSelector(".chat-v2-prompt", { timeout: 15000 });   // the fixture's own prompts are drawn first

	// The composer isn't live on this read-only demo page, so dispatch the same event a real mic would.
	await page.evaluate(() => {
		window.dispatchEvent(new CustomEvent("chat-live", { detail: {
			text: "This part is already sent. this part is still a guess",
			settled: "This part is already sent.",
			guess: "this part is still a guess",
			sent: false,
		} }));
	});
	await page.waitForSelector(".chat-v2-draft", { timeout: 2000 });

	const colors = await page.evaluate(() => {
		const sent = document.querySelector(".chat-v2-draft-text");
		const guess = document.querySelector(".chat-v2-guess");
		return {
			settled_text: sent?.textContent.replace(guess?.textContent ?? "", "").trim(),
			guess_text: guess?.textContent.trim(),
			sent_color: sent ? getComputedStyle(sent).color : null,
			guess_color: guess ? getComputedStyle(guess).color : null,
		};
	});
	check("the draft card shows the settled (sent-style) words", colors.settled_text === "This part is already sent.", colors);
	check("the draft card shows the guess", colors.guess_text === "this part is still a guess", colors);
	check("guess colour differs from sent colour (draft-ink vs final-ink)", colors.guess_color !== null && colors.guess_color !== colors.sent_color, colors);

	await page.screenshot({ path: `${shots}/V2-live-guess.png` });

	// "sent" (the full message lands): the draft clears once nothing is left mid-utterance.
	await page.evaluate(() => window.dispatchEvent(new CustomEvent("chat-live", { detail: { text: "", settled: "", guess: "", sent: true } })));
	await page.waitForSelector(".chat-v2-draft", { state: "detached", timeout: 2000 }).catch(() => {});
	const after = await page.evaluate(() => !!document.querySelector(".chat-v2-draft"));
	check("the draft card is removed once the words are sent", after === false, after);

	check("no page errors", errors.length === 0, errors);
} finally {
	await Browser.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
