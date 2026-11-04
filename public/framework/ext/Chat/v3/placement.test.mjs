// node placement.test.mjs — plain node, no browser: ChatV3's two pieces of data logic (placement.js) against a real voice session
// (a range copied from public/framework/ai/sessions/2026/11/01/v-u48msei/session.jsonl into fixture/messages-session.jsonl, the
// original untouched), replayed through the real Session: every Reply lands under the Prompt holding its `re.to`, in list order;
// a pause between two sentences starts a new paragraph.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Session from "../../../core/Session/Session.js";
import Prompt from "../../../core/Session/Chat/Prompt.js";
import Reply from "../../../core/Session/Chat/Reply.js";
import Message from "../../../core/Session/Chat/Message.js";
import { owning_prompt, paragraphs, note_view, far_off_questions, find_answered_ids } from "./placement.js";

let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

const fixture = fileURLToPath(new URL("./fixture/messages-session.jsonl", import.meta.url));
const before = readFileSync(fixture, "utf8");
const lines = before.split("\n").filter(Boolean).map(l => JSON.parse(l));

const session = Session.replay(lines);
const list = session.messages.messages;

// 1. every Reply lands under the Prompt holding its re.to
const prompts = list.filter(m => m instanceof Prompt), replies = list.filter(m => m instanceof Reply);
check("the fixture has 6 prompts and 9 replies", prompts.length === 6 && replies.length === 9, { prompts: prompts.length, replies: replies.length });
for (const r of replies) {
	const owner = owning_prompt(list, r);
	check(`reply ${r.id} lands under the prompt holding its re.to (${r.re?.to})`, !!owner && owner.sentences.includes(r.re.to), { re: r.re, owner: owner?.id });
}
const first = prompts[0], second = prompts[1];
check("two replies to the same prompt both land under it", replies.filter(r => owning_prompt(list, r) === first).length === 2);
check("a reply never lands under the wrong prompt", owning_prompt(list, replies[0]) !== second);

// 2. order is list order: replies_of (filter preserving list order) matches each prompt's own replies in file order
const replies_of = p => list.filter(m => m instanceof Reply && owning_prompt(list, m) === p);
const first_replies = replies_of(first);
check("a prompt's replies come back in the list's own order", first_replies[0].at < first_replies[1].at, first_replies.map(r => r.at));
check("list order holds across the whole chat (each root's index increases)", list.every((m, i) => i === 0 || list.indexOf(m) > list.indexOf(list[i - 1])));

// 3. a pause makes a paragraph: the first prompt was grown by the fixture's two synthetic sentences (s-test-2, no pause; s-test-3, a long pause)
const paras = paragraphs(first.sentence_items, first.clean);
check("no pause: the original sentence and the quick follow-up share one paragraph", paras[0].includes("Can you hear me?") && paras[0].includes("A second thought"), paras);
check("a long pause starts a new paragraph", paras.length === 2 && paras[1] === "A third thought, after a long pause.", paras);
check("a prompt with one sentence and no pause is a single paragraph", paragraphs(second.sentence_items, second.clean).length === 1);

// 4. the fixture file was only ever read, never changed by this test
check("the fixture was not modified", readFileSync(fixture, "utf8") === before);

// 5. note_view: what ChatV3's note() and reply() draw for a plain message, a card, and a member a view must never show the
//    owner the literal word "undefined" for — DOM-free, so no browser is needed to prove it.
{
	const plain = Message.hydrate({ id: "m-1", by: "system", at: "2026-11-01T00:00:00.000-06:00", text: "The smart assistant could not be reached." });
	const nv1 = note_view(plain);
	check("a plain note: its text, no title, no icon, no content", nv1.text === "The smart assistant could not be reached." && nv1.title === null && nv1.icon === null && nv1.content.length === 0, nv1);

	const card = Message.hydrate({ id: "m-2", by: "owner", at: "2026-11-01T00:00:00.000-06:00", type: "Card", icon: "task", title: "Call the vet" });
	const nv2 = note_view(card);
	check("a card hydrates with its real title/icon (type:\"Card\" is aliased to Message)", nv2.title === "Call the vet" && nv2.icon === "task" && nv2.text === "", nv2);

	const guess = Message.hydrate({ id: "m-3", by: "owner", at: "2026-11-01T00:00:00.000-06:00", type: "Note" });   // nobody registered "Note"
	check("hydrate: any unknown type becomes a Message, not a generic Item with none of its getters", guess.constructor.name === "Message");
	check("…so it draws empty, never the stringified word \"undefined\"", note_view(guess).text !== "undefined" && note_view(guess).text === "");

	const reply = Message.hydrate({ id: "m-4", type: "Reply", by: "smart", at: "2026-11-01T00:00:00.000-06:00", text: "Which phone?" });
	check("an ordinary Reply: no title, no icon — reply() draws it plain", note_view(reply).title === null && note_view(reply).icon === null);
	reply.set({ title: "Phone the owner back", icon: "call" });   // "upgrading" it: the same title/icon fields any message has
	check("…upgraded (title/icon set on it, same item tool call as a fresh card): reply() now has what it needs to draw it as a card", note_view(reply).title === "Phone the owner back" && note_view(reply).icon === "call");
}

// 6. far_off_questions: a resurfaced reference is only for an ANSWERED Question more than `threshold` roots back from
// the end (not merely "not the newest root", which would qualify the instant the next prompt arrived), capped to the
// most recent `max` so references never pile up for the whole session.
{
	const roots10 = Array.from({ length: 10 }, (_, i) => `p${i}`);   // p0 (oldest) .. p9 (newest)
	const answered = { answer: { text: "A" } }, open = {};
	check("fewer than `threshold` roots behind the end: NOT far-off yet (default threshold 3)",
		far_off_questions([{ question: answered, prompt: "p7" }], roots10).length === 0, "p7 is 2 behind p9");
	check("more than `threshold` roots behind: far-off",
		far_off_questions([{ question: answered, prompt: "p5" }], roots10).length === 1, "p5 is 4 behind p9");
	check("exactly `threshold` roots behind: NOT far-off (strictly more than, not at least)",
		far_off_questions([{ question: answered, prompt: "p6" }], roots10).length === 0, "p6 is 3 behind p9");
	check("an answered question under the newest root is never far-off",
		far_off_questions([{ question: answered, prompt: "p9" }], roots10).length === 0);
	check("an unanswered question is never far-off, however old",
		far_off_questions([{ question: open, prompt: "p0" }], roots10).length === 0);
	check("a custom threshold is honoured (threshold: 1 -> 2 behind already qualifies)",
		far_off_questions([{ question: answered, prompt: "p7" }], roots10, { threshold: 1 }).length === 1);
	const many = roots10.map((p, i) => ({ question: answered, prompt: p })).filter((_, i) => i < 6);   // p0..p5, all far-off at threshold 3
	check("a pile of far-off questions is capped to the most recent `max` (default 5), not left to grow forever",
		far_off_questions(many, roots10).length === 5, far_off_questions(many, roots10).map(x => x.prompt));
	check("...and the cap keeps the ones CLOSEST to the end (most likely still relevant), not the oldest",
		far_off_questions(many, roots10).map(x => x.prompt).join(",") === "p1,p2,p3,p4,p5");
}

// 7. find_answered_ids: how the view finds a live answer when no "delta" event fires for it — pure data, no Session:
// any id whose own value carries an "answer" key, at any depth.
{
	check("a top-level answer line names its id", find_answered_ids({ "q-1": { answer: { text: "x" } } }).join() === "q-1");
	check("a nested answer line (addressed through its Prompt task) still finds the Question's own id",
		find_answered_ids({ "p-1": { "q-1": { answer: { text: "x" } } } }).join() === "q-1");
	check("a line with no answer key anywhere finds nothing", find_answered_ids({ "p-1": { tasks: { add: { id: "q-2" } } } }).length === 0);
	check("two answers in one line both come back", find_answered_ids({ "q-1": { answer: { text: "a" } }, "q-2": { answer: { text: "b" } } }).sort().join() === "q-1,q-2");
	check("a move line (unrelated shape) finds nothing", find_answered_ids({ messages: { move: { id: "m-1", after: "m-2" } } }).length === 0);
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
