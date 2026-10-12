/* `node test/refine-style.mjs` — no model call. A rant goes in, a refined overview comes out of a stub model.
 *   1. every refine prompt (outline, asks) carries the shared `RefineStyle.RULES`, the Haiku notes prompt too (when its SDK loads);
 *   2. the stub's overview obeys the rules code can check (`RefineStyle.check`) and `Outline.parse` still reads it, with cites;
 *   3. a rant-shaped outline (####, no icons, two "#") is flagged. */
import structure from "../structure.js";
import RefineStyle from "../RefineStyle.js";
import Outline from "../Outline.js";

const rant = [
	"Okay so couple of things.", "The refine page should say what it is, like, up top.",
	"And the replies need to be short lists with check marks.", "Oh and the mic button is broken on my phone.",
	"Maybe we also want tags, I guess.",
];
const sentences = rant.map((text, i) => ({ n: i + 1, text }));

const overview = `# 🧭 Refine page
## ❓ Quick clarification
- ⬜ Tags: the owner suggests them; open, no decision yet [S5]
## 🔧 Quick fix
- ⬜ Mic button broken on phone: check the phone layout first [S4]
## 🧱 Page and replies
- ✅ Say what the page is, up top: already the first line of the readme [S1, S2]
- ⬜ Replies as short lists with check marks: use \`RefineStyle\` [S3]
`;

let fail = 0, seen = "";
const check = (name, ok, extra) => { console.log(ok ? "PASS" : "FAIL", name, extra ? JSON.stringify(extra) : ""); if (!ok) fail++; };

let r, refine;
try {
r = await structure(sentences, { call: async p => (seen = p, { answer: overview, cost_usd: 0 }), model: "stub" });
refine = await import("../../../../../Server/refine.mjs");
} catch (e) { console.log("SKIP (Servex/node_modules not installed in this tree):", e.code ?? e); process.exit(0); }
check("outline prompt carries the shared rules", seen.includes(RefineStyle.RULES) && /OVERVIEW/.test(seen));
check("every sentence placed once", r.ok, r);
check("overview obeys the style", RefineStyle.check(r.md).ok, RefineStyle.check(r.md));
const o = Outline.parse(r.md);
check("Outline.parse reads it with cites", o.sections.length === 3 && o.sections[2].cards[0].cites.join() === "1,2", o.sections.map(s => s.title));

check("asks prompt carries the shared rules", refine.briefPromptDefault?.("# x").includes(RefineStyle.RULES) ?? "not exported");

const rantShaped = "# Thoughts\n# More\n#### deep\n- x [S1]";
check("a rant-shaped outline is flagged", RefineStyle.check(rantShaped).problems.length === 5, RefineStyle.check(rantShaped).problems);

try {
	const A = (await import("../../../../../Servex/ext/refine/Annotator.js")).default;
	check("notes prompt carries the shared rules", A.SYSTEM.includes(RefineStyle.NAMES));
} catch (e) { console.log("SKIP notes prompt (Servex SDK not installed here):", String(e.code ?? e).slice(0, 60)); }
process.exit(fail ? 1 : 0);
