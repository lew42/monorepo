// Node test for PromptLines — writes each line shape into a temp session.jsonl, exactly as the fast/smart seats
// would (one fs.appendFileSync per line, the shape of Sessions.js's own `write`/`append`), then folds the file
// with ChatV2Model.js (what Chat v2 actually reads) and checks the Prompt, raw, paragraphs, reply, question and
// answer all come out. No DOM, no server. Run: `node PromptLines.test.mjs`.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as PromptLines from "./PromptLines.js";
import ChatV2Model from "../../public/framework/ext/Chat/v2/ChatV2Model.js";

const results = [];
const check = (title, fn) => {
	let ok;
	try { ok = !!fn(); } catch (e){ ok = false; console.error(e); }
	results.push(ok);
	console.log(`${ok ? "PASS" : "FAIL"} — ${title}`);
};

const file = path.join(os.tmpdir(), `prompt-lines-test-${Date.now()}.jsonl`);
const append = line => fs.appendFileSync(file, JSON.stringify(line) + "\n");
const fold = () => ChatV2Model.fold(fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)));

const PID = "p-1000", QID = "q-2000", RID = "r-3000";

append(PromptLines.add_prompt({ id: PID, raw: ["so the page should"], text: "So the page should show every bubble in order." }));
append(PromptLines.push_raw(PID, "in order"));
append(PromptLines.add_paragraph(PID, { para_id: "b", text: "A second idea." }));
append(PromptLines.append_paragraph(PID, { para_id: "b", text: " Still going." }));
append(PromptLines.refine_prompt(PID, { title: "Bubble order", text: "The chat should show every bubble in order." }));
append(PromptLines.add_reply(PID, { id: RID, text: "Already true: list order, never sorted.", anchor: { sentence: "a1" } }));
append(PromptLines.add_question(PID, { id: QID, text: "Does this also cover a typed line?" }));
append(PromptLines.answer_question(QID, { text: "Yes — say() treats it the same." }));

check("add_prompt makes a Prompt with raw and one cleaned paragraph", () => {
	const m = fold(), p = m.by_id.get(PID);
	return p && ChatV2Model.kind(p) === "Prompt" && p.raw[0] === "so the page should" && ChatV2Model.paragraphs(p)[0].text === "So the page should show every bubble in order.";
});

check("push_raw appends to raw without touching the paragraphs", () => {
	const p = fold().by_id.get(PID);
	return p.raw.join("|") === "so the page should|in order" && ChatV2Model.paragraphs(p).length === 2;   // "a" plus the "b" paragraph added below
});

check("add_paragraph then append_paragraph: a second paragraph, grown in place", () => {
	const p = fold().by_id.get(PID), b = ChatV2Model.paragraphs(p).find(x => x.id === "b");
	return b && b.text === "A second idea. Still going.";
});

check("refine_prompt sets the smart assistant's title and text", () => {
	const p = fold().by_id.get(PID);
	return ChatV2Model.title(p) === "Bubble order" && ChatV2Model.text(p) === "The chat should show every bubble in order." && ChatV2Model.refined(p) === true;
});

check("add_reply anchors a reply to a sentence of the Prompt", () => {
	const p = fold().by_id.get(PID), r = ChatV2Model.replies(p)[0];
	return r.text === "Already true: list order, never sorted." && ChatV2Model.anchor(r)?.sentence === "a1";
});

check("add_question nests a Question under the Prompt, found by ChatV2Model.children", () => {
	const m = fold(), p = m.by_id.get(PID), q = m.by_id.get(QID);
	return ChatV2Model.kind(q) === "Question" && q.from === PID && m.children(p).some(c => c.id === QID);
});

check("answer_question moves the Question's phase to answered", () => {
	const q = fold().by_id.get(QID);
	return ChatV2Model.answer(q)?.text === "Yes — say() treats it the same." && ChatV2Model.phase(q) === "answered";
});

check("roots() draws the Prompt once; the Question is reached only as its child", () => {
	const m = fold();
	return m.roots().length === 1 && m.roots()[0].id === PID;
});

fs.rmSync(file, { force: true });
console.log(`${results.filter(Boolean).length} of ${results.length} passed`);
if (results.includes(false)) process.exit(1);
