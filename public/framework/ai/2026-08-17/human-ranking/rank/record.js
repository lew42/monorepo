import { build } from "./rank.js";

const NOTE = "Mike's own best-to-worst ordering of the 18 frozen 1280x800 screenshots, by eye. "
	+ "Keyed by `hash` (sha256-16 of the PNG bytes), never by path: a page that changes gets a new hash "
	+ "and honestly falls out of this ranking rather than inheriting an old verdict. "
	+ "`order` and `pages` are DERIVED — the record is `verdicts` (consumed by a binary insertion sort) and "
	+ "`revisions` (pairs re-judged afterwards, applied by promoting `better` above `worse`, inert when it "
	+ "already is). Rebuild both with `build()` from rank/rank.js.";

/**
 * What lands on disk: a pure record of the pairs Mike judged, plus the order they
 * imply. Written on every pick, so the conclusion is in the repo with no submit
 * button and an interrupted session loses only the pick in flight.
 */
export function record(rows, state){
	const hashes = rows.map(r => r.hash);
	const built = build(hashes, state.verdicts, state.revisions);
	const url = hash => rows.find(r => r.hash === hash).url;

	return {
		note: NOTE,
		who: "mike",
		corpus: "framework/ai/2026-08-17/vision-baseline/baseline.json",
		started_at: state.started_at ?? null,
		updated_at: state.updated_at ?? null,
		complete: built.done,
		order: built.order,
		pages: built.order.map(url),
		verdicts: state.verdicts,
		revisions: state.revisions,
	};
}
