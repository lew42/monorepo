// The ai-modules-home decisions, walked through Server/decide.mjs (one call each, recorded in task.jsonl).
import * as decide from "../../../../../../../../../../Server/decide.mjs";
const file = new URL("./task.jsonl", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const D = [
 { id: "d-aitask", q: "Where does ext/AITask live?", opts: [
   { id: "move", text: "Move it to ai/AITask now, by script (git mv + relink + a pointer page at the old url)", caveats: ["53 importers, all relinked by script; old dated records keep the old url, which the pointer page answers"] },
   { id: "stay", text: "Keep it in ext/ with a scope line", caveats: ["the owner named it as the one that belongs in ai/"] } ],
   pick: "move", why: "Strictly AI (it only renders agent task logs), the owner named it, and the mover is mechanical: same folder depth, so only its sibling-ext imports change." },
 { id: "d-voice", q: "Do ux/Dictate and the voice modules (ext/Session, ux/Revise, ux/Understand) move to ai/ today?", opts: [
   { id: "propose", text: "Propose it as the next move, as one group, with the same script", caveats: ["the phone page the owner uses daily stays put one more round", "dictate-check (landed 17:37) would keep the mic in ux/: Mic.js is shared with ext/Chat and Refine"] },
   { id: "move-now", text: "Move all four now", caveats: ["31 importers and 400 mentions for Dictate alone; a miss breaks the phone page mid-use"] } ],
   pick: "propose", why: "Strictly AI by the rule, but big and live; prove the mover on AITask first, then move the voice group together so it stays one system." },
 { id: "d-ext-ai", q: "What happens to the other strictly-AI ext modules (Ask, Refine, Research, Collab)?", opts: [
   { id: "propose", text: "Propose each as a later scripted move; Collab needs a new name first", caveats: ["ai/collab (its data) exists and Windows folds case, so ai/Collab would collide"] },
   { id: "move-now", text: "Move them all in this task", caveats: ["70 importers between them; one task, one move first"] } ],
   pick: "propose", why: "Same rule, but the brief's test is obvious and cheap; these have many importers and live pages." },
 { id: "d-session-shims", q: "Which session-page module set is live, ai/AISession or ai/sessions/Session*.js?", opts: [
   { id: "retire-shims", text: "ai/AISession is live; the 8 ai/sessions/Session*.js files are 10-09 re-export shims; propose repointing their 3 importers and moving the shims aside", caveats: ["importers: ai/classes/Session/SessionClassPage.js, ai/SystemClasses.js (a path string), ext/DataGrid/page.js (prose)"] },
   { id: "keep", text: "Keep the shims", caveats: ["their own header says 'removed one release after the rename'"] } ],
   pick: "retire-shims", why: "ai/sessions/page.js imports ../AISession/AISessionsPage.js; every shim only re-exports. Brief: move nothing of it, so this is a proposal." }
];
for (const d of D){
	decide.create(file, { id: d.id, question: d.q, rank: 1 });
	decide.options(file, { id: d.id, options: d.opts.map(o => ({ id: o.id, text: o.text, caveats: o.caveats, })) });
	const r = decide.recommend(file, { id: d.id, option: d.pick, confidence: 0.8, why: d.why, source: ["module-homes.md"] });
	console.log(d.id, JSON.stringify(r).slice(0, 160));
}
