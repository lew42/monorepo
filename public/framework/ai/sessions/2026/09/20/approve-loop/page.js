import { Page, p, b, md, div, img } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; the loop strip and detail shots claim wide.
   3 OWN LAYOUT headline, the loop shown working (press → result → undo → improve,
                four shots in the order they happened), then the spacing/colour
                fix on the real detail page, then which of the owner's four
                complaints were already fixed versus fixed here, then the link
                and the one decision made along the way.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

const shot = name => new URL("shots/" + name + ".png", import.meta.url).pathname;

export default new Page({
	meta: import.meta,
	title: "Approve loop",
	description: "Approve/Improve now say what they do, show what happened, and work from a card's own url — plus the real spacing bug left after this morning's padding fix.",
	icon: "fact_check",

	content(){

		p("The owner's own words: ", b("\"I saw one approve button, but it wasn't really clear what would happen if I click it.\""), " Nothing about Approve/Improve needed rebuilding — it already writes one line to a file and never touches the card, exactly right. What was missing was legibility: a button that says what it does, a result you can actually see, and a way to reach a card's own controls in the first place. All three are fixed below, proven on scratch data so nothing here touched the real board.");

		md("## The loop, shown working").ac("wide");
		div.c("grid auto gap", () => {
			this.figure("loop-1-undecided", "1. Before pressing anything — a plain sentence says what each button does, and the sub-cards underneath are properly padded with black (not blue) titles.");
			this.figure("loop-2-approved-toast", "2. Approve — a toast confirms it, names the card, and offers Undo, while the reader moves on to the next one.");
			this.figure("loop-3-undone", "3. Undo — the same card returns, buttons back to normal, nothing lost.");
			this.figure("loop-4-improved-toast", "4. Improve, with a one-sentence note — its own toast, and the note really did reach the mastermind's inbox.");
		}).style({ "--column": "22rem" }).ac("wide");

		md("## What was actually broken\n\nThree small things, not one big redesign:").ac("wide");
		md("- **A card's own url didn't reliably show its own detail.** If the last-chosen view was \"grid\" or \"now\" (the owner's normal way of browsing), clicking a card just redrew the same wall — the url changed, nothing else did. This is very likely the real reason Approve/Improve never looked predictable: most clicks never even reached them. Fixed — a card's own url now always opens that card's detail, whichever view you were just on.\n- **The buttons never said what they'd do.** Added one plain sentence above them, plus a tooltip on each.\n- **A press had no visible result.** The card leaving the list read as \"it vanished.\" A toast now names what happened and offers Undo, and it survives the automatic move to the next card.").ac("wide");

		md("## The detail page's spacing").ac("wide");
		p("A sibling task (", b("ai-padding"), ", landed this morning) had already restored a whole missing ", b(".card"), " class in framework.css — and that class is what gives every sub-card its padding and its black ink colour. Measuring before touching anything showed two of the owner's four complaints were already gone:");
		md("| the owner's complaint | already fixed by `ai-padding`? | measured |\n|---|---|---|\n| no padding on sub-cards (\"it says four inside\") | **yes** | 16–18px padding, not 0 |\n| titles rendering blue like links | **yes** | ink colour (`rgb(63,63,63)`), not link-blue |\n| not enough vertical spacing | **no — fixed here** | one section (`.v3-verdict`) hardcoded `1em` instead of the card's own `--gap`, so it sat closer than everywhere else (16px against 20–27px at 1920) |\n| \"just add the default padding and default gap\" | **no — fixed here** | removed the hardcoded value; the card's own default rhythm rule now reaches it, same as everywhere else in the same card |").ac("wide");

		div.c("grid auto gap", () => {
			this.figure("real-detail-1920", "The real detail page, 1920px, after every fix — padding, ink titles, and the last section now sitting the same distance from its neighbour as the rest of the card.");
			this.figure("real-detail-400", "The same page at 400px, reached from a card's own url on a phone-width screen.");
		}).style({ "--column": "24rem" }).ac("wide");

		md("## One decision made\n\n**Ask and verdict stay two separate controls.** An `ask` is the mastermind asking the owner something short-lived (yes/no); a verdict is the owner judging a finished report, with its own undo and note. They already sit side by side cleanly on one card without fighting each other — the full reasoning, and the alternative considered, is this task's own `decision` line.").ac("wide");

		p.c("muted", "Proven headless throughout — never the owner's own tab. The loop above ran against a scratch board+verdicts pair kept in this task's own folder; the real board.jsonl and verdicts.jsonl were hashed before and after and are byte-identical. Full numbers, the click-through bug's own proof, and the race condition found and fixed in Undo are in this task's own task.jsonl.");
	},

	figure(name, caption){
		return div.c("surface pad flex v gap-25", () => {
			img().attr("src", shot(name)).attr("alt", caption).style({ width: "100%", borderRadius: "0.4em" });
			p.c("muted", caption);
		});
	},
});
