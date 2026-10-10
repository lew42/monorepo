/**
 * class Outline — turns the markdown outline `structure()` writes ("# subject", "## card",
 * "- sub-card [S1, S2]", indented deeper bullets) into nested cards. Pure text in, plain data out
 * (no DOM), so Servex can use it too: `Prompt.parse_outline` (browser) and `Servex/ext/refine/run.js`
 * (the session prompt log) both call this one. (`Refine.js`'s `parse_structured` flattens the
 * nesting and drops the "#" line, which the Prompt view needs.)
 *
 *   Outline.parse(md)           // { subject, sections: [{ title, cites: [1, 2], cards: [{ text, cites, cards }] }] }; cites are S numbers (1-based)
 *   Outline.indexes(sections)   // the same tree with 0-based `cites` (clean[i]): how the session log stores them
 */
export default class Outline {

	static parse(md){
		let subject = "";
		const sections = [];
		let sec = null;
		const stack = [];   // [{indent, card}]
		const cites = text => {
			const found = new Set();
			for (const m of text.matchAll(/S(\d+)\s*[-–]\s*S(\d+)/g))
				for (let n = Math.min(+m[1], +m[2]); n <= Math.max(+m[1], +m[2]); n++) found.add(n);
			for (const m of text.replace(/S\d+\s*[-–]\s*S\d+/g, " ").matchAll(/S(\d+)/g)) found.add(+m[1]);
			return [...found].sort((a, b) => a - b);
		};
		const strip = text => text.replace(/\[[^\]]*S\d[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
		for (const line of String(md).split(/\r?\n/)){
			const h = /^(#{1,3})\s+(.+)$/.exec(line);
			if (h){
				if (h[1] === "#" && !subject){ subject = strip(h[2]); continue; }
				sec = { title: strip(h[2]), cites: cites(h[2]), cards: [] };
				sections.push(sec); stack.length = 0;
				continue;
			}
			const b = /^(\s*)[-*]\s+(.+)$/.exec(line);
			if (!b) continue;
			if (!sec){ sec = { title: subject || "Overview", cites: [], cards: [] }; sections.push(sec); }
			const indent = b[1].replace(/\t/g, "  ").length;
			const card = { text: strip(b[2]), cites: cites(b[2]), cards: [] };
			while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
			(stack.length ? stack[stack.length - 1].card.cards : sec.cards).push(card);
			stack.push({ indent, card });
		}
		return { subject, sections };
	}

	static indexes(sections){
		const down = cards => cards.map(c => ({ ...c, cites: c.cites.map(n => n - 1), ...(c.cards ? { cards: down(c.cards) } : {}) }));
		return down(sections);
	}
}
