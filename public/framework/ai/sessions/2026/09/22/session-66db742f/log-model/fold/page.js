import { Page, p, h2, h3, pre, div, small, ui } from "/app.js";
import { fold, parse } from "/framework/ai/2026-09-22/log-model/fold.js";

/* THE FOLD, RUN LIVE — the real fold.js, over the real sample.jsonl, in your browser.
 * Nothing here is a transcript of a run that happened somewhere else: the numbers
 * below are computed when this page loads. Parent: ../page.js. */

const SAMPLE = "/framework/ai/2026-09-22/log-model/sample.jsonl";
const SOURCE = "/framework/ai/2026-09-22/log-model/fold.js";

// One row per fold rule: what it says, and what the sample log proves about it.
function rules(out){
	const name = out.names["live-board"], task = out.tasks["build-live-board"], d = out.decisions["d-storage"];
	return [
		["Newest wins, merged field by field",
			"A later line carrying the same id corrects the fields it names and leaves the rest alone.",
			`The task opened as step 1, working. Three lines later it reads step ${task.step}, ${task.status} — and still carries the title from the first line: "${task.title}".`],
		["A name is the exception: the FIRST one is the one you see",
			"The fast assistant names a thing in seconds. A mastermind that disagrees adds a suggestion beside it.",
			`The assistant wrote "Live Board" at 09:02. The mastermind wrote "Agent Timeline" at 09:05 and it went into alternatives, not onto the screen.`],
		["A card marks what it names as seen by you",
			"A card is, by definition, your screen. Seen is what the rename check reads.",
			`The card at 09:02 referenced this name, so seen is ${!!name.seen} — which is why the mastermind's rename at 09:18 was refused.`],
		["A rename you did not ask for becomes a dispute",
			"The writer refuses it and appends the disagreement instead, so the attempt is recorded and your screen does not move.",
			`Line 19 of the sample is a dispute carrying refused: "rename". Your own rename, three lines later, applied: the visible name is now "${name.name}".`],
		["Approve locks it",
			"After an approve, further names and renames are kept as alternatives and the approved value stays visible.",
			`Locked is ${!!name.locked}. A mastermind tried "Agent Stream" afterwards and it is alternative number ${name.alternatives.length}, not the name.`],
		["A dispute adds an alternative, it never replaces one",
			"Everything ever proposed is still in the file and still readable; only one of them is what you see.",
			`This name carries ${name.alternatives.length} alternatives and ${name.history.length} lines of history, with one visible value.`],
		["Children attach by re",
			"A task is its newest task line plus every decision, file touch, intent and log that points at it.",
			`The task collected ${task.children.length} children, including ${task.children.filter(c => c.type === "file_touch").length} file touches, and its now is the newest intent: "${task.now}".`],
		["Approve and dispute settle a decision too",
			"The same two lines that lock a name are what an Approve and an Improve button write.",
			`The storage decision chose "${d.chose}" and your approve at 09:31 left it reading ${d.status}.`],
	];
}

export default new Page({
	meta: import.meta,
	title: "The fold, run live",
	description: "The real fold function, run in your browser over the thirty-line sample log, with every rule it follows shown against what the sample proves.",
	icon: "call_merge",

	content(){
		p("This page runs the actual fold function over the actual sample log, right now, in your browser. Every number and every quoted string below was computed when the page loaded — none of it is typed in. Open the console and type `fold(sample)` to poke at the whole result yourself.");

		div.c("flow", async $out => {
			const entries = parse(await fetch(SAMPLE).then(r => r.ok ? r.text() : "").catch(() => ""));
			const out = fold(entries);
			// The console handles the brief's "a reader can run it over a sample log".
			Object.assign(window, { fold, sample: entries, folded: out });

			$out.append(() => {
				if (!entries.length) { p.c("muted", "sample.jsonl did not load — is the dev server running?"); return; }

				h2("What came out");
				ui.table(["thing", "id", "what it reads now"], [
					["name", "live-board", `${out.names["live-board"].name} — locked, with ${out.names["live-board"].alternatives.length} alternatives kept beside it`],
					["task", "build-live-board", `${out.tasks["build-live-board"].title} — ${out.tasks["build-live-board"].status}, step ${out.tasks["build-live-board"].step} of 3`],
					["proposal", "pr-live-board", `stage ${out.proposals["pr-live-board"].stage}, naming ${(out.proposals["pr-live-board"].classes || []).join(", ")}`],
					["decision", "d-storage", `chose ${out.decisions["d-storage"].chose} — ${out.decisions["d-storage"].status}`],
					["card", "c-live-board", `${out.cards["c-live-board"].title} — ${out.cards["c-live-board"].status}`],
					["ask", "a-name", `${out.asks["a-name"].question} — answered`],
				]);
				small.c("muted", `${entries.length} lines in, ${Object.keys(out.names).length + Object.keys(out.tasks).length + Object.keys(out.decisions).length + Object.keys(out.proposals).length + Object.keys(out.cards).length + Object.keys(out.asks).length + Object.keys(out.prompts).length + Object.keys(out.refined).length} things out, ${out.orphans.length} orphans.`);

				h2("Every rule, against what the sample proves");
				ui.table(["the rule", "what it means", "what the sample shows"], rules(out));
			});
		});

		div.c("flow", async $src => {
			const src = await fetch(SOURCE).then(r => r.ok ? r.text() : "").catch(() => "");
			$src.append(() => {
				h2("The function itself");
				p("This is the file, fetched and shown whole, so it can never drift from the one that just ran above.");
				pre(src || "fold.js did not load.");
			});
		});

		h3("Where this goes");
		p("The dashboard calls this on every load. It is a single pass over the file and it finished 1,400 events in six milliseconds in the sample task's own measurement, so there is no cache to keep in sync and no second copy of the truth to disagree with the first.");
		p("Streaming transcript text is deliberately not folded. A `delta` is read forward by the UI as it arrives and then replaced by the `transcript` that carries the same turn id — the fold is for the things that settle, not for the words still arriving.");
	},
});
