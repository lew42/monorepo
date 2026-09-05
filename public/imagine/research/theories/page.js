import { Page, md } from "/app.js";

/* The major theories. Five subjects, each read claim → evidence → assessment →
   implications (one screen, the repo's own law for a theory page), credence-
   labelled throughout. The raw log a sibling page aggregates is `log.jsonl`
   beside this file (34 round-1 entries + 23 round-2 entries = 57); these pages
   are the curated reading of it. `previews()` draws the six as cards so this
   index stays a paragraph plus the list — nothing here restates a subject page. */

export default new Page({
	meta: import.meta,
	title: "The Major Theories",
	description: "Younger Dryas impact, lost ice-age civilization, ancient astronauts, catastrophism vs gradualism, and interdimensional/psychosocial UAP — claim, evidence, expert opinion, and what would settle each.",
	icon: "account_tree",

	children: "younger-dryas lost-civilization ancient-astronauts catastrophism-gradualism uap-hypotheses synthesis patterns",
	index: true, // content() already shows every child as a previews() wall below

	content(){
		md(`Five theories that keep resurfacing around ancient technology and anomalous phenomena — each read the same way: **claim**, **best evidence**, **contemporary expert opinion** (named, dated), **implications if true**, and **what would settle it**. One is genuinely contested inside real journals; the others range from a real archaeological revision being over-read, to long-rejected pseudoarchaeology, to a settled 19th-century framework, to a live modern dispute with no settled answer yet. Credence labelled throughout: **established** / **contested** / **fringe** / **speculation** — the label is the writer's claim about the evidence, never upgraded by this page.

The [synthesis](/imagine/research/theories/synthesis/) page is the program's capstone — five rounds pulled across all four topics, the round-4 questions written down cold, and a cross-topic observation stress-tested in round 2, labelled \`speculation\`. [What Recurs](/imagine/research/theories/patterns/) is round 6 beside it: the same corpus read as an object — where credences cluster, which claim-types survived, what every correction actually fixed — and one new hypothesis, that **custody, not funding**, decides which measurement ever gets made.

Sourced findings as they were logged: [\`log.jsonl\`](/imagine/research/theories/log.jsonl).`);
		this.previews();
	},
});
