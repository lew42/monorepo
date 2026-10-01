import { Page, div, p, h2, ul, li, small, table, thead, tbody, tr, th, td, a } from "/app.js";

/* AITest — ONE test of the openrouter test library, as a real page.
 *
 * Amendment 5 (test-library/requirements.md, "Phase 10: an AITest is a PAGE"): the SAME shape
 * AI 2's card (`/framework/ai2/card.js`) already uses for a card-as-a-folder — this file IS the
 * class, and `public/framework/ai/tests/<slug>/page.jsonl`'s line 1 names it:
 *
 *   {"class": "/framework/ai/tests/AITest.js", "title", "kind", "rung", "skills",
 *    "prompt": "prompt.md", "criteria", "expected", "judge", "confidence"}
 *   {"run": {"model", "effort", "pass", "score", "reasoning", "cost_usd", "ms", "note", ...}}
 *   {"run": {...}}                                  ← every run appended, one line each
 *
 * `core/Page/Log.js`'s `Page.jsonl()` builds line 1 into `new AITest(line1)`, and every line
 * after that is one `set()` call: a key that names a method calls it (so `run` below is a new
 * page.jsonl VERB, the same way `file` and `place` already are), anything else is kept as plain
 * data on `this` — that is how `title`, `kind`, `rung`, `skills`, `criteria`, `expected`, `judge`
 * and `confidence` land here with no code of their own.
 *
 * A much smaller sibling of Card: a test has no chat, no sub-cards, no tabs — just a prompt, a
 * checklist, and a table of what happened when a model tried it. `core/Page/card/mini-pages/
 * MiniPages.js` is the closer relative (a tiny page.jsonl-driven class with one new verb and one
 * list) — read that first if this file is confusing; it's the same idea at an even smaller scale.
 *
 * `Servex/ext/openrouter/evals/library.mjs` is still the only runner: it reads a test's prompt
 * and criteria from this same page.jsonl (via plain fetch/JSON, not by loading this class — this
 * file is DOM-only, the runner is node-only, and neither needs the other), and appends a `run`
 * line here through `.claude/hooks/append.mjs` after every real run. This class only ever DRAWS
 * what is already on disk; it never spawns anything itself. */
export default class AITest extends Page {

	initialize(){
		this.criteria ??= [];
		this.runs ??= new Map(); // run() below needs a Map, not an array — see its own comment
		this.confidence ??= 0;
	}

	/* The new page.jsonl verb: `{"run": {...}}`. Kept as a Map keyed by the run's own `run` name
	 * (its run dir, e.g. "h1-page-claude-opus-5-5-medium-173..."), latest-wins merged — the same
	 * pattern Card's `item()` uses for an outline line. This is what lets `--judge` ADD a `score`
	 * to a run that already landed: it appends a SECOND `{"run": {"run": "<same name>", "score":
	 * …}}` line rather than rewriting the first one, and this merges the two into one row instead
	 * of showing the same run twice. A run with no name (should never happen — library.mjs always
	 * sets one) falls back to its own line number so it still shows, just un-mergeable. */
	run(data){
		const runs = this.runs ??= new Map();
		const key = data?.run ?? `#${runs.size}`;
		runs.set(key, { ...runs.get(key), ...data });
	}

	/* The line past which a cheap model's score against this test actually means something —
	 * the same bar library.mjs's reference.md uses: at least 3 of the 4 strong models agreed. */
	/* A test has no child pages. Its fixture/ is the copy source for a run, and some fixtures
	 * are broken ON PURPOSE (broken-import imports a file that doesn't exist), so loading one
	 * as a page would throw on every page that loads this test. */
	async child(){ return null; }

	get trusted(){ return (this.confidence ?? 0) >= 0.75; }

	/* Amendment 6 (Phase 11) — is THIS a good test? `{"meta": {...}}`, written by library.mjs's
	 * `recomputeAllMeta()` (node: it needs every OTHER test's runs too, which this browser class
	 * can't cheaply gather — see that function's own comment), latest-wins like any other plain
	 * data key. A test with no meta line yet (nobody has run `--route` since this test existed)
	 * just shows nothing extra — not a zero, which would look like a real measurement. */
	meta(data){ this.test_meta = data; }

	/* Amendment 6 item 3: `--review <slug>`'s own verdicts, one per re-read failed run — shown as
	 * a small log under the runs table, not merged into anything (each is its own verdict, not a
	 * value that gets superseded). */
	review(data){ (this.reviews ??= []).push(data); }

	content(){
		div.c("page-ai-test", () => {
			p.c("muted").text([this.kind, this.rung != null && `rung ${this.rung}`].filter(Boolean).join(" · "));

			// The result first: which models passed. The prompt and criteria explain it below.
			h2(`Runs · ${this.runs.size}`);
			this.meta_line();
			this.runs.size ? this.runs_table() : p.c("muted").text("No runs yet.");

			h2("Prompt");
			div.c("page-ai-test-prompt card pad", $box => {
				Page.file(this.url + (this.prompt || "prompt.md")).then(file => {
					$box.empty(() => { file ? $box.append(file.content()) : p.c("muted").text("No prompt.md found."); });
				});
			});

			if (this.criteria?.length){
				h2("What a good run does");
				// p() so a criterion's `code` renders as code (li() shows backticks literally)
				ul(() => { this.criteria.forEach(c => { li(() => { p(c); }); }); });
			}

			if (this.expected) { h2("Expected outcome"); p(this.expected); }
			if (this.judge) { h2("What the judge looks for"); p.c("muted").text(this.judge); }

			if (this.reviews?.length) this.reviews_list();
		});
	}

	/* Pass rate, discrimination, confidence, weight — one line, above the runs table (Amendment 6
	 * item 4). The pass-rate label ("floor" near 100%, "review the test" near 0%) is the one-word
	 * flag a reader needs before any number: a test that fails everyone usually means the TEST is
	 * wrong, not every model. */
	meta_line(){
		// Quality numbers only once they mean something: before 4 models have run a test,
		// discrimination (and so differentiation and the weight) can't be measured — say that in
		// words, not zeros. Phase 16: differentiation is the spread of scores across models, once
		// discrimination says that spread points the right way (strong models actually scoring
		// higher) — it's shown as its own word because it's "the strongest reason to run this test
		// on more models", a different message than discrimination's "is this test trustworthy".
		const m = this.test_meta ?? {};
		const parts = [
			m.pass_rate != null && `pass rate ${(m.pass_rate * 100).toFixed(0)}%${m.pass_rate_label ? ` (${m.pass_rate_label})` : ""}`,
			m.discrimination != null
				? `separates strong from weak models: ${m.discrimination.toFixed(2)} · spreads models out (differentiation): ${m.differentiation != null ? m.differentiation.toFixed(2) : "n/a"} · confidence ${(this.confidence ?? 0).toFixed(2)} · weight ${m.weight ?? 0}`
				: "how well this test separates strong models from weak ones, and how much it would gain from more models trying it, is measured once 4 models have run it",
		].filter(Boolean);
		p.c("page-ai-test-meta muted").text(parts.join(" · "));
	}

	/* A run's `note` can be a full sentence, and a `<td>` holding one used to blow the table wide
	 * (cut off at the right edge of the page) and tall (one line per row became three).
	 * Drop it out of the column grid entirely — a short second `<tr>` under the real
	 * row, spanning every column, title-cased like a caption rather than squeezed into a cell. The
	 * table itself still scrolls sideways in its own box (`.card` here; framework.css's own `table`
	 * rule already does `overflow-x: auto` — this box just makes that edge visible as a border
	 * instead of the table silently running off the page). */
	runs_table(){
		const rows = [...this.runs.values()].sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));
		const any = k => rows.some(r => r[k] != null && r[k] !== "");
		// Short cells so the table fits the reading column: no provider prefix or date suffix on a
		// model, month-day and time only, seconds not ms; credit replaces the score word once a run
		// has one, and a column every row leaves empty is not drawn.
		const model = m => (m ?? "").replace(/^[a-z-]+\//, "").replace(/^claude-/, "").replace(/-\d{8}$/, "");
		const cols = [
			["when", r => small(r.at ? r.at.slice(5, 16).replace("T", " ") : "")],
			["model", r => model(r.model)],
			["effort", r => r.effort ?? ""],
			["pass", r => r.pass === 1 || r.pass === true ? "PASS" : r.pass === 0 || r.pass === false ? "FAIL" : ""],
			any("credit") ? ["credit", r => r.credit != null ? r.credit.toFixed(2) : ""] : ["score", r => r.score ?? ""],
			any("reasoning") && ["reasoning", r => r.reasoning ?? ""],
			["$", r => r.cost_usd != null ? Number(r.cost_usd).toFixed(3) : ""],
			["sec", r => r.ms != null ? (r.ms / 1000).toFixed(0) : ""],
		].filter(Boolean);
		div.c("page-ai-test-runs-wrap card", () => {
			table.c("page-ai-test-runs", () => {
				thead(() => { tr(() => { cols.forEach(([h]) => { th(h); }); }); });
				tbody(() => {
					rows.forEach(r => {
						tr(() => { cols.forEach(([, cell]) => { td(cell(r)); }); });
						if (r.note) tr(() => { td.c("page-ai-test-run-note", () => {
							small.c("muted").text(r.note);
						}).attr("colspan", String(cols.length)); });
					});
				});
			});
		});
	}

	/* Amendment 6 item 3's near-miss verdicts: what --review found, in plain sentences. */
	reviews_list(){
		h2("Near-miss review");
		ul(() => { this.reviews.forEach(r => {
			li(`${r.run ?? "a run"}: ${r.mostly_right ? "mostly right" : "a real miss"}${r.which_criterion ? ` — tripped up by "${r.which_criterion}"` : ""}${r.note ? " — " + r.note : ""}`);
		}); });
	}
}

export { AITest };
