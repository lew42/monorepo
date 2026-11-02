// V1Bubbles.js — turns `session.messages` into the same bubble list V1 draws from its `{chat}` lines (builder.md step 8: "V1 side
// by side"). V1 merges consecutive same-sender `{chat}` lines into one bubble when nothing else was drawn in between and the gap
// between them is under MERGE_GAP_MS, then slots each NEW bubble into time order (`ext/Chat/Chat.js`'s `mergeable()`/`put_line()`/
// `place()`, READ ONLY — this file never imports it, it only mirrors the rule as plain data so a node script can run it with no
// DOM). `Server/ChatV1Compare.mjs` calls `bubbles()` on BOTH this class's events and the `{chat}` lines' own events, through the
// SAME code, so a real difference between the two counts means the underlying data disagrees, not that two different orderings
// were used to read it.
//
// A `fix` (in-place correction) never makes its own bubble: it replaces the text of the piece it corrects, same as
// `Chat.js:787-791`'s `fix_index` lookup. The adapter never needs this path — a Prompt's `clean` map already holds the corrected
// text per sentence (`core/Session/Chat/readme.md`, "The fast seat's `{place}` lines"), so `events()` reads the corrected text
// directly. A `re`+`level` revision attaches to the piece it revises the same way; when that piece isn't in this run (the
// original scrolled off, or — on the adapter side — a Reply with `level` has no sentence-shaped original to attach to at all,
// `core/Session/Chat/Reply.js`), it shows as its own bubble with an empty sender, same as `Chat.js:804`.
import Prompt from "./Prompt.js";
import Message from "./Message.js";

export class V1Bubbles {
	static MERGE_GAP_MS = 8000;   // ext/Chat/Chat.js:12

	/** `at` as epoch ms, the same parse `put_line()` uses. */
	static ms(at){ return Date.parse(at ?? 0) || 0; }

	/** One atomic {id, sender, text, at} per owner sentence or assistant message, in the list's own order. The owner's sentence
	 * text is the CLEANED text where a `{place}` improve set one, same as a fix updates a V1 piece in place. */
	static events(session){
		const out = [];
		for (const m of session.messages.messages){
			if (m instanceof Prompt){
				const clean = m.clean;
				for (const s of m.sentence_items) out.push({ id: s.id, sender: "owner", text: clean[s.id] ?? s.text, at: V1Bubbles.ms(s.at) });
			} else if (m instanceof Message){   // Reply or a plain Message; a Ref is not a Message — V1 never draws one as a chat bubble
				out.push({ id: m.id, sender: m.by, text: m.text, at: V1Bubbles.ms(m.at) });
			}
		}
		return out;
	}

	/** The same shape, read straight from the session's own `{chat}` lines, plus the `fix`/`re`/`level` flags `bubbles()` needs. */
	static chat_events(lines){
		const out = [];
		for (const line of lines){
			const c = line?.chat;
			if (!c) continue;
			const sender = (c.from?.kind ?? "") === "owner" ? "owner" : (c.from?.id || c.from?.kind || "");
			out.push({ id: c.at, sender, text: c.text, at: V1Bubbles.ms(c.said_at ?? c.at), fix: !!c.fix, re: c.re ?? null, level: c.level ?? null });
		}
		return out;
	}

	/** `mergeable()`/`put_line()`/`place()`: a piece joins the sender's still-open bubble when nothing of another sender sits
	 * after it and the gap is under MERGE_GAP_MS (merging moves that bubble to the end, same as `put_line()`'s re-append); else a
	 * NEW bubble is made and slotted before the first existing bubble with a later `at` (`place()`), so a late-arriving line
	 * still lands in time order. A `fix` rewrites the text of the piece it names, in place, no new bubble; a `re`+`level`
	 * revision attaches to its piece the same way, or — if that piece isn't here — shows as its own, sender-less bubble. */
	static bubbles(events){
		const out = [], open = new Map(), by_id = new Map();
		const answered_below = b => { const i = out.indexOf(b); return i >= 0 && i < out.length - 1 && out.slice(i + 1).some(x => x.sender !== b.sender); };
		const insert = bubble => {
			let at = out.length;
			for (let j = out.length - 1; j >= 0; j--){ if (out[j].at <= bubble.at) break; at = j; }
			out.splice(at, 0, bubble);
		};
		for (const e of events){
			if (e.fix){ const hit = by_id.get(e.id); if (hit){ hit.text = e.text; continue; } insert({ sender: "", at: e.at, pieces: [{ ...e }] }); continue; }   // a correction for a line not here: its own bubble, as V1 draws it
			if (e.re && e.level){
				const hit = by_id.get(e.re);
				if (hit){ hit.revision = { text: e.text, level: e.level }; continue; }
				insert({ sender: "", at: e.at, pieces: [{ ...e }] });
				continue;
			}
			const last = open.get(e.sender), piece = { ...e };
			if (last && !answered_below(last) && e.at - last.at < V1Bubbles.MERGE_GAP_MS){
				last.pieces.push(piece);
				last.at = Math.max(last.at, e.at);
				by_id.set(e.id, piece);
				const i = out.indexOf(last);
				if (i !== out.length - 1){ out.splice(i, 1); out.push(last); }
				continue;
			}
			const bubble = { sender: e.sender, at: e.at, pieces: [piece] };
			open.set(e.sender, bubble);
			by_id.set(e.id, piece);
			insert(bubble);
		}
		return out;
	}

	/** The bubble list V1 draws if it read `session.messages` instead of `{chat}` lines. */
	static from_session(session){ return V1Bubbles.bubbles(V1Bubbles.events(session)); }
	/** The bubble list V1 actually draws today, from its own `{chat}` lines. */
	static from_chat_lines(lines){ return V1Bubbles.bubbles(V1Bubbles.chat_events(lines)); }
}

export default V1Bubbles;
