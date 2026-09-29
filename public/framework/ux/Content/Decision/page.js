import { Doc, md, demo, div } from "/app.js";
import Decision from "./Decision.js";
import Decisions from "./Decisions.js";
import { decision_fresh, decision_legacy, decision_legacy_title } from "../fixtures.js";

const live = () => new Decision(decision_fresh());

/* Three records as Server/decide.mjs writes them: one foundational decision, and two that
 * only matter if its first option is chosen (their depends_on names that option). */
const log = new URL("demo.jsonl", import.meta.url).pathname;
const nested = () => new Decisions({ log, records: [
	{ id: "d-demo-host", rank: 1, question: "Where should the dashboard run?", confidence: 0.7, recommended: "local",
		options: [
			{ id: "local", text: "On this machine", caveats: ["Only reachable at home."] },
			{ id: "cloud", text: "On a rented server", caveats: ["A monthly bill, and one more thing to keep patched."] },
		],
		why: "Everything it watches is on this machine already.", sources: ["demo-a"] },
	{ id: "d-demo-port", rank: 2, depends_on: { decision: "d-demo-host", option: "local" }, question: "Which port does it take?",
		confidence: 0.9, recommended: "80", sources: ["demo-b"],
		options: [{ id: "80", text: "Port 80", caveats: ["Needs admin once."] }, { id: "8080", text: "Port 8080", caveats: ["Every link carries :8080."] }] },
	{ id: "d-demo-wake", rank: 3, depends_on: { decision: "d-demo-host", option: "local" }, question: "Does it start with the machine?",
		confidence: 0.6, recommended: "yes", sources: ["demo-c"],
		options: [{ id: "yes", text: "Yes, at login", caveats: ["Runs even when not wanted."] }, { id: "no", text: "No, by hand", caveats: ["Easy to forget."] }] },
] });

export default new Doc({
	meta: import.meta,
	title: "Decision",
	description: "A decision card: every option with its caveat, one chosen, changeable.",
	icon: "rule",

	files: "Decision.js Decisions.js decision.css page.js readme.md",
	notes: "shape",

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(live, steer),
			def: live,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Click an option.** A `chose` line lands in `demo.jsonl`, the card marks it chosen, and the others stay clickable.",
		});

		md("## Ranked and nested");
		md("`Decisions.js` draws every decision in a log: the most foundational (rank 1) first, and each child below its parent, **under the option that leads to it** — choose this, then decide these. `Server/decide.mjs` writes the records, one step at a time, so none of rank, caveats, confidence or sources can be left out.");
		nested();

		md("## Old decisions render the same way");
		md("The two decision shapes already in `task.jsonl` files become this same card — the options are `chose` plus `over` (or `alternative`), and `chose` is pre-selected.");
		div.c("flex v gap", () => {
			new Decision(decision_legacy());
			new Decision(decision_legacy_title());
		});

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", live)); },
});
