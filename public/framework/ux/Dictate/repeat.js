// Whisper sometimes loops inside one reply and says its last span twice. Drop a tail of MIN_WORDS+ words that repeats the span just before it.
export const MIN_WORDS = 5;

const norm = w => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const periodic = k => [1, 2].some(p => k.length > p && k.every((x, i) => x === k[i % p]));

export function collapse_tail(text){
	let w = String(text ?? "").trim().split(/\s+/).filter(Boolean);
	for (let again = true; again;){
		again = false;
		const k = w.map(norm);
		for (let n = Math.floor(w.length / 2); n >= MIN_WORDS; n--){
			if (periodic(k.slice(w.length - n))) continue;   // "yes yes yes …" is the speaker, not a loop
			let same = true;
			for (let i = 0; i < n && same; i++) same = k[w.length - n + i] === k[w.length - 2 * n + i];
			if (same){ w = w.slice(0, w.length - n); again = true; break; }
		}
	}
	return w.join(" ");
}
