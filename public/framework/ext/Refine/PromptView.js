import Prompt from "./Prompt.js";
import { View, div, span, p, h4, button, a } from "../../core/View/View.js";

View.stylesheet(import.meta, "Prompt.css");

/* Sets Prompt.View: the DOM half of Prompt, split out 2026-10-23 so Prompt.js (the data and its completion) loads in node, the Task/TaskView pattern. Import this file wherever a prompt is drawn. */
/** Prompt.View — raw, clean (with scores and yellow flags), refined cards. A sentence and a
 *  card's source chip are linked: click either and the other side lights up. */
Prompt.View = class extends View {

	/** Each stage names itself: a number, a plain title, what it is in one line, and the class that makes it. */
	static STAGES = {
		said:    { title: "1 · Said",    what: "Exactly what Whisper heard. Type here too.", by: "Dictate", href: "/framework/ux/Dictate/" },
		clean:   { title: "2 · Cleaned", what: "Your words, fixed: fillers out, sentences numbered. Nothing reworded.", by: "Cleaner", href: "/framework/ext/Refine/cleaner/" },
		refined: { title: "3 · Outline", what: "The same ideas as a short outline. Click an S1 chip to jump to its sentence.", by: "Structurer", href: "/framework/ext/Refine/structure.js" },
		scores:  { title: "4 · Scores",  what: "How clear each sentence is (1 = clear). ⚑ marks a sentence worth a second look.", by: "ClarityScorer", href: "/framework/ext/Refine/md/doc/prompt/" },
	};

	render(){
		const prompt = this.subject;
		this.ac("refine-prompt");

		const empty = !prompt.clean.length;
		const working = prompt.status === "working";
		const done = prompt.status === "done";
		const sentence_els = new Map();
		const light = n => {
			sentence_els.forEach(($s, k) => $s.el.classList.toggle("lit", k === n));
			sentence_els.get(n)?.el.scrollIntoView({ block: "nearest", behavior: "smooth" });
		};
		const secs = ms => (ms / 1000).toFixed(1) + " s";
		const section = (key, note, fn) => {
			const st = Prompt.View.STAGES[key];
			return div.c("refine-section", () => {
				h4.c("refine-prompt-h", () => { span(st.title); if (note) span.c("refine-s-scores", note); });
				if (!this.compact) p.c("refine-what", () => { span(st.what + " "); a(st.by).href(st.href).ac("refine-class-key"); });   // `compact`: the stage title is the only label
				fn();
			});
		};

		if (working) p.c("refine-working", `Refining with ${prompt.model || "a model"}… usually about 8 s and about 3 cents. The cleaned text is already usable.`);
		if (prompt.status === "error") p.c("refine-error", "Could not refine: " + prompt.error);
		if (this.show_raw !== false) section("said", "", () => prompt.raw ? p.c("refine-prompt-raw", prompt.raw) : p.c("refine-empty", "Nothing said yet."));

		section("clean", empty ? "" : prompt.quick || working ? `instant, ${prompt.timings.quick_ms ?? 0} ms, no model` : `by ${prompt.model || "a model"}, ${secs(prompt.stages.clean_ms ?? 0)}`, () => {
			if (empty) return p.c("refine-empty", "Waiting for words.");
			prompt.clean.forEach(s => {
				const $s = div.c("refine-sentence", () => {
					span.c("refine-s-num", "S" + s.n);
					span.c("refine-s-text", s.text);
					if (prompt.flagged.includes(s)){
						const q = s.flags.map(f => f.question).join(" ") || s.why || "This one may be unclear.";
						span.c("refine-flag", "⚑").attr("title", q);
					}
				});
				$s.click(() => light(s.n));
				sentence_els.set(s.n, $s);
			});
		});

		// LIVE, NOT JUST DONE (one-input, 2026-10-12): `RefineSystem.live()` writes `refined`
		// straight onto this same `Prompt` as the mic talks, before a real Refine ever runs —
		// the outline underneath updates live, CLAUDE.md law 2's "the outline refines live
		// underneath". `have` is true the instant there is anything to show, `done` only once
		// a full Refine has actually finished (its own timing label still waits for that).
		const have = done || prompt.refined.length > 0;
		section("refined", done ? secs(prompt.stages.structure_ms ?? 0) : have ? "live" : "", () => {
			if (!have) return p.c("refine-empty", working ? "Working… the model is writing the outline." : "Press Refine.");
			if (prompt.subject) p.c("refine-subject", prompt.subject);
			const cites = list => list.forEach(n => button.c("refine-cite", "S" + n).click(() => light(n)));
			const draw = cards => cards.forEach(c => div.c("refine-card", () => {
				span.c("refine-card-text", c.text);
				cites(c.cites);
				if (c.cards.length) div.c("refine-subcards", () => draw(c.cards));
			}));
			prompt.refined.forEach(sec => div.c("refine-card refine-card-top", () => {
				span.c("refine-card-text refine-card-title", sec.title);
				cites(sec.cites);
				div.c("refine-subcards", () => draw(sec.cards));
			}));
		});

		section("scores", done ? `${prompt.flagged.length} of ${prompt.clean.length} flagged` : "", () => {
			if (!done) return p.c("refine-empty", working ? "Scoring each sentence…" : "Press Refine.");
			prompt.clean.forEach(s => div.c("refine-score", () => {
				span.c("refine-s-num", "S" + s.n);
				span.c("refine-bar").attr("style", `--v:${s.clarity ?? 0}`);
				span.c("refine-s-text", Prompt.label(s));
				if (s.why) span.c("refine-s-scores", s.why);
				if (s.names.length) span.c("refine-s-scores", "name: " + s.names.join(", "));
				s.tags.forEach(t => span.c("refine-class-key", t));
				if (s.alternates.length) div.c("refine-s-scores", "or: " + s.alternates.join(" / "));
			}));
			if (prompt.session) p.c("refine-what", () => {
				span("Kept in the session log as raw, clean, outline and notes: ");
				a("open the session").href("/framework/ai/sessions/" + prompt.session + "/").ac("refine-class-key");
			});
			h4.c("refine-prompt-h", () => span("Model runs"));
			p.c("refine-what", "Each run is its own session: click one to see exactly what was asked.");
			prompt.runs.forEach(r => div.c("refine-run", () => {
				r.session_id ? a(r.stage).href(`/framework/ai/sessions/${r.session_id}/`) : span(r.stage);
				span.c("refine-s-scores", `${r.model} · ${secs(r.duration_ms)} · $${r.cost_usd}`);
			}));
		});
	}
};


export default Prompt.View;
