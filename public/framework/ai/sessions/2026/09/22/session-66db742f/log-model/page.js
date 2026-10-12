import { Page, p, h2, h3, a, div, ui } from "/app.js";

/* THE LOG MODEL — the design half of the Servex Mastermind's memory.
 * Brief: ai/2026-09-22/log-model/requirements.md (sections D, E and F of the owner's
 * architecture brief). Full schema: events.md beside this file. The fold itself is
 * fold.js, run live on the Fold child page over sample.jsonl. No server code here —
 * this is the shape the appender and the dashboard both build against. */

const TYPES = [
	["Words — what was said", [
		["prompt", "Your words, verbatim, split into sentences once and frozen."],
		["refined", "A cleaned, grouped reading of one or more prompts, citing the sentences it came from."],
		["proposal", "A concrete shape you could say yes to. A sketch is the same type with stage: pre."],
	]],
	["Judgment — what got settled", [
		["name", "Someone named a thing. The first one is what you see; later ones wait beside it."],
		["rename", "A request to change an existing name. Only yours applies to a name you have seen."],
		["approve", "You said yes. It locks the thing: later names and disputes become alternatives."],
		["dispute", "Not that, this instead. Recorded beside the visible value, never over it."],
		["decision", "One choice, the options it was chosen over, and the reason."],
	]],
	["Work — what is being done", [
		["task", "One unit of work: title, steps, the step underway, how it landed."],
		["intent", "What an agent is doing right this second, one sentence."],
		["file_touch", "A file was written or edited. Recorded by the machine, not by the agent."],
		["log", "A finding, a measurement, a milestone."],
		["shot", "A screenshot, kept outside the repo."],
	]],
	["Agents — what actually ran", [
		["transcript", "One finished turn of an agent talking."],
		["delta", "A piece of that turn still arriving, under the same turn id, so it can stream."],
		["tool", "A tool call: the name and a short summary of what it was given."],
		["result", "The turn ended: cost, how long, how many turns."],
		["subagent", "Transcript text from an agent inside an agent."],
		["agent_msg", "A message pushed into a live agent, carrying who asked and where to answer."],
		["error", "Something failed."],
	]],
	["Your screen", [
		["card", "One preview card on the board. Appending one marks what it names as seen by you."],
		["ask", "A question put to you, with buttons."],
		["answer", "Your reply to one ask."],
		["rank", "Your order for one list. The last one wins outright."],
	]],
];

const CHECKS = [
	["The fast assistant names things at once", "name", "Nothing is checked. A name for something nobody has named is accepted instantly, from any tier."],
	["A mastermind may propose alternatives", "name again", "Accepted and stored as an alternative. The first name stays the one you see."],
	["Nothing you have seen is renamed unless you ask", "rename", "Has any card shown this to you? Then only your own rename applies. Anyone else's is turned into a dispute."],
	["An approved name is locked", "name, rename, dispute", "Has anything approved this id? Then the approved value stays visible and the new line is filed as an alternative."],
];

const TIERS = [
	["The fast assistant", "Sonnet, low effort, seconds", "prompt (your words, verbatim), name, card, ask, intent, log",
		"Never approves, never renames, and never edits or summarises your words on the way through."],
	["Masterminds", "Any effort, several at once", "everything above, plus refined, proposal, task, decision, dispute, agent_msg",
		"Never approves. A rename of something you have seen becomes a dispute. Cannot overwrite a visible name."],
	["Minions", "Haiku, Sonnet or Opus, one job each", "task, intent, log, file_touch, decision, shot, and their own transcript, delta, tool, result, error",
		"Cannot name anything outside their own task, cannot approve, cannot post a card."],
	["You", "Whenever you feel like it", "approve, dispute, rename, answer, rank, prompt",
		"Nothing. And nothing waits for you: approval is a lock, not a gate."],
];

export default new Page({
	meta: import.meta,
	title: "The log model",
	description: "One append-only file of typed events per session. Nothing is edited in place: approve, rename and dispute are new lines, and everything you look at is folded back out of them.",
	icon: "receipt_long",
	children: "fold lifecycle",

	content(){
		p("Every session writes one file, and that file only ever grows. A line goes in and is never touched again. Approving something, renaming it, or arguing with a name are all just more lines. What you actually look at — your tasks, the names of things, the decisions, your own words — is rebuilt from those lines every time the page loads, so there is never a second copy of the truth that can quietly disagree with the first.");

		div.c("card", () => {
			h2("When two agents disagree, this is the rule");
			p("Append and fold, with one visibility rule built into the writer. Anyone may add a name at any moment, but the first name for a thing is the one you see, and only you can change a name you have already been shown. Everything else lands beside it as an alternative — there when you want it, invisible when you do not.");
			p("The runner-up is a dedicated log assistant, one session whose only job is to reconcile a contested thing. It becomes worth its tokens the day you start seeing five competing names on one item at once, because picking the best of five and explaining why is a judgment call, and judgment is the one thing a fold cannot do. Below that, it is a paid session doing what an `if` statement already does correctly.");
			p("First-proposer ownership was the option this replaces. It needs a lock table and a release rule, and it answers a question already answered: the fast assistant always proposes first, so \"first proposer owns\" just means \"the assistant owns\" — which is what first-name-wins gives you, with nothing to lock and nothing to unlock.");
			p("The sample log did expose one hole in plain append-and-fold, and it is worth knowing because it is silent. If newest-wins applied to names the way it applies to everything else, two agents naming the same thing seconds apart would leave the second name on your screen and nobody would ever know the first existed. That is why the first name wins — it is the one exception to newest-wins in the whole model, and without it the naming rules are not actually enforced, they are just usually true.");
		});

		h2("Your four naming rules, as checks the writer runs");
		p("These are not advice in a skill that an agent can forget. They are four `if` statements in the one function that appends to the file, and that function is the only way in — so no agent can get around them by being careless, by being told to, or by being a different model.");
		ui.table(["Your rule", "The line it arrives as", "What the writer checks before it lets the line in"],
			CHECKS.map(([rule, type, check]) => [rule, type, check]));
		p("A refusal is never an error. The writer appends the safe line instead — a dispute rather than a rename — and hands back that line's id. A careless agent and a careful one end up in the same place, and the difference shows up only as an alternative you can glance at and ignore.");

		h2("The twenty-four kinds of line");
		p("Every line carries the same six fields: `at` (the clock, stamped by the writer so nothing can drift), `seq` (this line's own address), `id` (the thing the line is about — many lines share one id, and that is the point), `type` (one of these), `by` (who wrote it, read from the connection, so nobody can claim to be you), and `re` (what it hangs off).");
		TYPES.forEach(([band, rows]) => {
			div.c("flow", () => {
				h3(band);
				ui.table(["line", "what it records"], rows.map(([type, what]) => [type, what]));
			});
		});
		p("An id is minted once and frozen: the first name for a thing turns into its id, and the id never changes again however often the thing is renamed. That is what makes renaming safe — the label moves, the address does not, and no link ever breaks.");

		h2("Who is allowed to write what");
		ui.table(["Tier", "How fast", "May append", "May not"], TIERS);
		p("The tiers are enforced in the same place as the naming rules, by the same reading of `by`. An agent cannot append as you, and only your own connection may approve, answer or rank.");

		h2("See it work");
		p(() => { a("The fold, run live").href(this.url + "fold/"); });
		p("The real fold function, run in your browser over a thirty-line sample log, with each rule it follows shown beside what the sample actually proves about it. This is where to go if you want to be convinced rather than told.");
		p(() => { a("From what you said to what got built").href(this.url + "lifecycle/"); });
		p("One thread through all five stages — your raw sentences, the summaries that cite them by number, the proposal, the task, the files it wrote — with the citations resolved live, so you can check each one against the sentence it claims.");

		h2("More");
		p(() => { a("events.md — the full schema, every field, every example line, and how today's log lines map onto it").href(import.meta.resolve("./events.md")); });
		p(() => { a("sample.jsonl — the thirty-line story these examples come from").href(import.meta.resolve("./sample.jsonl")); });
		p(() => { a("fold.js — the function itself, seventy lines including its own explanation").href(import.meta.resolve("./fold.js")); });
	},
});
