/* Folding a card's page.jsonl — latest line wins. Plain functions, no DOM, no
 * Servex: the browser reads a card straight off its static file and
 * Servex/cards/Cards.js folds the same way, so the two can never disagree. */

/** One line into the state. A key the vocabulary does not know is plain data. */
export function absorb(state, line){
	for (const [key, value] of Object.entries(line)){
		if (key === "message") state.messages.push(value);
		else if (key === "prompt"){
			const had = state.prompts.find(p => p.id === value?.id);
			had ? Object.assign(had, value) : state.prompts.push({ ...value });
		}
		else if (key === "cites"){ for (const ref of [].concat(value)) if (!state.cites.includes(ref)) state.cites.push(ref); }
		else if (key === "attach"){ if (!state.attached.includes(value)) state.attached.push(value); }
		else if (key === "detach") state.attached = state.attached.filter(a => a !== value);
		else if (key === "legacy") state.legacy.push(value);
		else if (key === "file"){
			const child = `${state.id}/${String(value).replace(/\/page\.jsonl$/, "")}`;
			if (!state.children.includes(child)) state.children.push(child);
		}
		else if (key === "class" || key === "id") continue;
		else state[key] = value;
	}
}

export const parse_lines = text => String(text ?? "").split("\n").filter(l => l.trim())
	.map(l => { try { return JSON.parse(l); } catch { return { bad: l }; } });

/** The card's folded state, `id` being its folder id. */
export function fold_card(id, lines){
	const state = { id, title: "", type: "card", tags: [], status: "open", created: null, by: null,
		messages: [], prompts: [], cites: [], attached: [], children: [], legacy: [] };
	for (const line of lines) absorb(state, line);
	state.last = [state.created, state.messages.at(-1)?.at, state.prompts.at(-1)?.at].filter(Boolean).sort().at(-1) ?? null;
	return state;
}

/** The short row the rail lists. */
export const summary = s => ({ id: s.id, title: s.title, type: s.type, status: s.status, tags: s.tags, created: s.created, last: s.last });
