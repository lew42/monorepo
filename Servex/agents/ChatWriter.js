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

	/* `find_sentence(key, at)`: the id of the sentence with that `at`, read from the session's file (used after a restart, when memory
	 * is empty). `find_message(key, at)`: the id of the Prompt MESSAGE that sentence was filed under, same source, same reason. */
	constructor({ find_sentence = () => null, find_message = () => null, last_id = () => null } = {}){
		this.find_sentence = find_sentence;
		this.last_id = last_id;   // the id of the newest message in the session's FILE (any writer's): `last_message_id`, read by Sessions
		this.find_message = find_message;
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
		if (!st) this.sessions.set(key, st = { open: null, open_prompt: null, last: null, held: [], by_at: new Map(), msg_at: new Map() });
		return st;
	}

	/** The Prompt message id an owner sentence with this `at` was filed under: tried from memory first (`msg_at`, like `by_at`),
	 * then from the file itself (`find_message`, same durability as `find_sentence` — survives a Servex restart). */
	message_for(key, at){ return this.state(key).msg_at.get(at) ?? this.find_message(key, at) ?? null; }

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
		const sentence = { id: sid, at: chat.at, text: chat.text, via: chat.via ?? "text", ...(chat.said_at ? { said_at: chat.said_at } : {}), ...(chat.raw ? { raw: chat.raw } : {}) };
		const prompt = chat.prompt ?? null;
		// Another writer (the item tool's cards, Refs, notes) may have added a message below the open Prompt: the FILE knows, `st.last` does not.
		const last = this.last_id(key) ?? st.last;
		if (st.open && last === st.open && st.open_prompt === prompt){
			st.msg_at.set(chat.at, st.open);
			if (st.msg_at.size > ChatWriter.KEEP) st.msg_at.delete(st.msg_at.keys().next().value);
			return { sentences: { add: sentence }, messages: { [st.open]: { sentences: { push: sid } } }, by: "servex", ts: now_iso() };
		}
		const mid = this.id("m");
		Object.assign(st, { open: mid, open_prompt: prompt, last: mid });
		st.msg_at.set(chat.at, mid);
		if (st.msg_at.size > ChatWriter.KEEP) st.msg_at.delete(st.msg_at.keys().next().value);
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

	/** The id of the message that is LAST in these session-file lines (text), or null when none: adds append, a `move` puts the Prompt after another, as List.move does. */
	static last_message_id(text){
		const order = [];
		for (const line of String(text ?? "").split("\n")){
			if (!line.includes('"messages"')) continue;
			let m; try { m = JSON.parse(line).messages; } catch { continue; }
			for (const a of [].concat(m?.add ?? [])) if (a?.id) order.push(a.id);
			const mv = m?.move;
			if (mv?.id){
				const from = order.indexOf(mv.id); if (from >= 0) order.splice(from, 1);
				const at = order.indexOf(mv.after);
				order.splice(at >= 0 ? at + 1 : order.length, 0, mv.id);
			}
		}
		return order.at(-1) ?? null;
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

	/* A Ref added to `session.messages` for a root task or child session (builder.md step 3): an inline subtask (no folder of its
	 * own) passes `path` ("tasks.<id>", the same file); a task with its own folder, or a spawned child session, passes `url` (its
	 * folder) and no `path` (the Ref then points at that file's root — Ref.js, "another file"). `by`/`at` are data ON the Ref
	 * (step 2: a chat Ref carries `by`/`at` the way a resurfaced one does), never only on the outer line. */
	static ref_line({ path, url } = {}){
		const at = now_iso();
		return { messages: { add: { type: "Ref", ...(url !== undefined ? { url } : { path }), by: "servex", at } }, by: "servex", ts: at };
	}

	/* The sent mark on the MESSAGE, not just the task (builder.md step 6): `sent.fast` / `sent.smart` land on the Prompt
	 * message that owns the owner line's sentence, so a view that never reads the Prompt TASK can still draw them (✓/🧠).
	 * `working` stays task-only for now — it is written directly by the smart seat through the item tool, on whichever
	 * Prompt (task or message) a future instruction names; Prompt.js (core/Session/Chat) already carries the field. */
	static sent_line(mid, to, at){
		return { messages: { [mid]: { sent: { [to]: { at } } } }, by: "servex", ts: now_iso() };
	}

	/** The line that sets one sentence's cleaned text on its Prompt, in place (used live by `place()` and by the migration). */
	static clean_line(mid, sid, text){ return { messages: { [mid]: { clean: { [sid]: String(text) } } } }; }

	/* A `{place}` line from the fast seat (ux/Dictate/doc/voice-assistant.md), as the line that updates the chat list: its cleaned
	 * `text` (edit "improve" or "both") becomes that sentence's cleaned text on the Prompt that holds it, IN PLACE: the Prompt keeps its
	 * position and its raw words. `session` is the replayed Session; null when there is no text, or no sentence with that `at`.
	 * Where the sentence goes is `move_line`'s job (below), never this one's. */
	static place(session, place){
		if (!place || !["improve", "both"].includes(place.edit) || !String(place.text ?? "").trim() || !place.re) return null;
		const s = [...(session?._sentences ?? [])].find(x => x.at === place.re);
		const p = s && session._messages?.messages.find(m => m.sentences?.includes?.(s.id));
		return p ? ChatWriter.clean_line(p.id, s.id, place.text) : null;
	}

	/* A `{place}` that starts a new topic (`to: "card"`, `where: "up"`) or names a message (`after`): the ONE `List.move` line
	 * that puts the Prompt holding that sentence after the last message (or after `place.after`). The same message moves, so no
	 * view ever sees a second copy; a view that gets this line moves its drawn node (ext/Chat/v3/ChatV3.js `moved`). null when
	 * nothing may move: `same`/`beside`/`inside`, no sentence with that `at`, the Prompt is already there, it holds other sentences, or a Reply already follows it. */
	static move_line(session, place){
		if (!place?.re || !(place.after || (place.to === "card" && place.where === "up"))) return null;
		const list = session?._messages?.messages ?? [], s = [...(session?._sentences ?? [])].find(x => x.at === place.re);
		const p = s && list.find(m => m.sentences?.includes?.(s.id));
		const after = place.after ?? list.at(-1)?.id;
		if (!p || !after || after === p.id || list[list.indexOf(p) - 1]?.id === after) return null;
		if (p.sentences.length > 1 || list.slice(list.indexOf(p) + 1).some(m => m.constructor.name === "Reply")) return null;   // moving it would take other sentences along, or put an answer above its question
		return { messages: { move: { id: p.id, after } } };
	}
}
