import { Page } from "/app.js";

const SLUGS = [
	"bigger", "unsupported-link", "whisper-segments", "decisions-tab-screenshot",
	"cards-and-logs-subdomain", "token-budget-bursts", "capability-before-cost",
	"lifecycle-reaper-stop", "is-the-test-a-good-test", "research-process-fast-assistants",
];

/* The Phase 17 "keys to success" benchmark — a wall of the owner's own past prompts, each one
 * a KeysTest page (`KeysTest.js`). `Servex/ext/openrouter/evals/keys.mjs` is the one writer; see
 * its own header for how a prompt turns into a page here, and KeysTest.js for what's on one.
 *
 * Same situation as `/framework/ai/tests/` one level up: every child here is a page.jsonl, and a
 * plain page.js's own `child(name, levels)` only ever probes a declared name's `page.js` — it
 * never tries `page.jsonl` on its own. Without this override every link below 404s. */
export default new Page({
	meta: import.meta,
	title: "Keys to success",
	description: "The owner's own past prompts, scored: which keys to success did each model find, and which did it miss or invent?",
	children: SLUGS.join(" "),

	async child(name, levels){
		if (!SLUGS.includes(name)) return null;
		const page = await Page.jsonl(this.url + name + "/");
		return page && this.add(name, page).load_all_children(levels);
	},

	content(){
		this.previews();
	}
});
