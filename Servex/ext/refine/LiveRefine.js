import { quick_clean, clean } from "../../../public/framework/ext/Refine/engine.js";
import RefineStyle from "../../../public/framework/ext/Refine/RefineStyle.js";
import RefineCall from "./RefineCall.js";
import VoicePage from "./VoicePage.js";
import PromptLog from "../../../public/framework/ai/AISession/PromptLog.js";

const DEFAULT_SECTION = "📝 Notes";

/**
 * class LiveRefine — one prompt being dictated: holds the slots (numbered finished sentences) and
 * the growing outline, and places each new slot within a few seconds (design: `ext/Refine/doc/live-refine-2026-10-12.md`).
 *
 *   const r = LiveRefine.get(key);                 // key = `${session}/${prompt}`, or just `prompt` with no session
 *   const out = await r.step({ text, final, source, session, prompt });
 *   // out: { seq, slots, md, outline, unplaced, pending, done, timing, cost_usd }
 *
 * Per POST (`quick_clean(text)` gives the mechanical sentences; every finished one beyond the slots
 * already taken becomes a new slot, number fixed forever):
 *   - each new slot gets its OWN Haiku `clean()` call, in parallel, never blocking the answer.
 *   - all new slots across the prompt so far go into ONE queue; at most one "amend" Haiku call is
 *     in flight, so slots that arrive mid-call coalesce into the NEXT one (never a backlog).
 *   - the POST answers once the batch holding ITS new slots has been placed (`seq` grows per answer).
 * Every call is its own fresh `RefineCall` (no resumed session accumulates), seeded with the current
 * outline capped at `BUDGET_TOKENS` chars/4 (over it, a bullet is sent as its id + first 80 chars).
 */
export default class LiveRefine {

	static BUDGET_TOKENS = 60000;
	static DROP_AFTER_MS = 5 * 60 * 1000;   // dropped some minutes after final (or after going quiet)

	static open = new Map();

	static get(key){
		if (!LiveRefine.open.has(key)) LiveRefine.open.set(key, new LiveRefine(key));
		return LiveRefine.open.get(key);
	}

	constructor(key){
		this.key = key;
		this.slots = [];           // [{ n, raw, clean, cleaned }]
		this.sections = [];        // [{ title, cards: [{ id, text, cites: [n...] }] }]
		this.subject = null;
		this.next_card_id = 1;
		this.all_cited = new Set();     // every slot number cited anywhere in the outline
		this.unplaced = [];             // slot numbers force-placed (no model citation)
		this.queue = new Set();         // slot numbers waiting for the next amend batch
		this.max_covered = 0;           // slot numbers <= this are placed
		this.waiters = [];              // [{ need, resolve }]
		this.draining = false;
		this.seq = 0;
		this.cost_usd = 0;
		this.calls = [];                // every RefineCall.run result, for measurement ({stage, tokens, cost_usd, duration_ms})
		this.last_batch = { clean_ms: 0, amend_ms: 0 };
		this.voice = null;
		this.done = false;
		this.touch();
	}

	touch(){ clearTimeout(this.drop_timer); this.drop_timer = setTimeout(() => LiveRefine.open.delete(this.key), LiveRefine.DROP_AFTER_MS); this.drop_timer.unref?.(); }

	/** One POST's worth of work. Never throws on a model hiccup (a failed clean/amend call keeps the mechanical text). */
	async step({ text, final = false, source = "dictated", session = "", prompt = "" } = {}){
		this.touch();
		const t_arrive = Date.now();
		const parsed = quick_clean(text);
		const finished = final ? parsed.length : Math.max(0, parsed.length - 1);   // the last sentence waits for one more, or `final`
		const fresh = [];
		for (let n = this.slots.length + 1; n <= finished; n++){
			const slot = { n, raw: parsed[n - 1]?.text ?? "", clean: null, cleaned: false };
			this.slots.push(slot);
			fresh.push(slot);
		}
		if (session && prompt){ this.voice ??= VoicePage.get(session, prompt); this.voice.raw(text, { final, source }); }

		if (fresh.length){
			for (const slot of fresh) this.run_clean_for_slot(slot);   // fire-and-forget, in parallel, never blocks the amend
			for (const slot of fresh) this.queue.add(slot.n);
			this.ensure_drain();
		}

		const need = fresh.length ? Math.max(...fresh.map(s => s.n)) : 0;
		if (need) await this.wait_for(need);
		if (final) { await this.drain_running; await this.finish({ text, source, session, prompt }); }

		this.seq++;
		return {
			seq: this.seq,
			slots: this.slots.map(s => ({ n: s.n, raw: s.raw, clean: s.clean ?? s.raw, cleaned: s.cleaned })),
			md: this.render_md(),
			outline: { subject: this.subject, sections: this.sections.map(s => ({ title: s.title, cards: s.cards.map(c => ({ id: c.id, text: c.text, cites: [...c.cites] })) })) },
			unplaced: [...this.unplaced],
			pending: this.queue.size,
			done: this.done,
			timing: { ...this.last_batch, placed_ms: Date.now() - t_arrive },
			cost_usd: this.cost_usd,
		};
	}

	/** Resolve once every slot up to `need` is placed in the outline. */
	wait_for(need){
		if (this.max_covered >= need) return Promise.resolve();
		return new Promise(resolve => this.waiters.push({ need, resolve }));
	}

	ensure_drain(){
		if (this.draining) return;
		this.draining = true;
		this.drain_running = this.drain().finally(() => { this.draining = false; });
	}

	/** One amend call at a time; whatever landed in the queue while it ran goes together in the next one (coalescing). */
	async drain(){
		while (this.queue.size){
			const batch = [...this.queue].sort((a, b) => a - b);
			this.queue.clear();
			await this.run_amend_batch(batch);
			const covered = Math.max(this.max_covered, ...batch);
			this.max_covered = covered;
			const ready = this.waiters.filter(w => w.need <= covered);
			this.waiters = this.waiters.filter(w => w.need > covered);
			for (const w of ready) w.resolve();
		}
	}

	/** One Haiku call per new slot, in parallel; a failed call just keeps the mechanical (quick_clean) text. */
	async run_clean_for_slot(slot){
		const t0 = Date.now();
		const idx = this.slots.indexOf(slot);
		const prev = idx > 0 ? (this.slots[idx - 1].clean ?? this.slots[idx - 1].raw) : "";
		try {
			const r = await clean(slot.raw, { call: this.call("clean"), model: RefineCall.model(), prev });
			slot.clean = r.sentences.map(s => s.text).join(" ").trim() || slot.raw;
		} catch { /* mechanical text stands */ }
		slot.cleaned = true;
		slot.clean_ms = Date.now() - t0;
	}

	/** One amend call: the outline with ids + the new numbered sentences -> JSON ops (never a rewrite). */
	async run_amend_batch(batch){
		const t0 = Date.now();
		const system = RefineStyle.for("outline") + "\n\nAnswer ONLY a JSON object, no prose: "
			+ `{"subject": string|null, "ops": [{"edit": {"id": "c3", "text": "...", "cites": [9]}} | {"add": {"section": "...", "text": "...", "cites": [10]}}]}. `
			+ "edit = the new sentence clarifies or corrects point `id`: rewrite its text. add = a new point, under an existing section title or a brand new one (one emoji icon). "
			+ "subject = a new \"#\" title ONLY if the topic truly changed, else null. Cite every new sentence number at least once.";
		const prompt = `Current outline:\n${this.render_outline_for_model() || "(empty)"}\n\nNew sentences:\n${batch.map(n => `S${n}: ${this.slot_text(n)}`).join("\n")}`;
		let ops = [], subject = null;
		try {
			const r = await this.call("amend")(prompt, { model: RefineCall.model(), system });
			const m = /\{[\s\S]*\}/.exec(r.answer ?? "");
			if (m){ const j = JSON.parse(m[0]); subject = j.subject ?? null; ops = Array.isArray(j.ops) ? j.ops : []; }
		} catch { /* ops stays empty: every new sentence below falls through to unplaced */ }
		this.apply_ops(ops, subject, batch);
		const clean_ms = Math.max(0, ...batch.map(n => this.slots.find(s => s.n === n)?.clean_ms ?? 0));
		this.last_batch = { clean_ms, amend_ms: Date.now() - t0 };
		if (this.voice) this.voice.structured(this.render_md(), { ms: this.last_batch.amend_ms, cost: this.cost_usd });
	}

	/** Checked by code, never trusted (the design doc's law): unknown ids become adds, cites only grow,
	 *  and every sentence this batch introduced that nobody cited is force-added and flagged unplaced. */
	apply_ops(ops, subject, batch){
		if (subject && !this.subject) this.subject = String(subject).trim();
		for (const op of ops){
			if (op?.edit?.id){
				const card = this.find_card(op.edit.id);
				const cites = Array.isArray(op.edit.cites) ? op.edit.cites.filter(Number.isInteger) : [];
				if (card){
					if (typeof op.edit.text === "string" && op.edit.text.trim()) card.text = op.edit.text.trim();
					this.cite(card, cites);
					this.last_section = card.section;
				} else {
					this.add_card({ section: this.last_section ?? DEFAULT_SECTION, text: op.edit.text, cites });
				}
			} else if (op?.add){
				this.add_card({ section: op.add.section ?? this.last_section ?? DEFAULT_SECTION, text: op.add.text, cites: Array.isArray(op.add.cites) ? op.add.cites.filter(Number.isInteger) : [] });
			}
		}
		for (const n of batch){
			if (this.all_cited.has(n)) continue;
			this.add_card({ section: this.last_section ?? DEFAULT_SECTION, text: this.slot_text(n), cites: [n] });
			this.unplaced.push(n);
		}
	}

	find_card(id){ for (const s of this.sections) for (const c of s.cards) if (c.id === id) return c; return null; }

	section_named(title){
		let s = this.sections.find(s => s.title === title);
		if (!s){ s = { title, cards: [] }; this.sections.push(s); }
		return s;
	}

	add_card({ section, text, cites = [] }){
		if (typeof text !== "string" || !text.trim()) return;
		const sec = this.section_named(section);
		const card = { id: "c" + this.next_card_id++, text: text.trim(), cites: [], section };
		sec.cards.push(card);
		this.cite(card, cites);
		this.last_section = section;
	}

	cite(card, ns){
		for (const n of ns){ if (!card.cites.includes(n)) card.cites.push(n); this.all_cited.add(n); }
		card.cites.sort((a, b) => a - b);
	}

	slot_text(n){ const s = this.slots.find(s => s.n === n); return s ? (s.clean ?? s.raw) : ""; }

	render_md(){
		let md = this.subject ? `# ${this.subject}\n` : "";
		for (const sec of this.sections){
			md += `## ${sec.title}\n`;
			for (const c of sec.cards) md += `- ${c.text}${c.cites.length ? ` [${c.cites.map(n => "S" + n).join(", ")}]` : ""}\n`;
		}
		return md;
	}

	/** The outline sent to the model, WITH ids (`render_md()` is the browser-facing copy, no ids). Capped at BUDGET_TOKENS. */
	render_outline_for_model(short = false){
		let md = this.subject ? `# ${this.subject}\n` : "";
		for (const sec of this.sections){
			md += `## ${sec.title}\n`;
			for (const c of sec.cards) md += `- [${c.id}] ${short ? c.text.slice(0, 80) : c.text}${c.cites.length ? ` [${c.cites.map(n => "S" + n).join(", ")}]` : ""}\n`;
		}
		if (!short && md.length / 4 > LiveRefine.BUDGET_TOKENS) return this.render_outline_for_model(true);
		return md;
	}

	/** A plain `(prompt, {model, system}) -> {answer, cost_usd}` call, recorded for the measurement script and the running total. */
	call(stage){
		return async (prompt, opts) => {
			const r = await RefineCall.run(prompt, { ...opts, stage });
			this.calls.push({ stage, tokens: r.tokens, cost_usd: r.cost_usd, duration_ms: r.duration_ms, model: r.model });
			this.cost_usd = +(this.cost_usd + r.cost_usd).toFixed(5);
			return r;
		};
	}

	/** `final: true`: log the prompt (PromptLog) and mark the page done. Logging never fails the refine. */
	async finish({ text, source, session, prompt }){
		this.done = true;
		if (this.voice){
			this.voice.clean(this.slots.map(s => s.clean ?? s.raw), { final: true });
			this.voice.notes([], { ms: 0 });
			this.voice.done();
		}
		if (session && prompt){
			try {
				await PromptLog.add(session, { prompt, stage: "raw", text, source }, "refine-live");
				await PromptLog.add(session, { prompt, stage: "clean", sentences: this.slots.map(s => s.clean ?? s.raw), final: true }, "refine-live");
				const cards = this.sections.map(s => ({ title: s.title, cites: [], cards: s.cards.map(c => ({ text: c.text, cites: c.cites.map(n => n - 1) })) }));
				await PromptLog.add(session, { prompt, stage: "refined", subject: this.subject ?? "", cards }, "refine-live");
			} catch { /* a logging refusal (e.g. a second final) must not fail the live refine itself */ }
		}
		setTimeout(() => LiveRefine.open.delete(this.key), LiveRefine.DROP_AFTER_MS).unref?.();
	}
}
