import AISession from "./AISession.js";

/**
 * class PromptLog — the prompts of one session, kept in that session's own folder as `prompts.jsonl`
 * (append only; the owner's design, `ext/Refine/doc/vision-2026-10-08.md` addendum 3). One file for
 * the whole session, because a session can hold hundreds of prompts. Every line belongs to one
 * prompt (`prompt` = its id) and is one STAGE of it:
 *
 *   raw      { text, source }                       what arrived. IMMUTABLE: a second raw for the same prompt is refused.
 *   clean    { sentences: ["…", "…"], final }       near-verbatim sentences. Sentence i is `sentences[i]`, cited as index i.
 *                                                    While `final` is false a later clean line replaces it; once a
 *                                                    final one is written the clean is set in stone and more are refused.
 *   refined  { subject, cards: [{ title|text, cites: [0, 2], cards: [...] }] }   cards cite clean indexes. Later wins.
 *   notes    { notes: [{ i, clarity, why, alternates, names, tags }] }          the Haiku pass, per sentence index. Later wins.
 *   parts    { process, parts: [{ id, cites: [0, 2], kind, text, outcome: { is, ref, why }, parts: [...] }] }
 *                                                    THE RECORD: what each run of sentences meant and what came of it. Later wins.
 *                                                    `Prompt` computes completion from it (ext/Refine/doc/prompt-records.md).
 *   handled  { to, note }                            whoever routed the prompt's proposals marked it handled. Later wins.
 *
 *   await PromptLog.add(session_id, { prompt: id, stage: "raw", text }, "refine");   // node only; stamps at/by/session
 *   const prompts = PromptLog.fold(await PromptLog.read(session_id));                // browser or node: { id → prompt }
 *   prompts[id].clean   // ["sentence 0", …]     prompts[id].refined, .notes, .raw, .final
 *
 * `fold()` is also how a replay of a saved session becomes a `Prompt` (`ext/Refine/Prompt.js` `Prompt.from_log`).
 * Sessions page tail: the same file, read with `AISession.read_text`, so a page can follow it live.
 */
export default class PromptLog {

	static FILE = "prompts.jsonl";
	static STAGES = {
		raw:     l => typeof l.text === "string" && l.text.length > 0,
		clean:   l => Array.isArray(l.sentences) && l.sentences.every(s => typeof s === "string"),
		refined: l => Array.isArray(l.cards),
		notes:   l => Array.isArray(l.notes) && l.notes.every(n => Number.isInteger(n?.i) && n.i >= 0),
		parts:   l => Array.isArray(l.parts) && l.parts.every(function ok(p){ return typeof p?.text === "string" && Array.isArray(p.cites) && p.cites.every(Number.isInteger) && (!p.parts || p.parts.every(ok)); }),
		handled: l => typeof (l.to ?? l.note) === "string",
	};

	/** Validate and append one line. Returns the stored line, or throws with the reason. Node only. */
	static async add(id, line, by, dir = null){   // dir: the session folder when the caller already knows it (PromptRecords); else located
		if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("session id must be the 36-character session uuid");
		if (!by || typeof by !== "string") throw new Error("`by` (the author) is required");
		if (typeof line.prompt !== "string" || !line.prompt) throw new Error("`prompt` (the prompt id) is required");
		const check = PromptLog.STAGES[line.stage];
		if (!check) throw new Error("`stage` is one of: " + Object.keys(PromptLog.STAGES).join(", "));
		if (!check(line)) throw new Error(`bad shape for stage "${line.stage}" (see ai/AISession/PromptLog.js)`);
		const seen = PromptLog.fold(dir ? await PromptLog.read_dir(dir) : await PromptLog.read(id))[line.prompt];
		if (line.stage === "raw" && seen?.raw != null) throw new Error("raw is immutable: this prompt already has one");
		if (line.stage === "clean" && seen?.final) throw new Error("clean is final: this prompt's sentences are set");
		if (line.stage !== "raw" && seen?.raw == null) throw new Error("write the raw line first");
		const fs = await import("node:fs/promises");
		dir ??= await AISession.locate(id, undefined, id);   // folder named by the uuid, so a later scan always finds it
		await fs.mkdir(dir, { recursive: true });
		const out = { ...line, at: new Date().toISOString(), by, session: id };
		await fs.appendFile(new URL(PromptLog.FILE, dir), JSON.stringify(out) + "\n");
		return out;
	}

	/** Node: the lines of the prompt log in a known folder (a file URL or path). */
	static async read_dir(dir){
		const fs = await import("node:fs/promises");
		try { return AISession.lines_of(await fs.readFile(new URL(PromptLog.FILE, dir), "utf8")); } catch { return []; }
	}

	/** Every line of the session's prompt log, in order ([] when it has none). Browser or node. */
	static async read(id){
		return AISession.lines_of(await AISession.read_text(id, PromptLog.FILE));
	}

	/** Lines to prompts: `{ id → { id, raw, source, ref, clean, final, refined, subject, notes, parts, process, handled, at } }`, in first-seen order. */
	static fold(lines){
		const out = {};
		for (const l of lines){
			const p = out[l.prompt] ??= { id: l.prompt, raw: null, source: "", ref: null, clean: [], final: false, refined: [], subject: "", notes: [], parts: [], process: "", handled: null, at: l.at };
			if (l.stage === "raw"){ p.raw = l.text; p.source = l.source ?? ""; p.ref = l.ref ?? null; }
			else if (l.stage === "clean" && !p.final){ p.clean = l.sentences; p.final = !!l.final; }
			else if (l.stage === "refined"){ p.refined = l.cards; p.subject = l.subject ?? ""; }
			else if (l.stage === "notes") p.notes = l.notes;
			else if (l.stage === "parts"){ p.parts = l.parts; p.process = l.process ?? ""; if (l.subject && !p.subject) p.subject = l.subject; }
			else if (l.stage === "handled") p.handled = { to: l.to ?? "", note: l.note ?? "", by: l.by, at: l.at };
		}
		return out;
	}

	/** A fresh prompt id: sortable by time, unique enough inside one session. */
	static new_id(){ return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
}
