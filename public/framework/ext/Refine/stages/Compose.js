/** The two things the server computes from a parsed outline, kept free of the DOM so Servex can import it:
 *  the refined brief (stage 4) and the cards (stage 5). The stage views only draw what these produce. */
export default class Compose {
	/** Markdown brief from `{ subject, sections: [{ title, cards: [{ text, cards }] }] }`. */
	static brief({ subject, sections }){
		const lines = subject ? [`# ${subject}`, ""] : [];
		const walk = (cards, depth) => cards.forEach(c => { lines.push("  ".repeat(depth) + "- " + c.text); walk(c.cards ?? [], depth + 1); });
		for (const sec of sections){ lines.push(`## ${sec.title}`); walk(sec.cards, 0); lines.push(""); }
		return lines.join("\n").trim();
	}

	/** One card per heading, plus the Haiku pass's clarity and tags once `notes` (`[{ i, clarity, tags }]`, 0-based `i`) land. */
	static cards({ sections }, notes = []){
		const by = new Map(notes.map(n => [n.i, n]));
		return sections.map(sec => {
			const cited = new Set(sec.cites);
			const walk = list => list.forEach(c => { c.cites.forEach(n => cited.add(n)); walk(c.cards ?? []); });
			walk(sec.cards);
			const found = [...cited].map(n => by.get(n - 1)).filter(Boolean);
			const clarity = found.map(n => n.clarity).filter(Number.isFinite);
			return {
				title: sec.title,
				items: sec.cards.map(c => c.text),
				cites: [...cited].sort((a, b) => a - b),
				...(clarity.length ? { clarity: Math.min(...clarity) } : {}),
				tags: [...new Set(found.flatMap(n => n.tags ?? []))],
			};
		});
	}
}
