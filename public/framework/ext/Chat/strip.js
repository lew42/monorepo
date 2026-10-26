// Fuzzy word-level alignment behind the mic's own already-sent dedup (ext/Chat/Mic.js). Pure, no DOM, so it is
// node-testable the same way ux/Dictate/repeat.js is: doc/mic-notes.md#strip_words-duplicate-bubble, doc/duplicate-bubbles.md.

const norm = w => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

function lev(a, b){
	let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
	for (let i = 1; i <= a.length; i++){
		const cur = [i];
		for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
		prev = cur;
	}
	return prev[b.length];
}

// strip_words's own word match: byte-for-byte what it was before this task (plain edit distance, no extra
// tolerance). `same_as_last_send` calls `strip_words` for its duplicate-send check and must stay exactly this
// strict (review, 2026-10-25) — a false "same words" there silently drops a real, distinct message, so the looser
// match below is never shared with it.
const word = (a, b) => a === b ? 0 : Math.min(1, lev(a, b) / Math.max(a.length, b.length, 1));

/** `text` minus the words `sent` already covers at its start, fuzzy-matched. see doc/mic-notes.md#strip_words-duplicate-bubble */
export function strip_words(text, sent){
	const tw = text.split(/\s+/).filter(Boolean), sw = sent.split(/\s+/).filter(Boolean);
	const T = tw.map(norm), S = sw.map(norm);
	const D = Array.from({ length: S.length + 1 }, (_, i) => Array(T.length + 1).fill(i));
	for (let j = 0; j <= T.length; j++) D[0][j] = j;
	for (let i = 1; i <= S.length; i++) for (let j = 1; j <= T.length; j++)
		D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + word(S[i - 1], T[j - 1]));
	// Match all of `sent` to the front of `text`, or all of `text` to the front of `sent`.
	let best = null;
	const consider = (i, j) => {
		if (!i || !j) return;
		const score = D[i][j] / Math.max(i, j);
		if (score > 0.35 || (best && (score > best.score || (score === best.score && j <= best.j)))) return;
		best = { score, i, j };
	};
	for (let j = 1; j <= T.length; j++) consider(S.length, j);
	for (let i = 1; i <= S.length; i++) consider(i, T.length);
	return best ? tw.slice(best.j).join(" ") : text;
}

// Whisper chopping the start of a word on a fresh segment ("ssion.jsonl" for "session.jsonl"): one word counts as
// the other, missing up to two leading or trailing characters, never for a word under 3 characters (too easy to
// coincide: "it"/"bit" never counts). Scoped to `strip_sent`'s own fallback below, never `strip_words` — that
// keeps `same_as_last_send` exactly as strict as it was before this task.
function chopped(a, b){
	if (!a || !b) return false;
	const [short, long] = a.length <= b.length ? [a, b] : [b, a];
	return short.length >= 3 && long.length - short.length <= 2 && long.endsWith(short);
}
const word_tolerant = (a, b) => a === b ? 0 : chopped(a, b) ? 0 : word(a, b);

/** `strip_words`, but for a `text`/`sent` pair KNOWN to describe the SAME spoken segment: the mic's own
 * guess-already-sent dedup (`close_segment`/`commit`/`build_tail`'s `dropped`/`item.sent`), never the generic
 * "are these two sends the same" check — that stays on plain `strip_words` via `same_as_last_send`, where guessing
 * wrong would drop an unrelated message.
 *
 * `strip_words` can fail here: Whisper's final sometimes re-words the segment enough (or chops the start of a
 * word) that the edit distance over the WHOLE matched span misses the 0.35 threshold, and the whole already-sent
 * text goes out again (doc/duplicate-bubbles.md, cause 1 — the 2026-10-25 regression this reproduces). This tries
 * one more thing first: line up just the LAST words of `sent` against an early span of `text` (they should recur
 * even when everything before them was reworded too much to score) and cut through there.
 *
 * If NOTHING lines up either, `text` comes back UNCHANGED — never guessed away. An earlier version of this
 * dropped a duplicate-looking prefix on the theory that a lost phrase is cheaper than a resent one; review
 * (2026-10-25) found it could just as easily eat words that were never sent at all, which is real speech lost for
 * good, not a cosmetic repeat. Missing one dedup (one duplicate bubble, the original failure this file fixes
 * everywhere it CAN confidently tell) is the safe side to fail on; losing a sentence is not. */
export function strip_sent(text, sent){
	const stripped = strip_words(text, sent);
	if (stripped !== text) return stripped;   // a confident match: trust it as before
	const tw = text.split(/\s+/).filter(Boolean), sw = sent.split(/\s+/).filter(Boolean);
	const T = tw.map(norm), S = sw.map(norm);
	if (!S.length || !T.length) return text;
	// The LAST k words of `sent` against the FIRST k words of `text`, largest k first: the overlap always sits at
	// the very front of a re-worded final (Whisper restates its own tail going forward, never mid-text), so this
	// finds the longest genuine overlap before any shorter, coincidental one (a stray "if it's" deeper in) can win.
	for (let k = Math.min(S.length, T.length); k >= 2; k--){
		const tail = S.slice(-k), head = T.slice(0, k);
		if (tail.every((w, i) => word_tolerant(w, head[i]) === 0)) return tw.slice(k).join(" ");
	}
	return text;
}
