/* The rules pass `marks()` falls back to when Servex's `/api/hitl` isn't up (it goes
 * live only after a later restart — see readme.md) or answers `ok:false`. The
 * production site is static, so THIS is what a real visitor sees, not a placeholder:
 * a plain, honest rule — a sentence carrying a hedge word ("maybe", "some", "I guess"…)
 * is marked unclear; anything else reads as one clear statement. Never as sharp as the
 * real assistant, but it never crashes and never claims to be live when it isn't. */
const HEDGES = /\b(maybe|kind of|sort of|some|i guess|not sure|possibly|ambiguity|could be|might|or (is it|maybe))\b/i;

export function fixture_marks(sentences){
	return sentences.map((text, i) => {
		const s = text.trim();

		if (HEDGES.test(s)){
			return {
				i, mark: "unclear",
				purpose: "A hedge word (\"maybe\", \"some\", \"I guess\"…) leaves more than one reading open.",
				question: {
					ask: `"${s}" — take that literally, or as a rough idea to refine together?`,
					options: ["Literally, as written", "A rough idea — help me refine it"],
				},
			};
		}

		return { i, mark: "ok", purpose: "Reads as one clear, unambiguous statement." };
	});
}
