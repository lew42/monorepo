// Node test for Prompt — no DOM, no server. Run: `node Prompt.test.mjs`.
import Session from "../Session/Session.js";
import Task from "./Task.js";
import Prompt from "./Prompt.js";
import Question from "./Question.js";
const EV = { outcome: "ok", evidence: ["test"] };

const results = [];
const check = (title, fn) => {
	let ok;
	try { ok = !!fn(); } catch (e){ ok = false; console.error(e); }
	results.push(ok);
	console.log(`${ok ? "PASS" : "FAIL"} — ${title}`);
};
const add = (extra = {}) => ({ tasks: { add: { type: "Prompt", id: "p1", raw: ["yeah so I think it is important. Do the thing."], paragraphs: [{ id: "a", text: "Yeah, so I think it is important. Do the thing." }], ...extra } } });
const make = (...more) => Session.replay([{ session: "s" }, add(), ...more]);

check("tasks.add({type: Prompt}) makes a Prompt with raw, paragraphs and numbered sentences", () => {
	const p = make().tasks.find("p1");
	return p instanceof Prompt && p instanceof Task && p.raw.length === 1 && p.paragraphs.length === 1
		&& p.sentences.map(s => s.id).join() === "a1,a2" && p.sentence("a2").text === "Do the thing.";
});

check("raw only ever grows: push appends, a second array form appends too", () => {
	const p = make({ "p1": { raw: { push: "and more" } } }, { p1: { raw: ["x"] } }).tasks.find("p1");
	return p.raw.join("|") === "yeah so I think it is important. Do the thing.|and more|x";
});

check("paragraphs: add a new one, append to an existing one by id", () => {
	const p = make({ p1: { paragraphs: { add: { id: "b", text: "Second." } } } }, { p1: { paragraphs: { append: { id: "a", text: " Then this." } } } }).tasks.find("p1");
	return p.paragraphs.length === 2 && p.sentences.map(s => s.id).join() === "a1,a2,a3,b1" && p.sentence("a3").text === "Then this." && p.text.endsWith("Second.");
});

check("the smart assistant's refined {title, text} survives replay; cleaned text stays; sentences are unaffected", () => {
	const p = make({ p1: { title: "A title", text: "Refined version." } }).tasks.find("p1");
	return p.text === "Refined version." && p.get_one("title") === "A title" && p.cleaned.startsWith("Yeah, so") && p.sentences.map(s => s.id).join() === "a1,a2" && p.label === "A title";
});

check("one splitter: 3.5 and session.json stay whole, a newline ends a sentence", () => {
	const p = make({ p1: { paragraphs: { replace: { id: "a", text: "Pi is 3.5 or so. See session.json now.\nNext." } } } }).tasks.find("p1");
	return p.sentences.map(s => s.text).join("|") === "Pi is 3.5 or so.|See session.json now.|Next.";
});

check("append to a paragraph that does not exist yet makes it", () => {
	const p = make({ p1: { paragraphs: { append: { id: "z", text: "New." } } } }).tasks.find("p1");
	return p.paragraphs.find("z")?.get_one("text") === "New.";
});

check("a reply anchors to a sentence, or a sentence plus a word range", () => {
	const p = make({ p1: { replies: { add: [{ id: "r1", text: "Yes.", anchor: { sentence: "a2" } }, { id: "r2", text: "That word.", anchor: { sentence: "a2", from: 0, to: 1 } }, { id: "r3", text: "Hello." }] } } }).tasks.find("p1");
	return p.replies.length === 3 && p.replies_to("a2").length === 2 && p.replies.find("r2").get_one("anchor").to === 1 && p.replies_to("a1").length === 0;
});

check("an explicit sentences list (a migrated paragraph) keeps its own ids", () => {
	const s = Session.replay([{ session: "s" }, { tasks: { add: { type: "Prompt", id: "m", raw: ["x"], paragraphs: [{ type: "Paragraph", id: "a", text: "One. Two.", sentences: ["First one", "Second one", "Third"] }] } } }]);
	return s.tasks.find("m").sentences.map(x => x.id + ":" + x.text).join() === "a1:First one,a2:Second one,a3:Third";
});

check("asks made from a prompt are its own tasks; completion and cost roll up on read", () => {
	const s = make({ p1: { tasks: { add: [{ id: "t1", title: "one" }, { id: "t2", title: "two" }] } } });
	const p = s.tasks.find("p1");
	const before = p.completion === 0 && p.state === "idle" && s.completion === 0;
	p.tasks.find("t1").complete(EV);
	const half = p.completion === 0.5 && p.progress().done === 1;
	p.tasks.find("t2").complete(EV);
	return before && half && p.completion === 1 && p.state === "complete" && s.progress().done === 1 && s.completion === 1;
});

check("a prompt with no asks and no parts stays idle (nothing to settle)", () => { const p = make().tasks.find("p1"); return p.state === "idle" && p.completion === 0; });

check("parts: completion is settled parts over parts + uncited sentences; a task part settles when its task completes", () => {
	const s = make({ p1: { parts: [{ id: "x", cites: ["a1"], kind: "ask", text: "do it", outcome: { is: "task", ref: "t1" } }, { id: "y", cites: ["a2"], kind: "idea", text: "maybe", outcome: { is: "no-action" } }] } }, { p1: { tasks: { add: { id: "t1", title: "do it" } } } });
	const p = s.tasks.find("p1");
	const mid = p.progress().done === 1 && p.progress().total === 2 && p.completion === 0.5 && p.uncovered.length === 0;
	p.tasks.find("t1").complete(EV);
	return mid && p.completion === 1 && p.state === "complete";
});

check("a sentence no part cites keeps the prompt open", () => {
	const p = make({ p1: { parts: [{ id: "x", cites: ["a1"], kind: "ask", text: "do it", outcome: { is: "done", ref: "f" } }] } }).tasks.find("p1");
	return p.uncovered.join() === "a2" && p.completion === 0.5 && p.state === "idle";
});

check("the Prompt is listed in the session and the owner can check it off", () => {
	const p = make().tasks.find("p1");
	p.check({ by: "owner" });
	return p.completion === 1;
});

check("trace: words find the prompt, its time, the tasks made from it and their states", () => {
	const s = Session.replay([{ session: "s" }, { ts: "2026-10-25T10:00:00.000Z", ...add() }, { ts: "2026-10-25T10:01:00.000Z", tasks: { add: { type: "Prompt", id: "p2", raw: ["something else entirely about gardens"] } } },
		{ p1: { tasks: { add: { id: "t1", title: "nested ask" } } } },
		{ tasks: { add: { id: "t2", title: "filed at the root", source: { prompt: "p1" } } } },
		{ tasks: { add: { type: "Question", id: "q1", text: "what?", from: "p1" } } }, { t2: { complete: EV } }]);
	const hits = Prompt.trace(s, "important thing");
	const h = hits[0];
	return hits.length === 1 && h.id === "p1" && h.at === "2026-10-25T10:00:00.000Z" && h.score === 1
		&& h.tasks.map(t => t.id + ":" + t.state).sort().join() === "q1:idle,t1:idle,t2:complete" && h.sentences.join() === "a1,a2"
		&& Prompt.trace(s, "gardens")[0].id === "p2" && Prompt.trace(s, "zebra").length === 0;
});

check("a replayed log gives the same Prompt twice (no wall clock, no duplicate)", () => {
	const lines = [{ session: "s" }, add(), { p1: { raw: { push: "more" } } }, { p1: { paragraphs: { append: { id: "a", text: " Tail." } } } }];
	const a = Session.replay(lines).tasks.find("p1"), b = Session.replay(lines).tasks.find("p1");
	return JSON.stringify(a.sentences) === JSON.stringify(b.sentences) && a.raw.length === 2 && b.raw.length === 2;
});

const failed = results.filter(r => !r).length;
console.log(failed ? `${failed} FAILED of ${results.length}` : `all ${results.length} passed`);
process.exit(failed ? 1 : 0);
