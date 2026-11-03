// Node test for Question — no DOM, no server. Run: `node Question.test.mjs`.
import Session from "../Session/Session.js";
import Task from "./Task.js";
import Prompt from "./Prompt.js";
import Question from "./Question.js";

const results = [];
const check = (title, fn) => {
	let ok;
	try { ok = !!fn(); } catch (e){ ok = false; console.error(e); }
	results.push(ok);
	console.log(`${ok ? "PASS" : "FAIL"} — ${title}`);
};
const base = [
	{ session: "s" },
	{ tasks: { add: { type: "Prompt", id: "p1", raw: ["why is it slow. fix the chat."] } } },
	{ p1: { tasks: { add: { type: "Question", id: "q1", text: "Why is it slow?", from: "p1" } } } },
	{ p1: { tasks: { add: { type: "Question", id: "q2", text: "Is it cached?", from: "p1" } } } },
];
const make = (...more) => Session.replay([...base, ...more]);
const q = (s, id) => s.tasks.find("p1").tasks.find(id);

check("a Question is a Task with text and from, open until answered", () => {
	const x = q(make(), "q1");
	return x instanceof Question && x instanceof Task && x.text === "Why is it slow?" && x.get_one("from") === "p1" && x.phase === "open";
});

check("an answer makes it answered, not complete", () => {
	const x = q(make({ p1: { q1: { answer: { text: "The poll loop.", by: "assistant" } } } }), "q1");
	return x.phase === "answered" && x.state !== "complete" && x.answer.text === "The poll loop.";
});

check("complete after the answer needs no evidence: {complete: {}} is enough", () => {
	const s = make({ p1: { q1: { answer: { text: "The poll loop." } } } }, { p1: { q1: { complete: {} } } });
	return q(s, "q1").phase === "complete" && q(s, "q1").state === "complete";
});

check("completion_problem: refused without an answer or evidence, allowed with an answer", () => {
	const s = make({ p1: { q1: { answer: { text: "x" } } } });
	return !!Question.completion_problem({}, q(s, "q2")) && Question.completion_problem({}, q(s, "q1")) === null;
});

check("unread query: answered but not complete is one query", () => {
	const s = make({ p1: { q1: { answer: { text: "A" } } } }, { p1: { q2: { answer: { text: "B" } } } }, { p1: { q2: { complete: {} } } });
	const u = s.unread();
	return u.length === 1 && u[0].id === "q1" && u[0].answer.text === "A" && u[0].from === "p1";
});

check("working: set with {by, at}, read back, cleared with working: null", () => {
	const s = make({ p1: { q1: { working: { by: "smart", at: "2026-10-25T00:00:00.000Z" } } } });
	const after_set = q(s, "q1").working;
	const s2 = make({ p1: { q1: { working: { by: "smart", at: "2026-10-25T00:00:00.000Z" } } } }, { p1: { q1: { working: null } } });
	return after_set?.by === "smart" && after_set?.at === "2026-10-25T00:00:00.000Z" && q(s2, "q1").working === null && q(s, "q2").working === null;
});

check("a Question under a Prompt appears in its trace", () => {
	const hit = Prompt.trace(make(), "slow chat")[0];
	return hit.id === "p1" && hit.tasks.map(t => t.id).sort().join() === "q1,q2";
});

const failed = results.filter(r => !r).length;
console.log(failed ? `${failed} FAILED of ${results.length}` : `all ${results.length} passed`);
process.exit(failed ? 1 : 0);
