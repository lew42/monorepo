import { Page, p, h2, h3, div, small, ol, li, ui } from "/app.js";
import { fold, parse } from "/framework/ai/2026-09-22/log-model/fold.js";

/* FROM WHAT YOU SAID TO WHAT GOT BUILT — the five stages of a prompt, drawn from the
 * real sample log so the citations resolve live rather than being described.
 * Parent: ../page.js. */

const SAMPLE = "/framework/ai/2026-09-22/log-model/sample.jsonl";

const STAGES = [
	["1. raw", "prompt", "Your words, verbatim, timestamped, never tidied. Split into sentences once when the line is written, and frozen there."],
	["2. refined", "refined", "A cleaned, grouped, re-ordered reading of what you said — one refined line per idea, each one naming the sentences it came from."],
	["3. pre-proposal", "proposal, stage pre", "A sketch of a shape: the parts, in bullets, before anything is named. Not yet worth your attention."],
	["4. proposal", "proposal, stage full", "The same line again, now naming classes, methods and names. This is the one you could say yes to."],
	["5. build", "task", "Tasks pointing back at the proposal, each collecting its own intents, decisions and file touches."],
];

export default new Page({
	meta: import.meta,
	title: "From what you said to what got built",
	description: "One thread, all five stages: your raw sentences, the refined lines that cite them, the proposal, and the task that built it — resolved live out of the sample log.",
	icon: "graphic_eq",

	content(){
		p("A long spoken prompt does not become a plan in one step. It goes through five, and each step is a line in the log that points back at the one before it — so at any moment you can take a class name in the finished code and walk it back to the sentence you actually said. Below is that walk, on the thirty-line sample log, resolved when this page loaded.");

		ui.table(["stage", "the line", "what it is"], STAGES);

		div.c("flow", async $thread => {
			const out = fold(parse(await fetch(SAMPLE).then(r => r.ok ? r.text() : "").catch(() => "")));
			const prompt = out.prompts["p-1"];
			const refined = Object.values(out.refined);
			const proposal = out.proposals["pr-live-board"];
			const task = out.tasks["build-live-board"];

			$thread.append(() => {
				if (!prompt) { p.c("muted", "sample.jsonl did not load — is the dev server running?"); return; }

				h2("1. What you said");
				small.c("muted", `${prompt.at} · by ${prompt.by} · ${prompt.source}`);
				ol(() => prompt.sentences.forEach(s => li(s)));
				small.c("muted", "Numbered because the numbers are real: they are the index into the sentences array stored on this very line.");

				h2("2. What was made of it");
				p("Each refined line names the sentences it came from. The right-hand column is not a copy — it is those indexes looked up in the prompt above, just now.");
				ui.table(["refined", "cites", "the sentences it cites, resolved"], refined.map(r => [
					r.text,
					r.cites.map(c => c.sentences.join(", ")).join(" | "),
					r.cites.flatMap(c => c.sentences.map(i => out.prompts[c.prompt]?.sentences[i] ?? "(gone)")).join(" "),
				]));

				h2("3 and 4. The proposal, sketched then named");
				p(`It arrived twice under one id. First as a sketch: ${(proposal.history[0].shape || []).join("; ")}. Then, two minutes later, as the real thing — classes ${(proposal.classes || []).join(", ")} and methods ${(proposal.methods || []).join(", ")}. The fold merged the second onto the first, so the shape from the sketch is still there and the stage now reads ${proposal.stage}.`);

				h2("5. The build");
				p(`One task, "${task.title}", pointing at that proposal. It gathered ${task.children.length} lines of its own: ${task.children.filter(c => c.type === "intent").length} intents, ${task.children.filter(c => c.type === "file_touch").length} file touches, ${task.children.filter(c => c.type === "decision").length} decision, ${task.children.filter(c => c.type === "log").length} log line and a screenshot. It landed with: "${task.outcome}"`);
				ui.table(["file", "when", "by"], task.children.filter(c => c.type === "file_touch")
					.flatMap(c => c.files.map(f => [f, c.at.slice(11, 16), c.by])));
			});
		});

		h3("Why a citation is a sentence number and not a character offset");
		p("Both were on the table. Character offsets are exact — `chars 412 to 588` names the span to the letter — and they are the wrong answer here, for two reasons.");
		p("The first is that this text is dictated. Whisper transcribes it once, and a later pass fixes a word. Any correction that changes the length of one word shifts every offset after it, so every citation made before that correction now points at the wrong text, silently and with nothing to warn you. A sentence index survives a word-level fix untouched.");
		p("The second is that nobody can check an offset. You can read \"sentences 0 and 2\" against the numbered list above and see immediately whether it is honest. That matters more than precision, because the whole point of citing is that you can audit the summary against your own words.");
		p("The part that makes it airtight is this: the sentence split happens once, in the writer, and the resulting array is stored on the prompt line itself, which is immutable. So an index is not an index into text that might be re-split later by a different rule — it is an index into a frozen array that is part of the event. It cannot drift.");
		p("The one caveat, written down so it stays easy to change: a re-transcription is a new `prompt` line carrying the same id, not an edit of the old one. A `refined` line that cited the old text still carries the `seq` of the exact line it cited, so a reader can always see which version of your words the summary was made against.");
	},
});
