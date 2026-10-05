import { Page, p, div, h2, h3, span, a, textarea, select, option, button, label, table, thead, tbody, tr, th, td } from "/app.js";
import { servex_url } from "/framework/dev/servex_url.js";
import { word_overlap_score } from "../engine.js";

/* THE "TRY IT" TAB (public/framework/ai/2026-10-04/clean-test-page/requirements.md) —
 * the owner's own question: "which models are being used or considered for the clean
 * transcription step … can we test that somewhere". This page runs the SAME `clean()`
 * Echo runs (`ext/Refine/engine.js`, via Servex's own `/api/clean-test` —
 * `Servex/ext/clean-test/run.js`) against any model on the dropdown: every local gguf
 * file found on this machine, a few cheap OpenRouter models, and Haiku — so what you
 * see here is exactly what Echo would have produced, never a second clean prompt.
 *
 * Three things on this page:
 *   1. Paste some dictated text, pick one model, hit Clean — see the cleaned text, how
 *      long it took, and what it really cost (local models are always $0).
 *   2. Run all — the same text through every model, one at a time, one row each.
 *   3. A small test set the owner can grow: "Save as example" keeps {raw, good clean,
 *      notes} in `fixture/clean-examples.jsonl`; "Score all models" runs every saved
 *      example through every model and shows how close each one lands to the approved
 *      clean text (`word_overlap_score`, `engine.js` — plain word overlap, computed in
 *      code, never judged by a model) — the owner's own picks become the ongoing test.
 *
 * Run all / Score all run ONE MODEL AT A TIME (not `Promise.all`): the local proxy only
 * holds one gguf in GPU memory at once, so firing every local model together would just
 * make them queue behind each other anyway, and a sequential OpenRouter run is a real,
 * visible spend cap — the review that found the first draft's `Promise.all` flagged
 * exactly this (review/report.md finding 7, 2026-10-04).
 *
 * NOT built yet: "Load a real line from a recent voice session" (the owner's own
 * addition, mid-task). There is no reliable index of recent raw-dictation lines today —
 * Dictate.js's own `via: "voice"` tag marks the REVISED output, not the raw Whisper
 * text, and the old dated session pages are stale — so wiring this well is its own
 * small task, not a few lines here. Paste is the stand-in until then. */
const ENDPOINT = "/api/clean-test";
const EXAMPLES_ENDPOINT = "/api/clean-test/examples";

const fmt_usd = n => (!n ? "$0" : n < 0.01 ? "<$0.01" : `$${n.toFixed(2)}`);
const fmt_s = ms => `${(ms / 1000).toFixed(1)}s`;

export default new Page({
	meta: import.meta,
	title: "Try it",
	description: "Run the real clean() step against any model — local, cheap OpenRouter, or Haiku — and compare.",
	icon: "science",

	content(){
		p("This runs the exact clean-up step Echo runs on everything you dictate — same prompt, same rules (fix typos, capitalization, punctuation, drop filler words; never rephrase). Paste some rough text, pick a model, and see what it does.");
		p.c("muted").text("Paste only for now — the Dictate mic needs its own one-line mount here, not done yet.");

		let models = [], picked = null, fetchFailed = false, examples = [];
		let $picker, $single, $all, $examplesBox, $scoreBox, $status;

		const get_text = () => document.querySelector("#clean-try-input")?.value ?? "";
		const say = text => { $status.empty(() => { if (text){ $status.ac("pad"); p.c("muted").text(text); } else $status.rc("pad"); }); };

		async function run_one(model, text){
			return fetch(servex_url(ENDPOINT), {
				method: "POST", headers: { "content-type": "application/json" },
				body: JSON.stringify({ text, model }),
			}).then(r => r.json());
		}

		function result_card($box, model, r){
			$box.empty(() => {
				if (!r.ok){ p.c("muted").text(`${model} could not answer: ${r.why}`); return; }
				p().text(r.text || "(empty)");
				span.c("muted").text(`${model} · ${fmt_s(r.ms)} · ${fmt_usd(r.cost_usd)}${r.flags?.length ? ` · ${r.flags.length} flag${r.flags.length === 1 ? "" : "s"}` : ""}`);
			});
		}

		const draw_picker = () => {
			$picker.empty(() => {
				if (fetchFailed){ p.c("muted").text("Couldn't reach Servex to list models — it may not be running this change yet."); return; }
				if (!models.length){ p.c("muted").text("No model is available right now."); return; }
				picked = models.includes(picked) ? picked : models[0];
				select(() => models.forEach(m => option(m).attr("value", m))).attr("value", picked).on("change", e => { picked = e.target.value; });
			});
		};

		div.c("card", () => {
			h2("Clean something");
			textarea().attr("id", "clean-try-input").attr("rows", "6").attr("placeholder", "Paste some rough, dictated text here…").style("width", "100%");

			div.c("flex wrap gap", () => {
				$picker = span();
				draw_picker();

				button("Clean").on("click", async () => {
					const text = get_text().trim();
					if (!text || !picked) return;
					result_card($single, picked, { ok: true, text: "Thinking…" });
					$single.el.querySelector("p")?.classList.add("muted");
					result_card($single, picked, await run_one(picked, text));
				});

				button("Run all").on("click", async () => {
					const text = get_text().trim();
					if (!text || !models.length) return;
					say(`Running ${models.length} models, one at a time…`);
					const rows = [];
					for (const m of models) rows.push({ model: m, r: await run_one(m, text) });
					say("");
					render_all(rows);
				});
			});
		});

		$status = div();
		$single = div();
		$all = div().ac("wide");

		function render_all(rows){
			$all.empty(() => {
				table.c("table-equal", () => {
					thead(() => tr(() => { th().text("Model"); th().text("Cleaned text"); th().text("Time"); th().text("Cost"); }));
					tbody(() => rows.forEach(({ model, r }) => tr(() => {
						td().text(model);
						td().text(r.ok ? (r.text || "(empty)") : `error: ${r.why}`);
						td().text(r.ok ? fmt_s(r.ms) : "—");
						td().text(r.ok ? fmt_usd(r.cost_usd) : "—");
					})));
				});
			});
		}

		// ---- the growing test set: save an example, score every model against it --
		div.c("card", () => {
			h2("Build a test set");
			p("Happy with (or unhappy with) a result above? Save it — the raw text plus the clean text you'd actually want — and it joins a small set every model can be scored against.");

			let goodText = "", notes = "";
			div(() => {
				label("Good clean text — what the clean step SHOULD have said:");
				textarea().attr("rows", "3").style("width", "100%").on("input", e => { goodText = e.target.value; });
			});
			div(() => {
				label("Notes (optional):");
				textarea().attr("rows", "1").style("width", "100%").on("input", e => { notes = e.target.value; });
			});

			div.c("flex wrap gap", () => {
				button("Save as good example").on("click", () => save_example("good", goodText, notes));
				button("Save as a “don't” example").on("click", () => save_example("dont", goodText, notes));
				button("Score all models").on("click", score_all);
			});
		});

		$examplesBox = div().ac("wide");
		$scoreBox = div().ac("wide");

		async function save_example(verdict, good, notes){
			const raw = get_text().trim();
			if (!raw || !good.trim()){ say("Need both the raw text above and a good clean text."); return; }
			const r = await fetch(servex_url(EXAMPLES_ENDPOINT), {
				method: "POST", headers: { "content-type": "application/json" },
				body: JSON.stringify({ raw, good, notes, verdict }),
			}).then(r => r.json());
			if (r.ok){ examples = r.examples; say(""); draw_examples(); }
			else say(r.why);
		}

		function draw_examples(){
			$examplesBox.empty(() => {
				if (!examples.length){ p.c("muted").text("No saved examples yet."); return; }
				h3(`${examples.length} saved example${examples.length === 1 ? "" : "s"}`);
				table.c("table-equal", () => {
					thead(() => tr(() => { th().text("Verdict"); th().text("Raw"); th().text("Good clean"); th().text("Notes"); }));
					tbody(() => examples.forEach(ex => tr(() => {
						td().text(ex.verdict);
						td().text(ex.raw);
						td().text(ex.good);
						td().text(ex.notes || "");
					})));
				});
			});
		}

		async function score_all(){
			if (!examples.length){ say("Save at least one example first."); return; }
			const goodOnly = examples.filter(ex => ex.verdict === "good");
			if (!goodOnly.length){ say("No “good” examples to score against yet."); return; }

			const total = models.length * goodOnly.length;
			say(`Scoring ${models.length} models against ${goodOnly.length} example${goodOnly.length === 1 ? "" : "s"} — ${total} call${total === 1 ? "" : "s"}, one at a time…`);

			const totals = new Map(models.map(m => [m, []]));
			for (const ex of goodOnly){
				for (const m of models){
					const r = await run_one(m, ex.raw);
					if (r.ok) totals.get(m)?.push(word_overlap_score(r.text, ex.good));
				}
			}
			say("");

			$scoreBox.empty(() => {
				h3(`Score — ${goodOnly.length} example${goodOnly.length === 1 ? "" : "s"}, word-overlap vs. the saved good clean`);
				table.c("table-equal", () => {
					thead(() => tr(() => { th().text("Model"); th().text("Average score"); }));
					tbody(() => [...totals].forEach(([model, scores]) => tr(() => {
						td().text(model);
						td().text(scores.length ? `${Math.round(100 * scores.reduce((a, b) => a + b, 0) / scores.length)}%` : "no answer");
					})));
				});
			});
		}

		fetch(servex_url(ENDPOINT)).then(r => r.json()).then(body => { models = body.models ?? []; draw_picker(); })
			.catch(() => { fetchFailed = true; draw_picker(); });
		fetch(servex_url(EXAMPLES_ENDPOINT)).then(r => r.json()).then(body => { examples = body.examples ?? []; draw_examples(); })
			.catch(() => {});

		p(() => { span("A fuller inventory of local models and what's installed: "); a("Local Models").href("/framework/ai/local/"); span("."); });
	},
});
