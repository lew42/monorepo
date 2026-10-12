/**
 * class RefineStyle — the ONE source for how a refined prompt must read (the owner, 2026-10-12, CLAUDE.md
 * "How to respond"). Every refine prompt that writes something the owner reads pastes `RefineStyle.RULES`
 * in, so a change here changes them all: the outline (`Server/refine.mjs structuredPromptDefault`), the
 * asks (`briefPromptDefault`) and the Haiku notes (`Servex/ext/refine/Annotator`).
 *
 *   RefineStyle.RULES                 // the rules as text, to paste into a prompt
 *   RefineStyle.for(kind)             // RULES plus the one line that fits `outline` | `asks` | `notes`
 *   RefineStyle.check(md)             // the rules that code can test on an outline: { ok, problems: [] }
 *
 * DOM-free and import-free, so Node (Servex, Server) and the browser both load it.
 * Detail: `doc/refine-style-2026-10-12.md`. The clean step is NOT styled: it must change as little as possible.
 */
export default class RefineStyle {

	static RULES = `STYLE of anything the owner will read (the owner's rules):
- It is an OVERVIEW of what was said, in the owner's own key words. Never the whole rant, never a retelling.
- Each point has its answer or action baked in: say what is done, what to do, or what is still open. Do not invent an answer the transcript or the facts do not give; mark such a point open instead.
- Order by dependency and ease: clarifications and quick items first, then what depends on them. If neither applies, keep the owner's order.
- Reuse the same names for the same things every time, so they become familiar, and always name the context (the page, class, module or session) a point belongs to.
- Headings are big: "#" for the one subject, "##" for each part, "###" only when a part truly needs a split. Never "####" or smaller. Every heading starts with one fitting emoji icon.
- Under a heading: short titled lists. A status bullet starts with ✅ (done) or ⬜ (not done) when the status is known; otherwise a plain "-" bullet. Few emoji, never decoration.
- Every card cites the clean-sentence numbers it came from, like [S3, S7], each number individually.`;

	/** The last line that tells each prompt what its output is. */
	static KIND = {
		outline: "Apply this to the headings and bullets of the outline.",
		asks: "Apply this to the numbered asks: one per idea, each with its action baked in, easiest and prerequisite ones first.",
		notes: "Apply this to names and alternates: prefer a name already in use over a new one.",
	};

	static for(kind){
		return RefineStyle.RULES + "\n" + (RefineStyle.KIND[kind] ?? "");
	}

	/** What code can check on an outline: no "####", every heading opens with an icon, only one "#". */
	static check(md){
		const problems = [];
		const icon = /^\p{Extended_Pictographic}/u;
		let h1 = 0;
		for (const line of String(md).split(/\r?\n/)){
			const h = /^(#{1,})\s+(.*)$/.exec(line);
			if (!h) continue;
			if (h[1].length > 3) problems.push(`heading deeper than ###: ${line.trim()}`);
			if (h[1] === "#") h1++;
			if (!icon.test(h[2].trim())) problems.push(`heading without an icon: ${line.trim()}`);
		}
		if (h1 > 1) problems.push(`${h1} "#" headings, expected one`);
		return { ok: !problems.length, problems };
	}
}
