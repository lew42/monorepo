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

/** The offset right after the newest fast chunk — the ✓ cursor's spot. For a settled piece of text this
 * is always the end of the whole string (the newest chunk is whatever is left after the last cut, by
 * definition), but it goes THROUGH `fast_chunks()` rather than assuming `text.length` (review finding 8,
 * 2026-10-25: nothing in production called `fast_chunks()` before this). 0 for empty text. */
export function last_fast_chunk_end(text){
	text = String(text ?? "");
	const chunks = fast_chunks(text);
	return chunks.length ? text.length : 0;
}

/** The offset right after the last FINISHED sentence in `text` (0 if none has ended yet). Walks forward
 * through the split sentences and sums their lengths, so a repeated final sentence ("Yes. And yes.
 * And yes.") lands on the real last one instead of `lastIndexOf` matching an earlier occurrence (review
 * finding 9, 2026-10-25). */
export function last_finished_sentence_end(text){
	text = String(text ?? "");
	let pos = 0, end = 0;
	for (const s of split(text).filter(ends_sentence)){
		const idx = text.indexOf(s, pos);
		if (idx < 0) continue;
		end = idx + s.length;
		pos = end;
	}
	return end;
}
