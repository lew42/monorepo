import { Page } from "../../core/Page/Page.class.js";
import { View, div, p, h2, span, a, details, summary, icon } from "../../core/View/View.js";
import { JSONL } from "../JSONL/JSONL.js";
import { CREDENCE, validate, notes, credences, kinds } from "./entries.js";

View.stylesheet(import.meta, "Research.css");

/* What a kind LOOKS like is this side's business — the schema never says.
   ⚠ Material ICONS, not Symbols: a Symbols-only name renders as its literal
     WORD, many em wide, and nothing throws. Every name here is classic. */
const KIND_ICON = {
	finding: "lightbulb", source: "link", theory: "account_tree",
	opinion: "gavel", question: "help",
};

/* The one sentence each credence word promises. Shown in the legend, and as the
   title on every badge — so the treatment is never the only thing carrying it. */
export const CREDENCE_MEANS = {
	established: "mainstream consensus, checkable against a source",
	contested: "specialists disagree — the evidence cuts both ways",
	fringe: "argued outside the mainstream, by someone who names their evidence",
	speculation: "nobody has evidence — this is a possibility, written down",
};

/**
 * ONE topic's log — flat entries, no verb key.
 *
 * A `JSONL` line is `{"<verb>": {…}}`; a program line IS the entry. `apply()`
 * takes both, so a topic that later wants a `{"log": …}` line beside its
 * entries gets it free.
 *
 * ⚠ TOLERANT ON PURPOSE. The writer refuses an illegal line; a reader that
 *   refused one too would hide the defect it is supposed to show. Everything
 *   parseable lands in `entries`, carrying `bad` (why the schema refuses it)
 *   and `notes` (why it is weak) — the page marks them rather than dropping
 *   them, and `entries.length + unparsed` equals the file's line count.
 */
export class ProgramJSONL extends JSONL {
	entries = [];

	apply(entry){
		const verbed = Object.keys(entry).some(key => this.constructor.verbs.includes(key));
		return verbed ? super.apply(entry) : this.entry(entry);
	}

	entry(value){
		this.entries.push({ topic: this.topic, ...value, bad: validate(value), notes: notes(value) });
		return this;
	}

	// ⚠ Every verb's own store, or a rewritten file replays on top of the old one.
	reset(){ this.entries = []; return super.reset(); }

	/** What a card shows without opening: legal lines, refused lines, torn lines. */
	tally(){
		return {
			lines: this.entries.length + this.unparsed,
			bad: this.entries.filter(e => e.bad).length,
			unparsed: this.unparsed,
		};
	}
}

/**
 * The front of a research PROGRAM — several topics dug in parallel, each
 * appending to its own `<topic>/log.jsonl`, aggregated into one living page:
 * the credence legend, a card per topic, the theories board, the latest stream.
 *
 *   export default new Program({ meta: import.meta, topics: "stone theories" });
 *
 * Live — every log is `.live()`d, so a line a minion appends arrives without a
 * reload. Off localhost there is no socket and each log is fetched once.
 *
 * Every step is a method, so a program with its own emphasis overrides one and
 * inherits the rest.
 */
export class Program extends Page {

	/** The topics I aggregate, in the order they should read. */
	topic_list(){ return (this.topics ?? "").split(/\s+/).filter(Boolean); }

	/** Where a topic keeps its log — beside my own url, in its own dir. */
	log_url(topic){ return this.url + topic + "/log.jsonl"; }

	// ⚠ No DOM after the await: `draw()` builds inside `empty()`, which
	//   re-establishes the captor the first await dropped.
	content(){
		div.c("research-program flow", async $r => {
			this.$live = $r;

			this.logs = this.topic_list().map(topic =>
				new ProgramJSONL({ url: this.log_url(topic), topic }));

			await Promise.all([
				...this.logs.map(log => log.live(() => this.draw())),
				this.listing().then(dir => this.logs.forEach(log => this.found(log, dir))),
			]);

			this.draw();
		});
	}

	/**
	 * What each topic has actually written, from `directory.json` — the dir tree
	 * the dev server keeps and the site ships.
	 *
	 * ⚠ ONE fetch, and no probing. Asking `<topic>/page.js` four times answers
	 *   with four console 404s on a program whose topics have not started yet —
	 *   which is the normal state of a program, and a page that logs errors when
	 *   nothing is wrong trains you to ignore the console.
	 * ⚠ The SPA fallback answers a miss with index.html at 200 — content-type is
	 *   the 404, exactly as `Page.file()` reads it.
	 */
	async listing(){
		const res = await fetch("/directory.json").catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;

		const root = { children: (await res.json()).files };
		return this.url.replace(/^\/|\/$/g, "").split("/")
			.reduce((node, name) => node?.children?.find(kid => kid.name === name), root);
	}

	/**
	 * A topic's way in. Its own `page.js` wins; failing that, every `.md` it has
	 * curated is already a page — core serves `<topic>/x.md` at `<topic>/x/`
	 * with no declaration, so the owner can read what a minion wrote the moment
	 * the file lands, and nothing here has to be edited when it does.
	 */
	found(log, dir){
		const mine = dir?.children?.find(kid => kid.name === log.topic)?.children ?? [];

		log.page = mine.some(file => file.name === "page.js");
		log.pages = mine.filter(file => file.name.endsWith(".md")).map(file => file.name.slice(0, -3));
	}

	/* Redrawn whole on every streamed batch — `changed` fires outside any captor. */
	draw(){
		this.$live.empty(() => {
			const all = this.all();
			this.head(all);
			this.legend(all);
			this.topic_cards();
			this.board(all);
			this.stream(all);
			this.foot(all);
		});
	}

	/** Every topic's entries in one list, newest first. */
	all(){
		return this.logs.flatMap(log => log.entries)
			.sort((a, b) => String(b.at ?? "").localeCompare(String(a.at ?? "")));
	}

	head(all){
		div.c("research-head flow", () => {
			if (this.question) p.c("research-question", this.question);

			const digging = this.logs.filter(log => log.loaded).length;

			div.c("research-meta flex gap wrap v-center", () => {
				span.c("research-count").text(all.length + (all.length === 1 ? " entry" : " entries"));
				span.c("muted").text(`${digging} of ${this.logs.length} topic logs reporting`);
			});
		});
	}

	/* ── the credence legend ──
	   First, before a single claim — the reader learns to read the treatments
	   before anything wearing one arrives. Four words, four looks, and the
	   count of each so the shape of the evidence is visible at a glance. */
	legend(all){
		div.c("research-legend flow", () => {
			p.c("h4 muted", "How sure is this");

			div.c("research-legend-row flex gap wrap", () => CREDENCE.forEach(c => {
				const n = all.filter(e => e.credence === c).length;

				div.c("research-cred-card").ac("research-cred-" + c).append(() => {
					span.c("research-cred-name").text(c);
					span.c("research-cred-n").text(String(n));
					p.c("research-cred-means muted", CREDENCE_MEANS[c]);
				});
			}));
		});
	}

	/* ── one card per topic ──
	   Counts, not claims: how much is in there, and how sure it is. The title is
	   a link only once the topic has written its own page. */
	/* ⚠ NOT `topics()` either — `topics:` is this page's own config FIELD, and the
	   constructor's Object.assign overwrites the method with the string. A method
	   and a field of the same name is a silent swap in this codebase's whole
	   assign-based style; every name here has to miss BOTH lists. */
	topic_cards(){
		div.c("research-topics flow", () => {
			p.c("h4 muted", "The dig");

			div.c("research-topics-row grid auto gap", () => this.logs.forEach(log => this.topic_card(log)));
		});
	}

	/* ⚠ NOT `card()`. `Page.nav()` reads `this.card` as the extra classes for this
	   page's PREVIEW, so a method by that name is handed to `.ac()` and every card
	   wall linking here dies with `arg.split is not a function` — on the PARENT's
	   page, not this one. `topic()` is taken by core too. Cost an hour, 2026-08-30. */
	topic_card(log){
		const t = log.tally();

		div.c("research-card surface flex v gap").append(() => {
			log.page
				? a.c("research-card-name h3").href(this.url + log.topic + "/").text(log.topic)
				: span.c("research-card-name h3").text(log.topic);

			if (!t.lines) p.c("muted", log.loaded ? "no entries yet" : "no log yet");
			else {
				span.c("research-count").text(t.lines + (t.lines === 1 ? " entry" : " entries"));
				this.bar(log.entries);

				span.c("research-card-kinds muted")
					.text(kinds(log.entries).map(([k, n]) => `${n} ${k}`).join(" · "));

				if (t.bad || t.unparsed) span.c("research-refused")
					.text([t.bad && `${t.bad} off-schema`, t.unparsed && `${t.unparsed} unreadable`]
						.filter(Boolean).join(" · "));
			}

			// Only when there is no page.js — a topic with its own page has already
			// arranged these, and listing them twice is the card doing its job twice.
			if (log.page || !log.pages?.length) return;

			div.c("research-card-pages flex v", () => log.pages.forEach(name =>
				a.c("research-card-page").href(this.url + log.topic + "/" + name + "/").text(name.replace(/-/g, " "))));
		});
	}

	/* The evidence mix as one bar — the only place a topic's credences are
	   compared by SIZE, which is what makes "mostly speculation" visible without
	   reading a word. */
	bar(entries){
		const mix = credences(entries);

		div.c("research-bar flex").attr("title", mix.map(([c, n]) => `${n} ${c}`).join(" · "))
			.append(() => mix.forEach(([c, n]) =>
				span.c("research-bar-part").ac("research-cred-" + c).style("flex", `${n} 0 0`)
					.attr("title", `${n} ${c}`)));
	}

	/* ── the theories board ──
	   Grouped by topic, because the schema has no field linking an assessment to
	   the theory it assesses (doc/program.md) — the topic is the only honest
	   join, so the opinions sit under their own theories and nothing implies a
	   pairing the data does not contain. */
	board(all){
		const theories = all.filter(e => e.kind === "theory");
		if (!theories.length) return;

		div.c("research-board flow", () => {
			h2("Theories on the table");

			this.logs.forEach(log => {
				const mine = theories.filter(e => e.topic === log.topic);
				if (!mine.length) return;

				// ⚠ Newest first and CAPPED. Uncapped this board was 35 cards and
				// 10.8 screens on its own, with the stream below it — the front of a
				// program that never closes has to stay a front. The rest is one
				// click away on the topic's own page, and the count says how many.
				const shown = mine.slice(0, this.board_cap ?? 4);

				div.c("research-board-group flow", () => {
					p.c("h4 muted", log.topic);
					shown.forEach(e => this.theory(e));

					if (mine.length > shown.length){
						const more = `${mine.length - shown.length} more in ${log.topic}`;
						log.page
							? a.c("research-more").href(this.url + log.topic + "/").text(more)
							: p.c("research-more muted", more);
					}

					this.takes(log);
				});
			});
		});
	}

	theory(entry){
		div.c("research-theory surface flow").ac("research-cred-" + entry.credence).append(() => {
			div.c("research-theory-head flex gap", () => {
				icon(KIND_ICON.theory).ac("research-icon");
				div.c("flex-1 flow", () => {
					p.c("research-theory-claim", entry.title ?? "");
					this.badge(entry);
				});
			});

			if (entry.summary) p.c("research-theory-why", entry.summary);
			this.marks(entry);
			this.source(entry);
		});
	}

	/* The mainstream half — every `opinion` in this topic, ONCE, under the whole
	   group. It sat inside each theory card first, which repeated the same
	   thirteen assessments under four claims and read as if each list belonged to
	   the card above it. It does not: the schema has no field pairing an
	   assessment to a theory, and the honest shape says so by placement. */
	takes(log){
		const takes = log.entries.filter(e => e.kind === "opinion");
		if (!takes.length) return;

		details.c("research-theory-takes").append(() => {
			summary.c("muted").text(`${takes.length} assessment${takes.length === 1 ? "" : "s"} filed under ${log.topic} — not paired to a claim above`);

			div.c("flow", () => takes.forEach(take => div.c("research-take flow")
				.ac("research-cred-" + take.credence).append(() => {
					p.c("research-take-text", take.title ?? "");
					if (take.summary) p.c("muted", take.summary);
					this.source(take);
				})));
		});
	}

	/* ── the stream ──
	   Everything, newest first, capped — the raw feed under the read of it. */
	stream(all){
		div.c("research-stream flow", () => {
			h2("Latest");

			if (!all.length) return p.c("muted", "Nothing logged yet. Each topic appends to its own log.jsonl as it digs; this page streams them live.");

			// ⚠ A feed, not an archive. 40 entries measured 8367px — the stream alone
			// was 9 screens under a board that was 10 more.
			const shown = all.slice(0, this.cap ?? 20);
			shown.forEach(e => this.entry(e));

			if (all.length > shown.length)
				p.c("research-more muted", `showing the newest ${shown.length} of ${all.length} — a topic's own page has all of its own`);
		});
	}

	entry(e){
		div.c("research-entry flow").ac("research-cred-" + e.credence).append(() => {
			div.c("research-entry-head flex gap wrap v-center", () => {
				icon(KIND_ICON[e.kind] ?? "lens").ac("research-icon");
				span.c("research-entry-topic").text(e.topic ?? "—");
				span.c("research-entry-kind muted").text(e.kind ?? "—");
				this.badge(e);
				span.c("research-entry-at muted").text(String(e.at ?? "").slice(0, 16).replace("T", " "));
			});

			p.c("research-entry-title", e.title ?? "(no title)");
			if (e.summary) p.c("research-entry-summary muted", e.summary);
			this.marks(e);
			this.source(e);
		});
	}

	/* The badge says the word AND its promise — the treatment is never the only
	   thing carrying the credence, so this survives greyscale, a screenshot and
	   a screen reader. */
	badge(e){
		span.c("research-badge").ac("research-cred-" + e.credence)
			.attr("title", CREDENCE_MEANS[e.credence] ?? "no credence given")
			.text(e.credence ?? "unmarked");
	}

	/** What the schema refuses, and what it merely doubts — on the card, never hidden. */
	marks(e){
		if (e.bad) p.c("research-refused", `off-schema — ${e.bad}`);
		e.notes?.forEach(note => p.c("research-note muted", note));
	}

	/* The HOST, not the url. A research url is a 120-character permalink; printed
	   in full it wraps to three mono lines and buries the claim above it. The
	   host is the part you judge a source by, and the full url is the `title`. */
	source(e){
		if (!e.url) return;

		const host = URL.parse?.(e.url)?.hostname?.replace(/^www\./, "") ?? e.url;

		a.c("research-ref").href(e.url).attr("title", e.url)
			.attr("target", "_blank").attr("rel", "noopener").text(host);
	}

	/* ── the foot ──
	   Where the data is, what the page refuses to do to it, and the honest
	   count: entries + unreadable lines = the files' line count. */
	foot(all){
		const torn = this.logs.reduce((n, log) => n + log.unparsed, 0);
		const bad = all.filter(e => e.bad).length;

		details.c("research-process").append(() => {
			summary.c("research-process-head").text("how to read this page");

			div.c("flow", () => {
				p.c("research-log-line", `${all.length} entries read from ${this.logs.length} logs, ${bad} off-schema, ${torn} unreadable. Entries plus unreadable lines is the files' line count.`);
				p("A **credence** is the writer's own claim about their evidence, not this page's judgement of it. The page never upgrades one: a speculation stays a speculation however often it is repeated.");
				p("Nothing here is deleted or reordered by quality — the stream is chronological, the board is grouped by topic. An entry the schema refuses is shown with the reason, because hiding it would hide the defect.");
				p.c("muted", `Logs: ${this.topic_list().map(t => t + "/log.jsonl").join(", ")} — the schema is ext/Research/entries.js.`);
			});
		});
	}
}

export default Program;
