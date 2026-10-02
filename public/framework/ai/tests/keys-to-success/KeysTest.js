import { Page, div, p, h2, ul, li, table, thead, tbody, tr, th, td, small } from "/app.js";

/* KeysTest — ONE of the owner's own past prompts, scored for Phase 17 ("keys to success").
 *
 * Same page.jsonl + class pattern as the ladder's `AITest.js` (`public/framework/ai/tests/
 * AITest.js`) — read that one first if this looks unfamiliar, it's the bigger write-up of the
 * same idea. Line 1 of this test's page.jsonl names this class and carries the prompt's own
 * text (never a fixture here — there's no "right answer" page to load, just a real sentence the
 * owner once typed). Every later line is one of three verbs `Servex/ext/openrouter/evals/
 * keys.mjs` appends:
 *
 *   {"key_run": {model, effort, keys: [...], cost_usd, ...}}   ← one model's raw extraction
 *   {"merge": {merged: [{id, key, weight}], mapping: {...}}}    ← the judge's consensus set
 *   {"model_score": {model, recall, precision}}                ← one model's score against it
 *
 * A model's KEYS are the primary statements, to-dos, questions and decisions buried in the
 * prompt — the checklist a good answer has to satisfy. Several models each list their own keys;
 * the judge then merges keys that mean the same thing under different wording (so independent
 * agreement reinforces a key rather than just duplicating it) and gives each merged key a
 * consensus weight — the share of models that found something like it. `recall` asks "did this
 * model find the heavy keys", `precision` asks "did it also invent keys nobody else saw". */
export default class KeysTest extends Page {

	initialize(){
		this.key_runs ??= [];
		this.scores ??= new Map();
	}

	key_run(data){ this.key_runs.push(data); }
	merge(data){ this.merged = data; } // latest-wins: a re-run of --judge replaces the old consensus
	model_score(data){ this.scores.set(data.model, data); }

	/* No child pages — a prompt has nothing underneath it, same reasoning as AITest.js's own
	 * child() (its comment has the fuller "why": a plain page.js child() probe would 404 here
	 * too, but there is also genuinely nothing to route to). */
	async child(){ return null; }

	content(){
		div.c("page-keys-test", () => {
			h2(this.merged?.merged?.length ? `Keys to success · ${this.merged.merged.length}` : "Keys to success");
			if (this.merged?.merged?.length){
				ul(() => {
					this.merged.merged.slice().sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0)).forEach(m => {
						li(`${m.key} — ${((m.weight ?? 0) * 100).toFixed(0)}% of models agreed`);
					});
				});
			} else {
				p.c("muted").text("No consensus yet — needs at least two models' extractions, then `keys.mjs --judge`.");
			}

			if (this.scores.size){
				h2("Per-model score");
				table.c("page-keys-test-scores", () => {
					thead(() => { tr(() => { ["model", "recall", "precision"].forEach(h => { th(h); }); }); });
					tbody(() => {
						[...this.scores.values()].forEach(s => { tr(() => {
							td(s.model);
							td(s.recall != null ? (s.recall * 100).toFixed(0) + "%" : "");
							td(s.precision != null ? (s.precision * 100).toFixed(0) + "%" : "");
						}); });
					});
				});
			}

			// The answer first (keys, then scores); the prompt it came from below it.
			h2("The prompt");
			div.c("page-keys-test-prompt card pad", () => { p(this.text ?? ""); });

			if (this.key_runs.length){
				h2(`Raw extractions · ${this.key_runs.length}`);
				this.key_runs.forEach(r => {
					small.c("muted").text(`${r.model} (${r.effort}):`);
					r.keys?.length ? ul(() => { r.keys.forEach(k => { li(k); }); }) : p.c("muted").text(r.note || "no keys parsed");
				});
			}
		});
	}
}

export { KeysTest };
