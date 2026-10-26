// chunks.js — the two chunk levels the moving cursors track (the owner, 2026-10-25). Pure, no imports but
// the one shared sentence splitter, so "a sentence" means the same thing everywhere (core/Task/sentences.js).
// Fast: cut at comma, period, question mark, "!" — a finer grain than a whole sentence.
// Smart: sentences only — never a comma, the same rule as WakePolicy's sentence_count.
import split from "../../core/Task/sentences.js";

/** Every fast chunk in `text`, in order, trailing punctuation kept; an unfinished tail is its own last chunk. */
export function fast_chunks(text){
	return String(text ?? "").split(/(?<=[,.!?…])\s+/).map(s => s.trim()).filter(Boolean);
}

/** True when `text` ends with a sentence-ending mark (Mic.js's ends_sentence(), the same rule). */
export function ends_sentence(text){ return /[.!?…]["')\]]*\s*$/.test(String(text ?? "")); }

/** The offset right after the last FINISHED sentence in `text` (0 if none has ended yet). */
export function last_finished_sentence_end(text){
	text = String(text ?? "");
	const last = split(text).filter(ends_sentence).at(-1);
	if (!last) return 0;
	const idx = text.lastIndexOf(last);
	return idx < 0 ? text.length : idx + last.length;
}
