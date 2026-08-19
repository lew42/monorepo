import { Page } from "../../core/Page/Page.class.js";
import { View, div, p, span, a, img, details, summary, icon } from "../../core/View/View.js";
import { JSONL } from "../JSONL/JSONL.js";
import { KINDS, score as rank } from "./verbs.js";

View.stylesheet(import.meta, "Research.css");

/* The kinds and the scoring come from `verbs.js` — the same file the writers
   validate against, so "what is top" cannot mean two things. What a kind LOOKS
   like is this side's business, and only this side's. */
const KIND_ICON = {
	question: "help", claim: "lightbulb", evidence: "fact_check", support: "thumb_up",
	dissent: "thumb_down", alternative: "alt_route", note: "sticky_note_2",
};

const STATE = { accepted: "✓", rejected: "✗", parked: "⏸", merged: "→" };

/**
 * A research topic as an append-only log — the minions write it while they dig.
 *
 *   {"assign":  {"title", "question", "config": {"minions", "minutes"}, "status", "summary": […]}}
 *   {"node":    {"id", "parent?", "kind", "text", "by", "at", "why?", "refs?", "icon?", "img?", "importance?"}}
 *   {"vote":    {"node", "by", "importance": 1–5}}
 *   {"verdict": {"node", "state", "why", "into?"}}
 *   {"agent":   {"name", "persona", "model", "doing", "done?"}}
 *
 * `summary` is the conclusions — the top of the report. Nodes form a tree by
 * `parent`; a node with none is a root. Schema and writers: doc/verbs.md.
 */
export class ResearchJSONL extends JSONL {
	static verbs = [...JSONL.verbs, "node", "vote", "verdict", "agent"];

	summary = [];
	nodes = new Map();       // id → node
	kids = new Map();        // parent id ("" = root) → [id]
	votes = new Map();       // id → [importance]
	verdicts = new Map();    // id → the latest verdict; latest wins
	agents = new Map();      // name → agent, merged

	// A second line for the same id EDITS it — the tree is built once, on first sight.
	node(value){
		const known = this.nodes.get(value.id);
		if (known) return void Object.assign(known, value);

		this.nodes.set(value.id, value);
		const parent = value.parent ?? "";
		this.kids.set(parent, [...(this.kids.get(parent) ?? []), value.id]);
	}

	vote(value){ this.votes.set(value.node, [...(this.votes.get(value.node) ?? []), value]); }
	verdict(value){ this.verdicts.set(value.node, value); }
	agent(value){ this.agents.set(value.name, Object.assign(this.agents.get(value.name) ?? {}, value)); }

	// ⚠ Every verb's own store, or a rewritten file replays on top of the old one.
	reset(){
		this.summary = [];
		this.nodes = new Map();
		this.kids = new Map();
		this.votes = new Map();
		this.verdicts = new Map();
		this.agents = new Map();
		return super.reset();
	}

	/** The ids under `id` — with no argument, the roots. */
	children(id = ""){ return this.kids.get(id) ?? []; }

	/** The same, best first. */
	ranked(id){ return this.children(id).slice().sort((a, b) => this.score(b) - this.score(a)); }

	/** mean(the author's own importance, every vote) — verbs.js owns the sum. */
	score(id){ return rank(this.nodes.get(id) ?? {}, this.votes.get(id) ?? []); }

	state(id){ return this.verdicts.get(id)?.state; }
}

/**
 * The report: the minions at the top, then the conclusions, then every claim as a
 * card you can open forever. Live — `live()` streams the file over the dev socket,
 * so a node a minion appends appears without a reload.
 *
 * Every step is a method, so a topic with its own `page.js` overrides one and
 * inherits the rest. Layout and the open-set: doc/render.md.
 */
export class Research extends Page {

	/** The log I render — `src` points at one that isn't beside my own url. */
	file(){ return this.src ?? this.url + "research.jsonl"; }

	// ⚠ No DOM after the await: `draw()` builds inside `empty()`, which re-establishes
	// the captor the first await dropped.
	content(){
		div.c("research flow wide", async $r => {
			this.$live = $r;
			this.open ??= new Set();

			const r = new ResearchJSONL({ url: this.file() });
			await r.live(() => this.draw(r));
			this.draw(r);
		});
	}

	/* Redrawn whole on every streamed batch — `changed` fires outside any captor.
	   Which cards are open is the one piece of state a redraw would wipe, so it
	   lives in `this.open`, by node id. */
	draw(r){
		this.$live.empty(() => {
			if (!r.loaded) return p.c("muted", "No `research.jsonl` beside this page yet.");

			this.retitle(r);
			this.head(r);
			this.conclusions(r);
			this.claims(r);
			this.process(r);
		});
	}

	/** The log names the topic; the url only slugs it. */
	retitle(r){ if (r.title) this.view?.el.querySelector(".page-title")?.replaceChildren(r.title); }

	head(r){
		div.c("research-head flow", () => {
			if (r.question) p.c("research-question", r.question);

			div.c("research-meta flex gap wrap v-center", () => {
				if (r.status) span.c("research-status").ac(r.status).text(r.status);
				if (r.config) span.c("muted").text(`${r.config.minions} minions · ${r.config.minutes} min`);
				span.c("muted").text(`${r.nodes.size} nodes`);
			});

			this.minions(r);
		});
	}

	/** One chip per minion — what it is doing right now, dimmed with what it did. */
	minions(r){
		const list = [...r.agents.values()];

		div.c("research-minions flex gap wrap v-center", () => {
			span.c("research-running").text(list.filter(a => !a.done).length + " running");

			if (!list.length) return span.c("muted").text("no minions yet");

			list.forEach(agent => div.c("research-minion flex gap v-center").ac(agent.done && "done")
				.attr("title", [agent.persona, agent.model].filter(Boolean).join(" · "))
				.append(() => {
					span.c("research-minion-name").text(agent.name);
					span.c("research-minion-doing muted").text(agent.done ?? agent.doing ?? "");
				}));
		});
	}

	/** The answer, first and biggest. */
	conclusions(r){
		div.c("research-summary flow", () => {
			const lines = Array.isArray(r.summary) ? r.summary : [];
			if (!lines.length) return p.c("research-digging muted", "digging…");

			lines.forEach(line => p.c("research-conclusion", line));
		});
	}

	claims(r){
		const roots = r.ranked();
		if (!roots.length) return;

		div.c("research-claims flex v gap", () => roots.forEach(id => this.node(r, id)));
	}

	/* One node — the same shape at every depth, so drilling down is free. Native
	   <details>: the browser owns the disclosure, and there is no depth limit to
	   run out of. A node with nothing under it is a plain row, not a dead arrow.
	   ⚠ No per-depth class: nesting is styled by `.research-node .research-node`,
	   which is one step at ANY depth. A compounding `0.9em` per level is how a
	   drill-down five deep ends up unreadable. */
	node(r, id){
		const n = r.nodes.get(id);
		const kids = r.ranked(id);
		const body = kids.length || n.why || n.refs?.length || n.img;

		return (body ? details : div).c("research-node").append($n => {
			(body ? summary : div).c("research-row flex gap wrap", () => this.row(r, n, id, kids));

			if (!body) return;

			div.c("research-body flow", () => {
				if (n.why) p.c("research-why muted", n.why);
				this.refs(n);
				if (n.img) img.c("research-img").attr("src", n.img).attr("alt", n.text ?? "");
				kids.forEach(kid => this.node(r, kid));
			});

			this.remember($n, id);
		});
	}

	/** The scannable line: a big glyph, the claim, its score. */
	row(r, n, id, kids){
		this.glyph(n);

		div.c("research-main flow", () => {
			p.c("research-text", n.text ?? "");

			div.c("research-tags flex gap wrap v-center", () => {
				span.c("research-kind").text(n.kind ?? "note");
				this.badge(r.state(id));
				this.counts(r, kids);
			});
		});

		this.dots(r.score(id));
	}

	/* The scanning device: one big glyph per card, so a wall of claims reads as
	   shapes before it reads as sentences.
	   ⚠ The site loads Material ICONS, not Symbols — a Symbols-only name
	   (`mode_fan`, in the very first seed file) renders as its literal WORD, many
	   em wide, and nothing throws. A glyph is about as wide as it is tall; a miss
	   falls back to the kind's own. Measured once, after the font is in. */
	glyph(n){
		const $i = icon(n.icon || KIND_ICON[n.kind] || "lens").ac("research-icon");

		document.fonts.ready.then(() => {
			const box = $i.el.getBoundingClientRect();
			if (box.width > box.height * 1.5) $i.el.textContent = KIND_ICON[n.kind] ?? "lens";
		});

		return $i;
	}

	/** Score as five dots — mean of the author's own importance and every vote. */
	dots(score){
		const filled = Math.round(score);
		if (!filled) return;

		div.c("research-dots flex").attr("title", `importance ${score.toFixed(1)} of 5`).append(() => {
			for (let i = 1; i <= 5; i++) span.c("research-dot").ac(i <= filled && "on");
		});
	}

	badge(state){
		if (!state) return;
		span.c("research-badge").ac(state).text(`${STATE[state] ?? ""} ${state}`.trim());
	}

	/** What is under this node, by kind: `2 support · 1 dissent · 3 evidence`. */
	counts(r, kids){
		const tally = new Map();
		kids.forEach(id => {
			const kind = r.nodes.get(id).kind;
			tally.set(kind, (tally.get(kind) ?? 0) + 1);
		});
		if (!tally.size) return;

		span.c("research-counts muted").text([...tally]
			.sort((a, b) => KINDS.indexOf(a[0]) - KINDS.indexOf(b[0]))
			.map(([kind, n]) => `${n} ${kind}`).join(" · "));
	}

	/** `file:line` reads as code; a url is a link. */
	refs(n){
		if (!n.refs?.length) return;

		div.c("research-refs flex gap wrap", () => n.refs.forEach(ref =>
			/^https?:\/\//.test(ref)
				? a.c("research-ref").href(ref).text(ref)
				: span.c("research-ref").text(ref)));
	}

	/* How it got here — closed, at the foot. The receipt, not the answer. */
	process(r){
		if (!r.logs.length) return;

		details.c("research-process").append($p => {
			summary.c("research-process-head").text(`process — ${r.logs.length} lines`);
			div.c("research-log flow", () => r.logs.forEach(l =>
				p.c("research-log-line muted", `${(l.at ?? "").slice(11, 16)} ${l.msg}`)));

			this.remember($p, "process");
		});
	}

	/* ⚠ A running topic appends every few seconds, and a report that snapped shut on
	   every append would be unreadable. Open-ness is keyed by node id, so it survives
	   a redraw that rebuilds every element. */
	remember($d, id){
		$d.el.open = this.open.has(id);
		$d.on("toggle", () => this.open[$d.el.open ? "add" : "delete"](id));
	}
}

export default Research;
