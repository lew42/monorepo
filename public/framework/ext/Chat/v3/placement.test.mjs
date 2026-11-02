// node ChatV3.test.mjs — plain node, no browser: ChatV3's two pieces of data logic (placement.js) against a real voice session
// (a range copied from public/framework/ai/sessions/2026/11/01/v-u48msei/session.jsonl into fixture/messages-session.jsonl, the
// original untouched), replayed through the real Session: every Reply lands under the Prompt holding its `re.to`, in list order;
// a pause between two sentences starts a new paragraph.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Session from "../../../core/Session/Session.js";
import Prompt from "../../../core/Session/Chat/Prompt.js";
import Reply from "../../../core/Session/Chat/Reply.js";
import { owning_prompt, paragraphs } from "./placement.js";

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

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
