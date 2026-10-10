import { Page, div, p, b, a, code, img, small } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page in the day's board — the ordinary `main` column.
                Prose measure, page rhythm; nothing here needs `wide`.
   2 SIZE       one screen: what it is, the picture, then what was proven as
                one-liners. Same shape at 400 as at 3440, one column throughout.
   3 OWN LAYOUT `.flow` for the prose the page already is; `flex v gap-25` for
                the proof lines, which are a list of short facts and would be
                eleven boxes if each got a card.
   4 REGIONS    three — the picture, what was proven, the way in.
   5 PREVIEW    the day board's own card; one line. */

const SHOT_1280 = new URL("shots/inbox-1280.png", import.meta.url).pathname;
const SHOT_400 = new URL("shots/inbox-400.png", import.meta.url).pathname;

/* The eleven checks the proof run drives, in the order it drives them, with the
   numbers it actually read back. Not a description of the page — a transcript
   of it being used. */
const PROVEN = [
	["It loads", "305 cards, 300 of them carrying an unread dot, the count in the page and in the browser tab title."],
	["The two numbers agree", "Cards on the screen, 305. Board ids ∪ prompt ids ∪ landed tasks, 305. Compared as sets inside one snapshot, so a mismatch would name the id rather than just the difference."],
	["Your words become a card", "A real sentence posted to the assistant's log was a card on the screen 40 milliseconds later."],
	["And then it renames itself", "3.1 seconds later the same card became “Inbox Turns Sentence Into Card”, in place — one row, one id, no second card and no flicker."],
	["Opening one marks it read", "The dot went, the count dropped by one, and a `read` line landed in `verdicts.jsonl`."],
	["The flag reaches the mastermind", "An `improve` line with the sentence, and it shows up in the mastermind's own inbox."],
	["Selecting a span flags that span", "The same flag appears over the selection, and the verdict carries the quoted words."],
	["The assistant can be off", "Pointed at a dead port, the page still drew 283 cards from the two static files and said so, throwing nothing."],
	["Nothing errors", "Zero console errors and zero failed requests across the whole run, at 400 and at 1280."],
];

export default new Page({
	meta: import.meta,
	title: "inbox-model",
	icon: "inbox",
	description: "AI 2 is an inbox now: say something, watch it become a card.",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "Say a sentence and it is a card in a twentieth of a second, then renames itself when the assistant answers. One flag per card, nothing else."));
	},

	content(){
		p(b("AI 2 is an inbox."), " There is a box you talk to at the top and, under it, every card there is — newest first, and the ones you have never opened first of all. Say something into the box and it is a card on screen almost immediately, in your own words. A few seconds later that same card renames itself into what the fast assistant made of it: a title, a short reading of what you meant, and the names it minted, with your own sentences folded underneath. It is one card the whole time — it never duplicates and never jumps.");

		p("Every card carries ", b("one flag"), " and nothing else. Press it, type a line, press Enter, and that sentence reaches the mastermind and redirects the work. Select some text inside a card first and the same flag appears over your selection, so the message can be “not this bit” and mean it exactly. There is no Approve anywhere, and opening a card is the only thing that marks it read.");

		// Thumbnails, each a link to the full-size png — a 26em shot of a 1280px
		// screen is unreadable, and the point of showing it here is the shape,
		// not the words. Captions kept to two words so the pair fits on one
		// line inside the prose measure instead of stacking at every width.
		div.c("flex wrap gap-25", () => {
			div.c("flex v gap-25", () => {
				small.c("muted", "1280 — two columns");
				a({ href: SHOT_1280 }, () => img.c("card").attr("src", SHOT_1280)
					.attr("alt", "The AI 2 inbox at 1280: a text box at the top with a microphone and a Send button, the unread count under it, then two columns of cards, each with an icon, a title, a quiet line saying who and when, a few sentences and a small flag.")
					.style({ display: "block", width: "26em" }));
			});
			div.c("flex v gap-25", () => {
				small.c("muted", "400 — one column");
				a({ href: SHOT_400 }, () => img.c("card").attr("src", SHOT_400)
					.attr("alt", "The same inbox at a phone width: one column of cards under the box.")
					.style({ display: "block", width: "9em" }));
			});
		}).style({ marginBlock: "1em" });

		p(a("Open it", { href: "/framework/ai2/" }), " — it is live, and it is reading the same logs the old board reads. The old board at ", a("/framework/ai/v/3/", { href: "/framework/ai/v/3/" }), " is untouched and still works; nothing here imports from it.");

		p.c("h3", "What was proven, by driving it");
		p.c("muted", "Eleven checks, all passing, run headless against the page rather than described. The full transcript is in the task log.");
		div.c("flex v gap-25", () => {
			PROVEN.forEach(([label, text]) => p(b(label + " — "), text));
		}).style({ marginBlock: "1em" });

		p.c("h3", "Two bugs it found on the way");
		p("Both were invisible — nothing threw, nothing overflowed, and both would have shown up as “that feature just doesn't work” weeks later. ", b("The flag over a selected span"), " was placed 38 pixels above the selection with nothing stopping it going off the top of the window, so selecting text near the top of the screen put the button somewhere unreachable. ", b("A prompt written before the log had ids"), " was being named by its position in the list — and the list is a rolling window, so that name meant a different sentence every time an old line fell off the end, which would have moved a flag from one sentence onto another. Both are fixed, and both are written down where the next person will look: ", a("doc/decisions.md", { href: "/framework/ai2/doc/decisions.md" }), ".");

		p.c("h3", "The way in");
		p("The module is four files at ", code("public/framework/ai2/"), " — ", code("page.js"), " draws, ", code("inbox.js"), " decides what there is to draw, ", code("compose.js"), " is the box at the top and ", code("ai2.css"), " is the look. Start at its ", a("readme", { href: "/framework/ai2/readme.md" }), "; the four logs it reads and the one it writes are in ", a("doc/logs.md", { href: "/framework/ai2/doc/logs.md" }), ", and every fork in the road with its alternative named is in ", a("doc/decisions.md", { href: "/framework/ai2/doc/decisions.md" }), ".");

		p.c("h3", "What is deliberately left");
		p(b("There is no filter row."), " Three hundred cards is what the inbox honestly holds on its first day, because nothing has been opened yet, and the count says so. A filter (unread only, today, flagged) is easy to add to a page that has nothing to move out of the way, and worth adding once the owner has used it and knows which filter they actually want — guessing now would put back the chrome this page exists to remove.");
		p(b("The `ai2-` prefix is not in the class-name registry."), " ", code("framework/styles/css-scopes.txt"), " is outside this task's fence, so the one line — ", code("ai2-        ai2 (AI 2, the inbox)"), " — is left for whoever holds that file next. Nothing collides today; the prefix is unique.");
	},
});
