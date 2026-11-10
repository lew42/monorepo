/* A "done" report with every timestamp, uuid and long hex id blanked out — so `Agents.wake_parent`'s
 * duplicate check (step 4, one place per conversation, 2026-11-09) catches "Idle and blocked, no change
 * since 09:14" repeating verbatim at 09:19 with only the clock different, without also catching two
 * reports that happen to share a sentence but differ anywhere else.
 *
 * Its own file, not a method on Agents.js: Agents.js's first import is the Claude SDK package, so any test
 * of this one pure function would otherwise need that package installed too. */
export function strip_marks(text){
	return String(text ?? "")
		.replace(/\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?\b/g, "<at>")
		.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "<id>")
		.replace(/\b[0-9a-f]{10,}\b/gi, "<id>")
		.trim();
}
