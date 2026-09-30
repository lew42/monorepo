/* Folding public/framework/ai/asks.jsonl — latest line wins, same shape every
 * reader agrees on. Plain functions, no DOM, no imports: this file runs
 * straight in the browser (a page reads the static asks.jsonl with it) and in
 * node (Servex/asks/Asks.js imports it by relative path). Never import
 * `/app.js` here — that is what "pure" means for this file.
 *
 * Each line in the ledger is `{"ask": {...}}`. The first line for an id is the
 * ROUTE: `at` (when it was routed), `title`, `words` (the brief file), `owner`
 * (the agent id), `card`, `status` ("routed"). A later line is a STATUS
 * UPDATE, written by `Asks.mark()`: `{id, status, why, by, at}`, plus `card` or `words` when it corrects a route. Anything that
 * isn't `{"ask": {...}}` (a stray blank line, a line for another ledger) is
 * skipped. */

/** An ask's id: what it already carries, or a short kebab slug of its title —
 * lowercase, every run of non-alphanumeric characters becomes one `-`, no
 * leading or trailing `-`, at most 48 characters. `mark.mjs` needs something
 * typeable, and the 16 lines already in the ledger have no `id` field at all,
 * so this is what makes them addressable. */
export function ask_id(ask){
	if (ask && ask.id) return ask.id;
	const title = (ask && ask.title) || "";
	return String(title)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 48)
		.replace(/-+$/g, "");
}

/** `lines` is the ledger file already split and JSON-parsed, one object per
 * line, oldest first. Returns one object per ask id: the ROUTE line's fields
 * as the base, with every later line's `status`, `why` and `by` overwriting
 * it (latest wins) — except its `at`, which becomes `status_at` instead, so
 * the ask keeps BOTH "when it was first routed" (`at`) and "when its status
 * last changed" (`status_at`). Every line seen for the id, in order, is also
 * kept as `history: [{status, why, by, at}]`, so a reader can show the whole
 * trail, not just where it landed. */
export function fold_asks(lines){
	const out = {};
	for (const line of lines ?? []){
		const ask = line && typeof line === "object" && !Array.isArray(line) ? line.ask : null;
		if (!ask || typeof ask !== "object") continue;
		const id = ask_id(ask);
		if (!id) continue;

		// An update for an id never routed (a typo'd id, written by hand) has no title or owner:
		// skip it, or it shows up as a phantom "Untitled ask".
		if (!out[id] && !ask.title) continue;
		if (!out[id]) out[id] = { ...ask, id, history: [] };
		else {
			if (ask.status !== undefined) out[id].status = ask.status;
			if (ask.why !== undefined) out[id].why = ask.why;
			if (ask.by !== undefined) out[id].by = ask.by;
			if (ask.at !== undefined) out[id].status_at = ask.at;
			// A route written with a wrong card or words path is corrected by a later line that
			// carries the right one (or "" for none) — the ledger never rewrites the first line.
			if (ask.card !== undefined) out[id].card = ask.card;
			if (ask.words !== undefined) out[id].words = ask.words;
		}
		out[id].history.push({ status: ask.status ?? null, why: ask.why ?? null, by: ask.by ?? null, at: ask.at ?? null });
	}
	return out;
}
