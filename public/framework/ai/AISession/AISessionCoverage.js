import { div, p, span, small, a, details, summary, strong, md } from "/app.js";
import RefinedCard from "/framework/ext/Refine/RefinedCard.js";
import AISessionConversation from "./AISessionConversation.js";
import PromptRun from "/framework/ext/Refine/PromptRun.js";
import { icon } from "/framework/core/View/View.js";

/**
 * class AISessionCoverage — the session page's Coverage tab: every ask found in the owner's prompts (the `refined` cards
 * `Server/RefineQueue.mjs` writes onto this session's page), each with its status and a click-through to the raw prompt,
 * and the session's coverage score (asks with a verdict ÷ asks found). Doc: ext/Refine/doc/refine-queue.md.
 *
 *   const cov = new AISessionCoverage(session_id); $panel.append(cov.view);
 *   cov.read(page_lines)        // the session's page.jsonl lines, live: refined cards arrive here
 *   cov.add_raw(transcript)     // the transcript lines the conversation already pulled: the raw text, found by uuid
 *
 *   cov.read_records(rows)      // PromptLog.fold of the session's prompts.jsonl: a prompt with `parts` is drawn as its RECORD (completion,
 *                               // each part's outcome), ext/Refine/doc/prompt-records.md; its refined card is then not drawn again
 * Statuses come from the prompt-outcomes tally (`/framework/ai/doc/asks-outcomes.jsonl`) where it names this prompt, else "unreviewed".
 */
export default class AISessionCoverage {

	static OUTCOMES = "/framework/ai/doc/asks-outcomes.jsonl";
	static GLYPH = { ask: "task_alt", question: "help_outline", rule: "gavel", idea: "lightbulb", conversation: "chat_bubble_outline" };
	static COLOR = { "done": "var(--ok)", "partly": "var(--warn)", "not done": "var(--hot)", "open": "var(--prim-ink)", "unreviewed": "var(--ink)" };

	constructor(session){
		this.session = session;
		this.cards = new Map();   // card id → refined card (later write wins)
		this.raw = new Map();     // transcript uuid → the owner's words
		this.outcomes = null;
		this.records = new Map();  // prompt id → PromptRun with parts (Server/PromptRecords.mjs writes them)
		this.view = div.c("flow session-coverage");
		AISessionCoverage.load_outcomes().then(o => { this.outcomes = o; this.draw(); });
	}

	read(lines){
		let hit = false;
		for (const c of RefinedCard.from_lines(lines)){ this.cards.set(c.id, c); hit = true; }
		if (hit) this.draw();
	}

	read_records(rows){
		for (const row of Object.values(rows ?? {})) if (row.parts?.length) this.records.set(row.id, PromptRun.from_log(row, this.session));
		if (this.records.size) this.draw();
	}

	add_raw(lines){
		let hit = false;
		for (const l of lines ?? []){
			if (l?.type !== "user" || !l.uuid) continue;
			const m = AISessionConversation.read(l);
			if (m?.role === "owner"){ this.raw.set(l.uuid, m.text); hit = true; }
		}
		if (hit && this.cards.size) this.draw();
	}

	/** asks-outcomes.jsonl lines keyed `session:line` (their `source` names the transcript and line); an empty map while it does not exist. */
	// Asked for only when its folder's files.jsonl lists it, so a missing tally is never a failed request.
	static load_outcomes(){
		const get = url => fetch(url).then(r => r.ok ? r.text() : "").catch(() => "");
		return AISessionCoverage._outcomes ??= get(new URL("files.jsonl", new URL(AISessionCoverage.OUTCOMES, location.origin)).pathname)
			.then(index => index.includes('"asks-outcomes.jsonl"') ? get(AISessionCoverage.OUTCOMES) : "")
			.then(text => RefinedCard.outcomes(text));
	}

	// One redraw per batch (a replay of many lines paints once). Open prompts stay open across a redraw.
	draw(){
		if (this.pending) return;
		this.pending = true;
		queueMicrotask(() => {
			this.pending = false;
			const open = new Set([...this.view.el.querySelectorAll("details[open]")].map(d => d.id));
			if (!open.size && /^#p\d+$/.test(location.hash)) open.add(location.hash.slice(1));
			const recs = [...this.records.values()], has = new Set(recs.map(r => r.prompt_id));
			const cards = [...this.cards.values()].filter(c => !has.has(c.uuid)).sort((x, y) => x.line - y.line);
			this.view.empty(() => {
				if (recs.length) this.records_view(recs, open);
				if (!cards.length) return recs.length ? null : p.c("muted", AISessionCoverage.EMPTY);
				const s = RefinedCard.score(cards, this.outcomes);
				div.c("flow", () => {
					div.c("flex gap-50 wrap v-center", () => {
						strong(s.score == null ? "–" : Math.round(s.score * 100) + "% coverage");
						small.c("muted", `${s.judged} of ${s.found} asks have a verdict, across ${cards.length} prompt${cards.length > 1 ? "s" : ""}`);
					});
					div.c("flex gap-50 wrap", () => RefinedCard.STATUSES.forEach(k => s.by[k] && AISessionCoverage.tag(k, `${k} ${s.by[k]}`)));
				});
				cards.forEach((c, i) => this.prompt(c, i + 1, open));
			});
		});
	}

	/* PROMPT RECORDS, drawn as a chat: a bubble per prompt (heading, coverage score, its opening words), a card per top-level part wearing
	 * the module it concerns, its outcome and its S-cites; a click on a cite shows those raw sentences, highlighted, in the bubble. Nested
	 * details settle with their parent (PromptRun.settled looks at top-level parts only), so a card only counts them.
	 * A "task" outcome counts as open here until its task is complete (the browser does not resolve task states yet). */
	records_view(recs, open){
		const done = recs.filter(r => r.complete()).length, loose = recs.reduce((n, r) => n + r.open().length + r.uncovered.length, 0);
		div.c("flow", () => {
			div.c("flex gap-50 wrap v-center", () => { strong(`${done} of ${recs.length} prompts complete`); small.c("muted", `${loose} open parts or uncited sentences · a prompt is complete when everything it asks is done or documented`); });
			recs.sort((x, y) => (x.at ?? "").localeCompare(y.at ?? "")).forEach((r, i) => {
				const { done: d, total } = r.progress(), box = details.c("flow session-bubble").style({ margin: "0" });
				box.el.id = "r" + r.prompt_id.slice(0, 8);
				if (open.has(box.el.id)) box.el.open = true;
				box.append(() => {
					summary(() => {
						AISessionCoverage.tag(r.complete() ? "done" : "open", r.complete() ? "complete" : `${d}/${total}`);
						strong(` ${i + 1}. ${r.subject || r.parts.find(x => x.kind === "ask")?.text || "Prompt"}`);
						small.c("muted", ` · ${AISessionCoverage.score(r)}% of ${r.clean.length} sentences cited`);
					}).style({ border: "0", background: "none", margin: "0", padding: "0.3em 0", "box-shadow": "none" });
					p.c("session-words", AISessionCoverage.words(r));
					r.parts.filter(x => x.kind !== "conversation" || x.outcome?.is).forEach(x => this.card(box, r, x));
					const hidden = r.parts.filter(x => x.kind === "conversation" && !x.outcome?.is).length;
					if (hidden) small.c("muted", `${hidden} conversation part${hidden > 1 ? "s" : ""} hidden.`);
					if (r.uncovered.length) small.c("muted", `Sentences no part cites: S${r.uncovered.join(", S")}. They keep the prompt open.`);
					div.c("session-raw flow");
					details(() => { summary("Raw prompt"); div.c("flow", () => r.clean.forEach(c => p(`S${c.n}. ${c.text}`))); });
				});
			});
		});
	}

	/** One top-level part: its module (the card's wrapper), kind, outcome tag, text, its details counted, and the cite that opens the raw words. */
	card(bubble, r, x){
		const is = x.outcome?.is ?? "open", ref = x.outcome?.ref, nested = x.parts ?? [];
		div.c("session-card", () => {
			div.c("session-card-mod", () => {
				icon(AISessionCoverage.GLYPH[x.kind] ?? "article");
				span(() => { strong(x.module || "general"); small.c("muted", x.kind); });
			});
			div.c("session-card-body flow", () => {
				div.c("flex gap-50 wrap v-center", () => {
					AISessionCoverage.tag(PromptRun.SETTLED.includes(is) ? "done" : is === "task" ? "partly" : "open", is);
					span(x.text);
				});
				if (nested.length) small.c("muted", "+ " + nested.length + " detail" + (nested.length > 1 ? "s" : "") + ": " + nested.map(n => n.kind).join(", "));
				div.c("flex gap-50 wrap", () => {
					if (x.cites?.length) a.c("muted", AISessionCoverage.ranges(x.cites)).href("#" + bubble.el.id).on("click", e => { e.preventDefault(); this.show_cites(bubble, r, x.cites); });
					if (ref) /^\/|^[\w./-]+\.(md|js|mjs|jsonl)$/.test(ref) ? a.c("muted", ref).href(ref.startsWith("/") ? ref : "/" + ref.replace(/^public\//, "")) : small.c("muted", ref);
					if (x.outcome?.why) small.c("muted", x.outcome.why);
				});
			});
		});
	}

	/** Plain DOM (a click runs outside any capture): the cited sentences, highlighted, in the bubble's raw area. */
	show_cites(bubble, r, cites){
		const box = bubble.el.querySelector(".session-raw"), el = (tag, text, cls) => Object.assign(document.createElement(tag), { textContent: text, ...(cls ? { className: cls } : {}) });
		bubble.el.open = true;
		box.replaceChildren(...r.clean.filter(c => cites.includes(c.n)).map(c => el("p", `S${c.n}. ${c.text}`, "sessions-flag")));
		box.firstElementChild?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}

	/** Cited sentences ÷ all sentences, as a whole percent. */
	static score(r){ return r.clean.length ? Math.round((r.clean.length - r.uncovered.length) / r.clean.length * 100) : 0; }
	/** [4, 7, 8, 9] → "S4, S7–9". */
	static ranges(ns){
		const out = []; [...ns].sort((a, b) => a - b).forEach(n => { const l = out[out.length - 1]; l && n === l[1] + 1 ? l[1] = n : out.push([n, n]); });
		return out.map(([a, b]) => a === b ? "S" + a : b === a + 1 ? `S${a}, S${b}` : `S${a}–${b}`).join(", ");
	}
	/** The bubble's quoted opening: the first sentences, cut. */
	static words(r){ const t = r.clean.map(c => c.text).join(" "); return "“" + (t.length > 220 ? t.slice(0, 220).trimEnd() + "…" : t) + "”"; }

	/** One prompt: its refined form and asks up front; the structured outline and the raw words one click down. */
	prompt(c, n, open){
		const box = details.c("flow session-coverage-row").style({ "border-bottom": "1px solid var(--line, #8883)", margin: "0", padding: "0" });
		box.el.id = "p" + c.line;
		if (open.has(box.el.id)) box.el.open = true;
		box.append(() => {
			summary(() => {
				strong(`${n}. ${c.subject || "Prompt"}`);
				small.c("muted", ` · ${(c.asks ?? []).length} asks · ${c.at ? new Date(c.at).toLocaleString() : ""}`);
			}).style({ border: "0", background: "none", margin: "0", padding: "0.3em 0", "box-shadow": "none" });
			md(c.refined || "");
			div.c("flow", () => (c.asks ?? []).forEach(ask => {
				const status = RefinedCard.status_of(ask, c, this.outcomes);
				div.c("flex gap-50", () => {   // the tag stays beside the ask; the ask and its cites wrap as one line of text
					AISessionCoverage.tag(status, status);
					span(() => {
						span(ask.text + " ");
						a.c("muted", ask.cites?.length ? "S" + ask.cites.join(", S") : "raw").href("#" + box.el.id).on("click", e => { e.preventDefault(); this.show_raw(box, ask.cites); });
						span(" "); a.c("muted", "line " + c.line).href(c.raw ?? RefinedCard.raw_link(c.session, c.line));   // the same prompt in the transcript file
					});
				});
			}));
			if (c.uncited?.length) small.c("muted", `Sentences no ask cites: S${c.uncited.join(", S")} (often filler; worth a look when a long prompt drops many).`);
			details(() => { summary("Structured"); md(c.structured || ""); });
			details.c("session-coverage-raw", () => {
				summary(() => { span("Raw prompt "); a.c("muted", `transcript line ${c.line}`).href(c.raw ?? RefinedCard.raw_link(c.session, c.line)); });
				div.c("flow");   // filled when opened: show_raw()
			}).on("toggle", e => { if (e.target.open && !e.target.querySelector("ol")) this.show_raw(box); });   // a cite click already filled it, with its highlight
		});
	}

	/** The raw words of this prompt, numbered the same way the cites are; `marks` highlights the cited sentences. */
	show_raw(box, marks = []){
		const card = this.cards.get("refined-" + box.el.id.slice(1)), raw = box.el.querySelector(".session-coverage-raw");
		box.el.open = true;
		const text = card && this.raw.get(card.uuid);
		const $list = raw.lastElementChild;
		raw.open = true;
		// Plain DOM: this runs from a click, outside any capture, so a factory call would have no parent to land in.
		const el = (tag, text, cls) => Object.assign(document.createElement(tag), { textContent: text ?? "", ...(cls ? { className: cls } : {}) });
		if (!text) return $list.replaceChildren(el("p", AISessionCoverage.NO_RAW, "muted"));
		const list = el("ol");
		RefinedCard.sentences(text).forEach((sentence, i) => list.append(el("li", sentence, marks.includes(i + 1) ? "sessions-flag" : "")));
		$list.replaceChildren(list);
		$list.querySelector(".sessions-flag")?.scrollIntoView({ block: "center", behavior: "smooth" });
	}

	static tag(status, label){ return span.c("sessions-tag", label).style({ "--sessions-tag-color": AISessionCoverage.COLOR[status] ?? "var(--ink)", "align-self": "start" }); }

	static NO_RAW = "The raw words come from this page's own transcript (the Conversation tab loads it); it has not reached this prompt yet. The transcript link above opens the file itself (local only).";
	static EMPTY ="No refined prompts for this session yet. `node Server/RefineQueue.mjs <session>:<line>` refines one; `--days 7` refines the week (ext/Refine/doc/refine-queue.md).";
}
