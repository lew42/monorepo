// node Server/ClaudeCodeTranscript.test.mjs: one scratch transcript, the owner's turns come out and nothing else does.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Test from "../public/framework/core/Test/Test.js";
import ClaudeCodeTranscript from "./ClaudeCodeTranscript.mjs";

const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cct-")), "t.jsonl");
const user = (content, extra = {}) => JSON.stringify({ type: "user", timestamp: "2026-11-06T07:00:00Z", message: { role: "user", content }, ...extra });
fs.writeFileSync(file, [
	user("Hey Claude. Can you spawn a mastermind?"),
	user([{ type: "text", text: "Spoken words." }, { type: "text", text: "Second block." }]),
	user([{ type: "tool_result", content: "ok" }]),
	user("skill text", { isMeta: true }),
	user("<task-notification>done</task-notification>", { turnOrigin: "task_notification" }),
	JSON.stringify({ type: "assistant", message: { content: [{ type: "text", text: "Sure." }] } }),
	"not json",
].join("\n") + "\n");

const t = new Test("ClaudeCodeTranscript: owner turns only");
const turns = new ClaudeCodeTranscript(file).owner_turns();
t.eq(turns.length, 2, "two owner turns: no tool result, no meta line, no notification, no assistant");
t.eq(turns[1].text, "Spoken words.\nSecond block.", "text blocks are joined");
t.eq(turns[0].n, 1, "numbered from 1");
t.eq(ClaudeCodeTranscript.sentences(turns[0].text), ["Hey Claude.", "Can you spawn a mastermind?"], "sentences split on end marks");
fs.rmSync(path.dirname(file), { recursive: true, force: true });
t.done();
