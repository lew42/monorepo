// node resurface.test.mjs — plain node, no browser: a Question with an answer sorts after a newer
// Prompt/Task row, by WHEN it was answered (answer.at), not where it was asked — and (review round 2,
// 2026-10-25) it surfaces at the ROOT of the chat, not just the end of its own prompt's nest.
import ChatV2Model from "./ChatV2Model.js";

let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

// 1. a Question nested under a prompt, answered after a newer sibling task landed: leaves the nest
// entirely and surfaces at the root, carrying `from` as the hint back to its prompt.
{
	const m = ChatV2Model.fold([
		{ tasks: { add: { type: "Prompt", id: "p1" } } },
		{ tasks: { add: { type: "Question", id: "q1", from: "p1", text: "open?" } } },
		{ tasks: { add: { type: "Task", id: "t1", from: "p1", title: "newer" } } },
		{ q1: { answer: { text: "yes", by: "smart", at: "2026-10-25T09:00:00Z" } } },
	]);
	const kids = m.children(m.by_id.get("p1")).map(n => n.id);
	check("answered question leaves the nest (only the task stays)", JSON.stringify(kids) === JSON.stringify(["t1"]), kids);
	const roots = m.roots().map(n => n.id);
	check("answered question surfaces at the root, after its prompt", JSON.stringify(roots) === JSON.stringify(["p1", "q1"]), roots);
	check("the surfaced question still names its prompt (from)", m.by_id.get("q1").from === "p1");
}

// 2. an unanswered Question keeps its place, nested, not at the root.
{
	const m = ChatV2Model.fold([
		{ tasks: { add: { type: "Prompt", id: "p1" } } },
		{ tasks: { add: { type: "Question", id: "q1", from: "p1", text: "open?" } } },
		{ tasks: { add: { type: "Task", id: "t1", from: "p1", title: "newer" } } },
	]);
	const kids = m.children(m.by_id.get("p1")).map(n => n.id);
	check("unanswered question does not move", JSON.stringify(kids) === JSON.stringify(["q1", "t1"]), kids);
	check("unanswered question is not at the root", !m.roots().some(n => n.id === "q1"));
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

// 4. two answered questions sort by WHEN they were answered (answer.at), not the order they were asked.
{
	const m = ChatV2Model.fold([
		{ tasks: { add: { type: "Prompt", id: "p1" } } },
		{ tasks: { add: { type: "Question", id: "q1", from: "p1", text: "asked first" } } },
		{ tasks: { add: { type: "Question", id: "q2", from: "p1", text: "asked second" } } },
		{ q1: { answer: { text: "later", by: "smart", at: "2026-10-25T09:05:00Z" } } },   // q1, asked first, answered LAST
		{ q2: { answer: { text: "sooner", by: "smart", at: "2026-10-25T09:01:00Z" } } },  // q2, asked second, answered FIRST
	]);
	const roots = m.roots().map(n => n.id);
	check("surfaced order follows answer time, not ask order", JSON.stringify(roots) === JSON.stringify(["p1", "q2", "q1"]), roots);
}

// 5. a card arrives AFTER the answer: live (one apply() per line, as the stream delivers them) and a cold
// reload (fold() of the same lines at once) must land on the exact same order.
{
	const lines = [
		{ tasks: { add: { type: "Prompt", id: "p1" } } },
		{ tasks: { add: { type: "Question", id: "q1", from: "p1", text: "open?" } } },
		{ q1: { answer: { text: "yes", by: "smart", at: "2026-10-25T09:00:00Z" } } },
		{ tasks: { add: { type: "Task", id: "t1", from: "p1", title: "arrives after the answer" } } },
		{ tasks: { add: { type: "Prompt", id: "p2" } } },
	];
	const live = new ChatV2Model();
	for (const line of lines) live.apply(line);   // one line at a time, the way the live stream delivers them
	const reload = ChatV2Model.fold(lines);        // the whole file at once, the way a page load reads it
	const live_order = live.roots().map(n => n.id), reload_order = reload.roots().map(n => n.id);
	check("live and reload land on the same root order", JSON.stringify(live_order) === JSON.stringify(reload_order), { live: live_order, reload: reload_order });
	// t1 nests under p1 (not a root item itself); the root order is the two prompts, then the surfaced question last.
	check("the answered question still sits after everything, even what arrived later", JSON.stringify(live_order) === JSON.stringify(["p1", "p2", "q1"]), live_order);
}

// 6. the RESURFACE switch, off: the old behaviour — never sorted, never surfaced.
{
	const lines = [
		{ tasks: { add: { type: "Prompt", id: "p1" } } },
		{ tasks: { add: { type: "Question", id: "q1", from: "p1", text: "open?" } } },
		{ tasks: { add: { type: "Task", id: "t1", from: "p1", title: "newer" } } },
		{ q1: { answer: { text: "yes", by: "smart", at: "2026-10-25T09:00:00Z" } } },
	];
	ChatV2Model.RESURFACE = false;
	try {
		const m = ChatV2Model.fold(lines);
		check("switch off: the answered question stays in the nest, in list order", JSON.stringify(m.children(m.by_id.get("p1")).map(n => n.id)) === JSON.stringify(["q1", "t1"]));
		check("switch off: nothing surfaces at the root", !m.roots().some(n => n.id === "q1"));
	} finally { ChatV2Model.RESURFACE = true; }
}

// 7. answer_edit(line): the id a line answers, direct and through its parent; null otherwise.
{
	check("answer_edit: direct", ChatV2Model.answer_edit({ q1: { answer: { text: "x" } } }) === "q1");
	check("answer_edit: through the parent", ChatV2Model.answer_edit({ p1: { q1: { answer: { text: "x" } } } }) === "q1");
	check("answer_edit: not an answer line", ChatV2Model.answer_edit({ q1: { title: "x" } }) === null);
}

// 8. newly_answered(model, line): only a Question with no answer before this line — never a Task, never a repeat edit.
{
	const m = ChatV2Model.fold([
		{ tasks: { add: { type: "Question", id: "q1", text: "open?" } } },
		{ tasks: { add: { type: "Task", id: "t1", title: "a task" } } },
	]);
	check("newly_answered: a Question with no answer yet", ChatV2Model.newly_answered(m, { q1: { answer: { text: "x", at: "2026-10-25T09:00:00Z" } } }) === "q1");
	check("newly_answered: a Task is never 'answered'", ChatV2Model.newly_answered(m, { t1: { answer: { text: "x" } } }) === null);
	m.apply({ q1: { answer: { text: "first", at: "2026-10-25T09:00:00Z" } } });
	check("newly_answered: a repeat edit on an already-answered question is not 'newly'", ChatV2Model.newly_answered(m, { q1: { answer: { text: "replaced", at: "2026-10-25T09:01:00Z" } } }) === null);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
