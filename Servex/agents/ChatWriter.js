/* ChatWriter.js — turns each V1 `{chat}` line into the line that keeps a voice session's real chat list current: `session.messages`
 * (a Chat of Prompt, Reply and Message) and `session.sentences` (public/framework/core/Session/Chat/readme.md). No fs: Sessions.js
 * appends what this returns through its own one writer (`write`), right after the V1 line, so V1 keeps reading exactly what it read.
 *
 * THE ORDER RULES (the owner, 2026-11-01, dictation-v3/owner-decisions.md #2):
 * - New dictation appends at the bottom. An owner sentence grows the open Prompt only while that Prompt is still the LAST message and
 *   the sentence belongs to the same Prompt task (`prompt`); otherwise it starts a new Prompt below. Nothing is ever inserted above.
 * - A reply never splits a message in progress. While the owner is mid-thought (the caller says so with `hold`), a reply waits here
 *   and is appended by `flush()` when the thought ends, after the owner's last sentence.
 *
 * One act is one line: an owner sentence is ONE line that adds the Sentence and adds or grows its Prompt (data-shapes synthesis §1 #7). */

const now_iso = () => new Date().toISOString();

export default class ChatWriter {
	static KEEP = 500;   // sentence `at`s remembered per session, for a reply's anchor; older ones are found by `find_sentence`

	/* `find_sentence(key, at)`: the id of the sentence with that `at`, read from the session's file (used after a restart, when memory is empty). */
	constructor({ find_sentence = () => null } = {}){
		this.find_sentence = find_sentence;
		this.sessions = new Map();   // key -> {open, open_prompt, last, held: [lines], by_at: Map(at -> sentence id)}
		this.last_ms = new Map();    // id prefix -> last ms used
	}

	// A short, ordered, unique id: "s-<ms>" / "m-<ms>", bumped when two are made in the same millisecond (as PromptLines does).
	id(prefix){
		const at = Math.max(Date.now(), (this.last_ms.get(prefix) ?? 0) + 1);
		this.last_ms.set(prefix, at);
		return `${prefix}-${at}`;
	}

	state(key){
		let st = this.sessions.get(key);
		if (!st) this.sessions.set(key, st = { open: null, open_prompt: null, last: null, held: [], by_at: new Map() });
		return st;
	}

	/** The lines to write for one V1 chat line (`chat` = the object under the `chat` key). `hold`: the owner is mid-thought. */
	mirror(key, chat, { hold = false } = {}){
		if (!chat || typeof chat !== "object" || !String(chat.text ?? "").trim()) return [];
		if (chat.from?.kind === "owner") return [this.owner(key, chat)];
		const line = this.reply(key, chat);
		if (hold){ this.state(key).held.push(line); return []; }
		return [this.place(key, line)];
	}

	/** An owner sentence: the Sentence, and the Prompt it starts or grows. */
	owner(key, chat){
		const st = this.state(key), sid = this.id("s");
		st.by_at.set(chat.at, sid);
		if (st.by_at.size > ChatWriter.KEEP) st.by_at.delete(st.by_at.keys().next().value);
		const sentence = { id: sid, at: chat.at, text: chat.text, via: chat.via ?? "text", ...(chat.raw ? { raw: chat.raw } : {}) };
		const prompt = chat.prompt ?? null;
		if (st.open && st.last === st.open && st.open_prompt === prompt)
			return { sentences: { add: sentence }, messages: { [st.open]: { sentences: { push: sid } } }, by: "servex", ts: now_iso() };
		const mid = this.id("m");
		Object.assign(st, { open: mid, open_prompt: prompt, last: mid });
		return { sentences: { add: sentence }, messages: { add: { type: "Prompt", id: mid, by: "owner", at: chat.at, sentences: [sid], ...(prompt ? { prompt } : {}) } }, by: "servex", ts: now_iso() };
	}

	/** An assistant's or Servex's line, as a Reply or a plain Message (not yet placed: `place` gives it its id and position). */
	reply(key, chat){
		const system = chat.from?.kind !== "assistant";
		const to = chat.re ? this.state(key).by_at.get(chat.re) ?? this.find_sentence(key, chat.re) : null;
		return { type: system ? "Message" : "Reply", by: system ? "system" : chat.from?.id ?? "assistant", at: chat.at, text: chat.text,
			...(to ? { re: { to } } : {}), ...(chat.level ? { level: chat.level } : {}), ...(chat.thread ? { thread: true } : {}) };
	}

	// Appended now, at the bottom: the open Prompt is no longer last, so the owner's next sentence starts a new one below it.
	place(key, msg){
		const st = this.state(key), id = this.id("m");
		st.last = id;
		return { messages: { add: { id, ...msg } }, by: "servex", ts: now_iso() };
	}

	/** The thought ended: every held reply, in the order it arrived, as lines to write now. */
	flush(key){
		const st = this.sessions.get(key);
		if (!st?.held.length) return [];
		const out = st.held.map(msg => this.place(key, msg));
		st.held = [];
		return out;
	}

	held(key){ return this.sessions.get(key)?.held.length ?? 0; }

	/* A `{place}` line from the fast seat (ux/Dictate/doc/voice-assistant.md), as the line that updates the chat list: its cleaned
	 * `text` (edit "improve" or "both") becomes that sentence's cleaned text on the Prompt that holds it, IN PLACE: the Prompt keeps its
	 * position and its raw words. `session` is the replayed Session; null when there is no text, or no sentence with that `at`.
	 * Where the sentence goes (`to`, `where`) is not mirrored: the list's order never changes. */
	static place(session, place){
		if (!place || !["improve", "both"].includes(place.edit) || !String(place.text ?? "").trim() || !place.re) return null;
		const s = [...(session?._sentences ?? [])].find(x => x.at === place.re);
		const p = s && session._messages?.messages.find(m => m.sentences?.includes?.(s.id));
		return p ? { messages: { [p.id]: { clean: { [s.id]: String(place.text) } } } } : null;
	}
}
