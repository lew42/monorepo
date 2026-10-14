import { div, p, span, small, a, details, summary, strong, md } from "/app.js";
import RefinedCard from "/framework/ext/Refine/RefinedCard.js";
import AISessionConversation from "./AISessionConversation.js";

/**
 * class AISessionCoverage — the session page's Coverage tab: every ask found in the owner's prompts (the `refined` cards
 * `Server/RefineQueue.mjs` writes onto this session's page), each with its status and a click-through to the raw prompt,
 * and the session's coverage score (asks with a verdict ÷ asks found). Doc: ext/Refine/doc/refine-queue.md.
 *
 *   const cov = new AISessionCoverage(session_id); $panel.append(cov.view);
 *   cov.read(page_lines)        // the session's page.jsonl lines, live: refined cards arrive here
 *   cov.add_raw(transcript)     // the transcript lines the conversation already pulled: the raw text, found by uuid
 *
 * Statuses come from the prompt-outcomes tally (`/framework/ai/doc/asks-outcomes.jsonl`) where it names this prompt, else "unreviewed".
 */
export default class AISessionCoverage {

	static OUTCOMES = "/framework/ai/doc/asks-outcomes.jsonl";
	static COLOR = { "done": "var(--ok)", "partly": "var(--warn)", "not done": "var(--hot)", "open": "var(--prim-ink)", "unreviewed": "var(--ink)" };

	constructor(session){
		this.session = session;
		this.cards = new Map();   // card id → refined card (later write wins)
		this.raw = new Map();     // transcript uuid → the owner's words
		this.outcomes = null;
		this.view = div.c("flow session-coverage");
		AISessionCoverage.load_outcomes().then(o => { this.outcomes = o; this.draw(); });
	}

	read(lines){
		let hit = false;
		for (const c of RefinedCard.from_lines(lines)){ this.cards.set(c.id, c); hit = true; }
		if (hit) this.draw();
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
			const cards = [...this.cards.values()].sort((x, y) => x.line - y.line);
			this.view.empty(() => {
				if (!cards.length) return p.c("muted", AISessionCoverage.EMPTY);
				const s = RefinedCard.score(cards, this.outcomes);
				div.c("card flow", () => {
					div.c("flex gap-50 wrap v-center", () => {
						strong(s.score == null ? "–" : Math.round(s.score * 100) + "% coverage");
						small.c("muted", `${s.judged} of ${s.found} asks have a verdict, across ${cards.length} prompt${cards.length > 1 ? "s" : ""}`);
					});
					div.c("flex gap-50 wrap", () => RefinedCard.STATUSES.forEach(k => s.by[k] && AISessionCoverage.tag(k, `${k} ${s.by[k]}`)));
					small.c("muted", "Asks found by Haiku, one call per prompt (Server/RefineQueue.mjs). A verdict comes from the asks-outcomes tally; until it names a prompt, its asks are unreviewed.");
				});
				cards.forEach((c, i) => this.prompt(c, i + 1, open));
			});
		});
	}

	/** One prompt: its refined form and asks up front; the structured outline and the raw words one click down. */
	prompt(c, n, open){
		const box = details.c("card flow");
		box.el.id = "p" + c.line;
		if (open.has(box.el.id)) box.el.open = true;
		box.append(() => {
			summary(() => {
				strong(`${n}. ${c.subject || "Prompt"}`);
				small.c("muted", ` · ${(c.asks ?? []).length} asks · ${c.at ? new Date(c.at).toLocaleString() : ""}`);
			});
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
