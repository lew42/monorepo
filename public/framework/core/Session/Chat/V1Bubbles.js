// V1Bubbles.js — turns `session.messages` into the same bubble list V1 draws from its `{chat}` lines (builder.md step 8: "V1 side
// by side"). V1 merges consecutive same-sender `{chat}` lines into one bubble when nothing else was drawn in between and the gap
// between them is under MERGE_GAP_MS (`ext/Chat/Chat.js`'s `mergeable()`/`put_line()`, READ ONLY — this file never imports it, it
// only mirrors the rule as plain data so a node script can run it with no DOM). `Server/ChatV1Compare.mjs` calls `bubbles()` on
// BOTH this class's events and the `{chat}` lines' own events, so a real difference between the two counts means the underlying
// data disagrees, not that two different algorithms were used to read it.
//
// Known simplification (documented, not fixed here — `doc/pseudo-properties.md`, "How V1 switches over"): a `{chat}` line that is
// a `fix` (in-place correction) or a `re`+`level` revision never makes its own V1 bubble UNLESS the piece it corrects has already
// scrolled off; this reader always treats it as "the original is still on screen" and drops it. A Reply mirrored with the same
// `level` IS a real message on the adapter side, so a revision can show as one extra bubble on the adapter and not on V1 — a real
// difference the compare tool is for finding, not a bug in either reader.
import Prompt from "./Prompt.js";
import Message from "./Message.js";

export class V1Bubbles {
	static MERGE_GAP_MS = 8000;   // ext/Chat/Chat.js:12

	/** `at` as epoch ms, the same parse `put_line()` uses. */
	static ms(at){ return Date.parse(at ?? 0) || 0; }

	/** One atomic {sender, text, at, id} per owner sentence or assistant message, in the list's own order. */
	static events(session){
		const out = [];
		for (const m of session.messages.messages){
			if (m instanceof Prompt){
				for (const s of m.sentence_items) out.push({ id: s.id, sender: "owner", text: s.text, at: V1Bubbles.ms(s.at) });
			} else if (m instanceof Message){   // Reply or a plain Message; a Ref is not a Message — V1 never draws one as a chat bubble
				out.push({ id: m.id, sender: m.by, text: m.text, at: V1Bubbles.ms(m.at) });
			}
		}
		return out;
	}

	/** The same shape, read straight from the session's own `{chat}` lines (what `chat_line()`/`put_line()` merge). */
	static chat_events(lines){
		const out = [];
		for (const line of lines){
			const c = line?.chat;
			if (!c) continue;
			if (c.fix || (c.re && c.level)) continue;   // an in-place correction or revision never makes its own bubble (Chat.js:787,797)
			const sender = (c.from?.kind ?? "") === "owner" ? "owner" : (c.from?.id || c.from?.kind || "");
			out.push({ id: c.at, sender, text: c.text, at: V1Bubbles.ms(c.said_at ?? c.at) });
		}
		return out;
	}

	/** `mergeable()`/`put_line()`: a piece joins the LAST bubble when the sender matches and the gap is under MERGE_GAP_MS — in a
	 * sequential replay the last bubble is always the only candidate, because the moment something else is appended after it,
	 * V1's own `answered_below()` closes it for merging too. */
	static bubbles(events){
		const out = [];
		for (const e of events){
			const last = out.at(-1);
			if (last && last.sender === e.sender && e.at - last.at < V1Bubbles.MERGE_GAP_MS){
				last.pieces.push(e);
				last.at = Math.max(last.at, e.at);
			} else out.push({ sender: e.sender, at: e.at, pieces: [e] });
		}
		return out;
	}

	/** The bubble list V1 draws if it read `session.messages` instead of `{chat}` lines. */
	static from_session(session){ return V1Bubbles.bubbles(V1Bubbles.events(session)); }
	/** The bubble list V1 actually draws today, from its own `{chat}` lines. */
	static from_chat_lines(lines){ return V1Bubbles.bubbles(V1Bubbles.chat_events(lines)); }
}

export default V1Bubbles;
