import { View, div, p, span, img, button, a } from "../../core/View/View.js";
import { JSONL } from "../JSONL/JSONL.js";
import FsFile from "../filesystem/FsFile.js";

View.stylesheet(import.meta, "ShotsView.css");

/**
 * The one log this module reads — `public/framework/ext/Shots/runs.jsonl`.
 * Three verbs, schema in plan.md:
 *
 *   {"run":   {"id","url","dir","widths","parent","note","css","task","by","at","shots"}}
 *   {"diff":  {"id","vs","width","changed","regions","overlay","height"}}
 *   {"judge": {"id","vs","verdict","by","why","at"}}
 *
 * `run` and `diff` are both keyed by the NEW round's id, so a round's own
 * diffs are "every diff whose id is this round". `judge` can repeat (the
 * owner clicking twice) — every press stays, newest read last.
 */
export class ShotsJSONL extends JSONL {
	static verbs = [...JSONL.verbs, "run", "diff", "judge"];

	runs = new Map();     // id → run
	diffs = new Map();    // id → [diff, …] (one per width)
	judges = new Map();   // id → [judge, …]

	run(value){ this.runs.set(value.id, value); }
	diff(value){ this.diffs.set(value.id, [...(this.diffs.get(value.id) ?? []), value]); }
	judge(value){ this.judges.set(value.id, [...(this.judges.get(value.id) ?? []), value]); }

	reset(){
		this.runs = new Map();
		this.diffs = new Map();
		this.judges = new Map();
		return super.reset();
	}

	/** Every run for one page url, newest first. */
	runs_for(url){
		return [...this.runs.values()].filter(r => r.url === url).sort((a, b) => b.id.localeCompare(a.id));
	}

	/** The roots of the tree (no parent, or a parent not in this set) for one url. */
	roots_for(url){
		const ids = new Set(this.runs_for(url).map(r => r.id));
		return this.runs_for(url).filter(r => !r.parent || !ids.has(r.parent));
	}

	/** Direct children of one round, newest first. */
	children_of(id){
		return [...this.runs.values()].filter(r => r.parent === id).sort((a, b) => b.id.localeCompare(a.id));
	}

	/** The one diff line for a round at a given width, or null. */
	diff_at(id, width){
		return (this.diffs.get(id) ?? []).find(d => String(d.width) === String(width)) ?? null;
	}

	/** Every page url that has at least one run. */
	urls(){
		return [...new Set([...this.runs.values()].map(r => r.url))];
	}
}

/* An image's real url from the log's own `dir` + `file` — plan.md's rule. */
function shot_url(dir, file){
	return "/" + dir.replace(/^public\//, "") + "/" + file;
}

/**
 * One page's shots as a tree: round → width thumbnails (the top of each
 * picture only — a 4,000px shot would flood the rail) → click a round to see
 * before / after / overlay for one width, the diff's changed % and every
 * judge line, and the owner's Better / Not better buttons.
 *
 * Reads `runs.jsonl` live (`ShotsJSONL.live()` streams it over the dev
 * socket) — a new round from `node Server/shots.mjs` appears with no reload.
 */
export class ShotsView extends View {

	/** `{ url, round?, width? }` — the page url to show, and an optional
	    round/width the caller already knows (from `?round=&width=` on the
	    module page). */
	render(){
		if (this.round) this.selected = { id: this.round, width: this.width };

		// ⚠ No DOM after the await: `draw()` builds inside `empty()`, which
		// re-establishes the captor the first await dropped (Research.js's own rule).
		div.c("shots-view flow", async $v => {
			this.$root = $v;
			this.log = new ShotsJSONL({ url: this.log_url ?? "/framework/ext/Shots/runs.jsonl" });
			await this.log.live(() => this.draw());
			this.draw();
		});
	}

	/* ≥1200px: the round tree sits in a column on the left, the selected round's
	   detail (before/after/overlay) on the right where it's never below the
	   fold; narrower, they stack — one CSS rule (`.shots-layout`), no JS
	   breakpoint (first live look, build-c). */
	draw(){
		this.$root.empty(() => {
			const roots = this.log.roots_for(this.url);

			if (!this.log.loaded || !roots.length){
				p.c("muted shots-empty", `No shots of this page yet: \`node Server/shots.mjs ${this.url}\``);
				return;
			}

			div.c("shots-layout flex gap", () => {
				div.c("shots-tree-col", () =>
					div.c("shots-tree flow", () => roots.forEach(run => this.branch(run, 0))));

				const selectedRun = this.selected && this.log.runs.get(this.selected.id);
				if (selectedRun) div.c("shots-detail-col", () => this.detail(selectedRun));
			});
		});
	}

	/* One round, newest-first children nested under it — a row of width
	   thumbnails, then its own children one indent in. Detail for the selected
	   round renders in the separate column (draw()), not inline here. */
	// ⚠ Not named `round` — a `{round}` constructor option (the query-param
	// name the brief asks for) would overwrite a method of that name on this
	// instance (JSONL.js's own trap: a field never replaces a method).
	branch(run, depth){
		const selected = this.selected?.id === run.id;

		div.c("shots-round" + (depth ? " shots-nested" : "")).style("--shots-depth", depth).append(() => {
			a.c("shots-round-head flex gap v-center" + (selected ? " selected" : ""))
				.click(e => { e.preventDefault(); this.select(run); })
				.href("#" + run.id)
				.append(() => {
					span.c("shots-round-id", run.id);
					if (run.note) span.c("shots-round-note muted", run.note);
					this.judge_badge(run.id);
				});

			div.c("shots-thumbs flex wrap gap", () =>
				(run.widths ?? []).forEach(w => this.thumb(run, w)));

			this.children_of(run).forEach(child => this.branch(child, depth + 1));
		});
	}

	children_of(run){ return this.log.children_of(run.id); }

	/* The newest judge line for a round, as a small ✓/✗ badge — plain text,
	   no icon-per-line (CLAUDE.md: icons are status only, next to the words). */
	judge_badge(id){
		const judges = this.log.judges.get(id);
		if (!judges?.length) return;
		const last = judges.at(-1);
		span.c("shots-judge-badge").ac(last.verdict).text(
			last.verdict === "better" ? "✅ better" : last.verdict === "worse" ? "⚠️ worse" : "same");
	}

	/* One width's thumbnail — top-cropped (CSS, not JS) so a tall page reads
	   as one row, not a flood. */
	thumb(run, w){
		const shot = run.shots?.[w];
		if (!shot) return;

		button.c("shots-thumb").click(() => this.select(run, w)).append(() => {
			this.pic("shots-thumb-img", shot_url(run.dir, shot.file), `${run.url} at ${w}px`);
			span.c("shots-thumb-w muted", w + "px");
			if (shot.cut) span.c("shots-thumb-cut muted", "cut");
		});
	}

	/* An <img> that, on a 404 (pictures are gitignored — another machine has
	   the log but not the png, plan.md "Where the files go"), swaps itself for
	   a small "picture not on this machine" box instead of a broken image or a
	   console 404 storm. One `error` listener per picture, never a fetch probe
	   per round (first live look, build-c). */
	pic(cls, url, alt){
		div.c("shots-pic-wrap", $w => {
			img.c(cls).attr("src", url).attr("alt", alt).on("error", () => {
				$w.empty(() => div.c(cls + " shots-missing muted", "picture not on this machine"));
			});
		});
	}

	select(run, width){
		this.selected = { id: run.id, width: width ?? this.selected?.width ?? run.widths?.[0] };
		this.draw();
	}

	/* Before / after / overlay for the selected width, side by side when the
	   viewport is wide, stacked when narrow — one flex-wrap rule in the CSS,
	   never a JS breakpoint. Then the diff number and every judge line. */
	detail(run){
		const width = this.selected.width ?? run.widths?.[0];
		const parent = run.parent ? this.log.runs.get(run.parent) : null;
		const diff = this.log.diff_at(run.id, width);
		// A figma-kind round has no earlier `run` line to be its `parent` — its own BEFORE is
		// the Figma picture, copied into its own round folder as `figma.png` (Shots.figma).
		const figmaBefore = run.kind === "figma" && run.figma ? shot_url(run.dir, run.figma.file) : null;

		div.c("shots-detail flow").append(() => {
			if ((run.widths ?? []).length > 1) this.width_picker(run, width);

			div.c("shots-compare flex wrap gap", () => {
				if (figmaBefore) this.pane("figma", figmaBefore);
				else if (parent?.shots?.[width]) this.pane("before", shot_url(parent.dir, parent.shots[width].file));
				if (run.shots?.[width]) this.pane("after", shot_url(run.dir, run.shots[width].file));
				if (diff?.overlay) this.pane("overlay", shot_url(run.dir, diff.overlay));
			});

			if (diff) this.diff_line(diff);

			this.judges(run.id);
			this.verdict_buttons(run.id, parent?.id);
		});
	}

	width_picker(run, active){
		div.c("shots-width-picker flex gap", () =>
			(run.widths ?? []).forEach(w =>
				button.c("shots-width-btn" + (String(w) === String(active) ? " selected" : ""), w + "px")
					.click(() => this.select(run, w))));
	}

	pane(label, url){
		div.c("shots-pane flow").append(() => {
			span.c("shots-pane-label muted", label);
			this.pic("shots-pane-img", url, label);
		});
	}

	/* The diff's own numbers: % changed, then moved regions beside the changed
	   ones (build-c — the diff already finds them, Diff.compare's `moved`;
	   this just shows what was there) and a height change, when there is one. */
	diff_line(diff){
		div.c("shots-diff-line flex gap v-center wrap", () => {
			span.c("shots-diff-pct", Math.round((diff.changed ?? 0) * 100) + "% changed");
			if (diff.moved?.length){
				const total = diff.moved.length + (diff.movedMore || 0);
				const [, , w, h, dx, dy] = diff.moved[0];
				const signed = n => (n >= 0 ? "+" : "") + n;
				span.c("shots-diff-moved muted", `moved ${total} (largest ${w}×${h} by ${signed(dx)},${signed(dy)})`);
			}
			if (diff.height && diff.height[0] !== diff.height[1])
				span.c("muted", `height ${diff.height[0]} → ${diff.height[1]}`);
		});
	}

	judges(id){
		const list = this.log.judges.get(id);
		if (!list?.length) return;

		div.c("shots-judges flow", () => list.forEach(j =>
			p.c("shots-judge-line muted", `${j.verdict} — ${j.why ?? ""} (${j.by ?? "?"})`)));
	}

	/* The owner's last word: Better / Not better, written straight to the
	   real log over the dev socket. `vs` is the round compared against, so a
	   judge line always says what it was measured against. */
	verdict_buttons(id, vs){
		div.c("shots-verdict-btns flex gap", () => {
			button.c("shots-btn-better", "Better").click(() => this.judge(id, vs, "better"));
			button.c("shots-btn-worse", "Not better").click(() => this.judge(id, vs, "worse"));
		});
	}

	judge(id, vs, verdict){
		const line = { judge: { id, vs, verdict, by: "owner", at: new Date().toISOString() } };
		new FsFile({ path: "framework/ext/Shots/runs.jsonl" }).append(line);
	}
}

export default ShotsView;
