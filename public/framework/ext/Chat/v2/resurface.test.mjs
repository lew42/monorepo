// node resurface.test.mjs — plain node, no browser: a Question with an answer sorts after a newer
// Prompt/Task row (ChatV2Model.ordered(), used by children()/roots()); an unanswered one does not move.
import ChatV2Model from "./ChatV2Model.js";

let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

// 1. a root Question, answered after a newer root Task landed: sorts after it, not where it was asked.
{
	const m = ChatV2Model.fold([
		{ tasks: { add: { type: "Prompt", id: "p1" } } },
		{ tasks: { add: { type: "Question", id: "q1", from: "p1", text: "open?" } } },
		{ tasks: { add: { type: "Task", id: "t1", from: "p1", title: "newer" } } },
		{ q1: { answer: { text: "yes", by: "smart", at: "2026-10-25T09:00:00Z" } } },
	]);
	const kids = m.children(m.by_id.get("p1")).map(n => n.id);
	check("answered question sorts after a newer task", JSON.stringify(kids) === JSON.stringify(["t1", "q1"]), kids);
}

// 2. an unanswered Question keeps its place.
{
	const m = ChatV2Model.fold([
		{ tasks: { add: { type: "Prompt", id: "p1" } } },
		{ tasks: { add: { type: "Question", id: "q1", from: "p1", text: "open?" } } },
		{ tasks: { add: { type: "Task", id: "t1", from: "p1", title: "newer" } } },
	]);
	const kids = m.children(m.by_id.get("p1")).map(n => n.id);
	check("unanswered question does not move", JSON.stringify(kids) === JSON.stringify(["q1", "t1"]), kids);
}

// 3. a root-level Question (no prompt yet newer than it) moves after a newer root Prompt once answered.
{
	const m = ChatV2Model.fold([
		{ tasks: { add: { type: "Question", id: "q1", text: "open?" } } },
		{ tasks: { add: { type: "Prompt", id: "p2" } } },
		{ q1: { answer: { text: "yes", by: "smart", at: "2026-10-25T09:00:00Z" } } },
	]);
	const roots = m.roots().map(n => n.id);
	check("answered root question sorts after a newer root prompt", JSON.stringify(roots) === JSON.stringify(["p2", "q1"]), roots);
}

// 4. answer_edit(line): the id a line answers, direct and through its parent; null otherwise.
{
	check("answer_edit: direct", ChatV2Model.answer_edit({ q1: { answer: { text: "x" } } }) === "q1");
	check("answer_edit: through the parent", ChatV2Model.answer_edit({ p1: { q1: { answer: { text: "x" } } } }) === "q1");
	check("answer_edit: not an answer line", ChatV2Model.answer_edit({ q1: { title: "x" } }) === null);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
