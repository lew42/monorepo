/**
 * THE FOLD — a log of typed events in, the things a reader looks at out.
 *
 * Nothing in the log is ever edited. A task's title changes by appending
 * another `task` event carrying the same id; a name changes by appending a
 * `rename`. `fold()` replays the whole file, in order, and hands back the
 * current shape of every task, name, decision, proposal, prompt, card and ask.
 *
 * Two rules do almost all of the work:
 *
 *   1. NEWEST WINS, merged field by field — a later event carrying the same id
 *      corrects the fields it names and leaves the rest alone.
 *   2. A NAME IS THE EXCEPTION: the FIRST name for an id is the visible one.
 *      Later names are alternatives. The fast assistant names things in
 *      seconds and its name is the one the owner sees; a mastermind that
 *      disagrees adds a suggestion beside it, it does not silently swap it.
 *
 * `approve` locks a thing: after it, every further name, rename or dispute is
 * recorded as an alternative and the approved value stays visible.
 *
 * Run it over the sample: see fold/page.js, or in this page's console,
 *   fold(sample).names["live-board"]
 *
 * Streaming transcript text (`delta`, `transcript`) is read forward by the UI
 * as it arrives, not folded — the fold is for the things that settle.
 */
export function fold(entries){
	const bins = { prompt: "prompts", refined: "refined", proposal: "proposals",
		name: "names", task: "tasks", decision: "decisions", card: "cards", ask: "asks" };
	const out = { prompts: {}, refined: {}, proposals: {}, names: {},
		tasks: {}, decisions: {}, cards: {}, asks: {}, orphans: [] };

	// Every id the fold has met, whichever bin it lives in, so `re` can find it.
	const all = new Map();
	const thing = (bin, id) => {
		if (!all.has(id)) all.set(id, out[bin][id] = { id, alternatives: [], children: [], history: [] });
		return all.get(id);
	};

	for (const e of entries){
		const bin = bins[e.type];
		if (bin){
			const t = thing(bin, e.id);
			t.history.push(e);
			// An alternative never replaces what is visible: it waits beside it.
			if (t.locked || e.alt || (e.type === "name" && t.named)) t.alternatives.push(e);
			else Object.assign(t, e);
			if (e.type === "name") t.named = true;
		}

		for (const id of [].concat(e.re ?? [])){
			const t = all.get(id);
			if (!t) { out.orphans.push(e); continue; }   // nothing is ever silently dropped
			t.children.push(e);
			if (e.type === "intent") t.now = e.msg;
			if (e.type === "card") t.seen = true;         // a card is the owner's screen
			if (e.type === "approve") Object.assign(t, { locked: true, status: "approved" });
			if (e.type === "dispute"){ t.alternatives.push(e); if (t.status === "open") t.status = "improve"; }
			if (e.type === "rename" && e.by === "owner" && !t.locked) t.name = e.name;
			if (e.type === "rank") t.order = e.order;
		}
	}
	return out;
}

/** Text of a .jsonl file in, entries out. A torn line loses that line, never the log. */
export function parse(text){
	return text.split("\n").flatMap(line => {
		try { return line.trim() ? [JSON.parse(line)] : []; } catch { return []; }
	});
}

export default fold;
