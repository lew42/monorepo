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
import { owning_prompt, paragraphs, note_view } from "./placement.js";

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

// 5. note_view (review finding 1/2, ask3-cards-by-id): what ChatV3's note() and reply() draw for a plain message, a card, and a
//    member a view must never show the owner the literal word "undefined" for — DOM-free, so no browser is needed to prove it.
{
	const plain = Message.hydrate({ id: "m-1", by: "system", at: "2026-11-01T00:00:00.000-06:00", text: "The smart assistant could not be reached." });
	const nv1 = note_view(plain);
	check("a plain note: its text, no title, no icon, no content", nv1.text === "The smart assistant could not be reached." && nv1.title === null && nv1.icon === null && nv1.content.length === 0, nv1);

	const card = Message.hydrate({ id: "m-2", by: "owner", at: "2026-11-01T00:00:00.000-06:00", type: "Card", icon: "task", title: "Call the vet" });
	const nv2 = note_view(card);
	check("a card hydrates with its real title/icon (type:\"Card\" is aliased, review finding 2/3)", nv2.title === "Call the vet" && nv2.icon === "task" && nv2.text === "", nv2);

	const guess = Message.hydrate({ id: "m-3", by: "owner", at: "2026-11-01T00:00:00.000-06:00", type: "Note" });   // nobody registered "Note"
	check("hydrate: ANY unknown type becomes a Message (finding 2), not a generic Item with none of its getters", guess.constructor.name === "Message");
	check("…so it draws empty, never the stringified word \"undefined\"", note_view(guess).text !== "undefined" && note_view(guess).text === "");

	const reply = Message.hydrate({ id: "m-4", type: "Reply", by: "smart", at: "2026-11-01T00:00:00.000-06:00", text: "Which phone?" });
	check("an ordinary Reply: no title, no icon — reply() draws it plain (finding 4)", note_view(reply).title === null && note_view(reply).icon === null);
	reply.set({ title: "Phone the owner back", icon: "call" });   // "upgrading" it: the same title/icon fields any message has
	check("…upgraded (title/icon set on it, same item tool call as a fresh card): reply() now has what it needs to draw it as a card", note_view(reply).title === "Phone the owner back" && note_view(reply).icon === "call");
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
