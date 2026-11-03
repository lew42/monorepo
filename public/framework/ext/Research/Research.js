import { Page } from "../../core/Page/Page.class.js";
import { View, div, p, span, a, img, details, summary, icon, ul, li } from "../../core/View/View.js";
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
			// A grid item routes to `#<id>` (Router.js leaves same-page hash links
			// alone) — a click, a reload or Back all just change the hash, so one
			// listener redraws the detail region for every one of them.
			window.addEventListener("hashchange", () => this.draw(r));
			await r.live(() => this.draw(r));
			this.draw(r);
		});
	}

	/* Redrawn whole on every streamed batch — `changed` fires outside any captor.
	   Which cards are open is the one piece of state a redraw would wipe, so it
	   lives in `this.open`, by node id. Order is the reading order: the shape of
	   the dig first, then where it stands, then the one sub-area someone clicked
	   into, then who is digging, then the receipt. */
	draw(r){
		this.$live.empty(() => {
			if (!r.loaded) return p.c("muted", "No `research.jsonl` beside this page yet.");

			this.retitle(r);
			this.head(r);
			this.tree(r);
			this.verdicts(r);
			this.detail(r);
			this.minions(r);
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
		});
	}

	/** The shape of the dig, before any sentence: one icon item per root — a
	    "?"/":"-headed question for a topic that has sub-areas, a claim itself
	    when it doesn't (LiveReload: its roots ARE the claims) — each carrying
	    how much hangs off it and how that share of the topic was judged. A grid,
	    not a list, ranked best first and capped at 9 so a claims-only topic with
	    no natural grouping still reads as a wall of shapes, not of sentences. */
	tree(r){
		const roots = r.ranked().slice(0, 9);
		if (!roots.length) return;

		div.c("research-tree flex wrap gap", () => roots.forEach(id => this.branch(r, id)));
	}

	/** One grid item — routes to `#<id>`, which `detail()` reads back. */
	branch(r, id){
		const n = r.nodes.get(id);
		const ids = this.descendants(r, id);

		a.c("research-branch flex v gap").href("#" + id).append(() => {
			this.glyph(n);
			span.c("research-branch-name").text(this.shorten(n.text ?? ""));
			span.c("research-branch-count muted").text(`${ids.length} claim${ids.length === 1 ? "" : "s"}`);
			this.tally_line(this.tally(r, new Set(ids)));
		});
	}

	/** Every id under `id`, any depth — never `id` itself. */
	descendants(r, id){
		return r.children(id).flatMap(kid => [kid, ...this.descendants(r, kid)]);
	}

	/** accepted/rejected/parked, over every verdict in the topic — or, with
	    `within` (a Set of ids), just one root's own share of them. */
	tally(r, within){
		const counts = { accepted: 0, rejected: 0, parked: 0 };
		for (const [id, v] of r.verdicts){
			if (within && !within.has(id)) continue;
			if (counts[v.state] != null) counts[v.state]++;
		}
		return counts;
	}

	/** `✓ 3 · ✗ 1` — nothing printed for a zero, nothing printed at all with none. */
	tally_line(counts){
		const parts = Object.entries(counts).filter(([, n]) => n).map(([state, n]) => `${STATE[state]} ${n}`);
		if (parts.length) span.c("research-tally-line muted").text(parts.join(" · "));
	}

	/** A root's own name: its text up to the first `?` or `:` — a question
	    reads as one. Neither exists on a bare claim root, so it falls back to
	    its first few words instead of running the whole sentence into a card. */
	shorten(text){
		const cut = text.search(/[?:]/);
		const candidate = cut > 0 ? text.slice(0, cut).trim() : text;

		// A `?`/`:` late in a LONG sentence (a claim's own trailing question
		// mark, say) is not "the name" — cap by words either way, so the card
		// never runs the whole sentence into its title.
		const words = candidate.split(" ");
		return words.length <= 8 ? candidate : words.slice(0, 8).join(" ") + "…";
	}

	/** Where the topic stands, right under its shape: the whole-topic tally,
	    then the orchestrator's summary as a short list at normal reading size —
	    the huge one-line-per-paragraph read as unrelated shouting, and the
	    reader wants "what do we know", not "look how important this is". */
	verdicts(r){
		div.c("research-verdicts flow", () => {
			this.tally_line(this.tally(r));

			const lines = Array.isArray(r.summary) ? r.summary : [];
			if (!lines.length) return void p.c("research-digging muted", "digging…");

			ul.c("research-summary-list").append(() => lines.forEach(line => li.c("research-summary-line", line)));
		});
	}

	/** The one sub-area a grid item routed to — `#<id>` — rendered with the
	    existing card-that-opens-forever tree, open on first visit. A reload or
	    Back land here the same way: `content()` redraws on every `hashchange`,
	    and the first time a given id is drawn, the page scrolls to it. */
	detail(r){
		const id = (location.hash || "").slice(1);
		if (!id || !r.children().includes(id)) return;

		this.open.add(id);

		const $detail = div.c("research-detail flow").append(() => {
			a.c("research-detail-close muted").href("#").text("‹ close");
			this.node(r, id);
		});

		if (this.scrolled_to !== id){
			this.scrolled_to = id;
			requestAnimationFrame(() => $detail.el.scrollIntoView({ block: "start" }));
		}
	}

	/** One line, not a strip of chips — what is running and what each minion
	    is doing or did, read in one breath. Moved down here, below the shape
	    of the dig and where it stands: "who is digging" matters less than
	    "what have they found". */
	minions(r){
		const list = [...r.agents.values()];

		const line = list.length
			? [`${list.filter(a => !a.done).length} running`, ...list.map(a => `${a.name}: ${a.done ?? a.doing ?? ""}`)].join(" · ")
			: "no minions yet";

		p.c("research-minions-line muted").text(line);
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
				if (n.why) this.why(n);
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
				this.credence(n);
				this.badge(r.state(id));
				this.counts(r, kids);
			});
		});

		this.dots(r.score(id));
	}

	/** `why: "credence: high …"` puts the topic's own confidence word on the
	    row itself, small, so it reads before the card is even opened. */
	credence(n){
		const m = /^credence:\s*(\S+)/i.exec(n.why ?? "");
		if (m) span.c("research-credence").text(m[1]);
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

	/** The reasoning, in the body — plain, unless a support/dissent argued the
	    three judgements separately, in which case they read as three labelled
	    lines instead of one paragraph nobody can scan. */
	why(n){
		const parts = ["support", "dissent"].includes(n.kind) ? this.judgements(n.why) : null;
		if (!parts) return void p.c("research-why muted", n.why);

		div.c("research-judgements flow", () => parts.forEach(({ label, text }) =>
			p.c("research-judgement muted").append(() => {
				span.c("research-judgement-label").text(label);
				span.text(text);
			})));
	}

	/** `"true: … logic: … useful: …"` → one `{label, text}` per marker found,
	    in whatever order they were written. Null with fewer than two of the
	    three, so an ordinary why keeps reading as one paragraph. */
	judgements(why){
		const matches = [...(why ?? "").matchAll(/\b(true|logic|useful):\s*/gi)];
		if (matches.length < 2) return null;

		return matches.map((m, i) => ({
			label: m[1].toLowerCase(),
			text: why.slice(m.index + m[0].length, matches[i + 1]?.index ?? why.length).trim(),
		}));
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
