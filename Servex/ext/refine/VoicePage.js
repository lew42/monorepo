import { page_tools } from "../../agents/page_tools.js";
import { quick_clean } from "../../../public/framework/ext/Refine/engine.js";
import Outline from "../../../public/framework/ext/Refine/Outline.js";
import Compose from "../../../public/framework/ext/Refine/stages/Compose.js";

/**
 * class VoicePage — writes ONE spoken prompt onto a session's page, stage by stage, through the page tools
 * (`page_add` once, then `page_set` deltas on the item). Every open tab on `/framework/ai/sessions/<session>/`
 * redraws within about 100 ms of each write (the JSONL tail), so nothing polls.
 *
 *   const v = VoicePage.get(session, prompt_id);
 *   await v.raw("so the page should", { source: "dictated" });   // call as often as you like while talking
 *   await v.raw(full_text, { final: true });
 *   await v.clean(sentences, { ms });  await v.structured(md, { ms });  await v.notes(notes, { ms });
 *
 * Writes are queued per prompt so deltas land in the order they were made. The browser half is
 * `public/framework/ext/Refine/stages/` (VoiceFlow); format and decisions: that folder's `doc/voice-to-page.md`.
 */
export default class VoicePage {

	static open = new Map();   // "session/prompt" -> VoicePage, dropped when the prompt is done
	static tools = null;
	static listeners = new Set();   // (session, line) => void: the read-only stream a phone follows (GET /api/voice/stream)

	/** Every line this session's open prompts have written, in order: what a late-joining follower replays. */
	static lines(session){ return [...VoicePage.open.values()].filter(v => v.session === session).flatMap(v => v.lines); }

	static get(session, prompt, by){
		const key = session + "/" + prompt;
		if (!VoicePage.open.has(key)) VoicePage.open.set(key, new VoicePage({ session, prompt, by }));
		return VoicePage.open.get(key);
	}

	constructor({ session, prompt, by = "voice" }){
		this.session = session; this.prompt = prompt; this.by = by;
		this.id = "voice-" + prompt;
		this.path = `/framework/ai/sessions/${session}/`;
		this.created = false;
		this.queue = Promise.resolve();
		this.ms = {};
		this.cost = {};
		this.sentences = [];
		this.lines = [];
		this.parsed = null;
	}

	/** One tool call as a plain object; the tools answer a JSON string. */
	async tool(name, args){
		VoicePage.tools ??= Object.fromEntries(page_tools().map(t => [t.name, t]));
		const raw = await VoicePage.tools[name].handler(args, { caller: this.by });
		if (name === "page_read") return raw;   // plain markdown, not JSON
		const out = JSON.parse(raw);
		if (!out.ok) throw new Error(out.why ?? "page tool refused");
		return out;
	}

	/** Queue one delta. The first ever delta for this prompt adds the item; the rest set fields on it. */
	write(delta){
		const first = this.lines.length === 0;
		const line = first ? { content: { add: { id: this.id, type: "voice-prompt", ...delta } } } : { [this.id]: delta };
		this.lines.push(line);
		clearTimeout(this.idle); this.idle = setTimeout(() => VoicePage.open.delete(this.session + "/" + this.prompt), 600000); this.idle.unref?.();   // a dictation never refined is forgotten 10 min after its last word
		for (const fn of VoicePage.listeners) try { fn(this.session, line); } catch {}
		const run = async () => {
			if (!this.created){
				this.created = true;
				const seen = await this.tool("page_read", { path: this.path }).catch(() => "");
				if (!String(seen).includes(`[${this.id}]`)) return this.tool("page_add", { path: this.path, item: { id: this.id, type: "voice-prompt", ...delta } });
			}
			return this.tool("page_set", { path: this.path, target: [this.id], delta });
		};
		return this.queue = this.queue.then(run, run);
	}

	/** The words so far. Also writes the instant mechanical clean (no model) so stage 2 moves with the voice. */
	raw(text, { final = false, source } = {}){
		if (!final && this.raw_closed_at && Date.now() - this.raw_closed_at < 3000) return this.queue;   // a late partial must not reopen words that were already finalised
		if (final){ this.raw_closed_at = Date.now(); clearTimeout(this.pending_timer); this.pending_timer = null; return this.raw_write(text, true, source); }
		// Partials are coalesced to one write per 700 ms: page.jsonl is replayed on every load, so it must not grow with every 150 ms post.
		const wait = 700 - (Date.now() - (this.last_partial ?? 0));
		if (wait > 0){
			this.pending = [text, source];
			this.pending_timer ??= setTimeout(() => { this.pending_timer = null; const [t, src] = this.pending; this.raw_write(t, false, src); }, wait);
			return this.queue;
		}
		return this.raw_write(text, false, source);
	}

	raw_write(text, final, source){
		this.last_partial = Date.now();
		const sentences = this.clean_final ? null : quick_clean(text).map(s => s.text);
		return this.write({ text: text.slice(0, 400), raw: text, raw_final: final, status: final ? "Cleaning" : "Hearing you", ...(source ? { source } : {}), ...(sentences ? { clean: sentences, clean_final: false } : {}) });
	}

	/** `final: false` is a live update (some sentences cleaned, the rest still the draft); `cost` is dollars the model spent on this stage, shown beside its time. */
	clean(sentences, { ms, cost, final = true } = {}){
		this.sentences = sentences;
		if (!final) return this.write({ clean: sentences, clean_final: false, ...(cost != null ? { cost: { ...this.cost, clean: cost } } : {}) });
		this.clean_final = true; this.ms.clean = ms; if (cost != null) this.cost.clean = cost;
		return this.write({ clean: sentences, clean_final: true, ms: { ...this.ms }, cost: { ...this.cost }, status: "Structuring" });
	}

	structured(md, { ms, cost } = {}){
		this.parsed = Outline.parse(md); this.ms.structure = ms; if (cost != null) this.cost.structure = cost;
		const refined = Compose.brief(this.parsed);
		this.ms.refined = 0;
		return this.write({ structure: md, subject: this.parsed.subject, refined, cards: Compose.cards(this.parsed), ms: { ...this.ms }, cost: { ...this.cost }, status: "Checking clarity" });
	}

	/** The Haiku pass landed: cards get their clarity flags and tags. */
	notes(notes, { ms } = {}){
		this.ms.cards = ms;
		return this.write({ ...(this.parsed ? { cards: Compose.cards(this.parsed, notes) } : {}), ms: { ...this.ms }, status: "done" });
	}

	failed(why){ return this.write({ error: String(why).slice(0, 200) }); }

	/** Forget this prompt a minute from now (the delay absorbs a straggling partial post). */
	done(){ setTimeout(() => VoicePage.open.delete(this.session + "/" + this.prompt), 60000).unref(); }
}
