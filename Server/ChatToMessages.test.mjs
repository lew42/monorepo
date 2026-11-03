// node Server/ChatToMessages.test.mjs — the fill: a partly mirrored session gets only what is missing, in its place, no twins.
import fs from "node:fs";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ChatToMessages from "./ChatToMessages.mjs";
import ChatWriter from "../Servex/agents/ChatWriter.js";
import Session from "../public/framework/core/Session/Session.js";
import V1Bubbles from "../public/framework/core/Session/Chat/V1Bubbles.js";

const here = path.dirname(fileURLToPath(import.meta.url));
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const chat = (at, kind, text, extra = {}) => ({ chat: { at, from: kind === "owner" ? { kind } : { kind: "assistant", id: "smart" }, text, via: "text", ...extra } });
const T = i => `2026-11-02T10:00:${String(i).padStart(2, "0")}.000-06:00`;

// 1. said_at is copied onto the Sentence by the live writer.
const w = new ChatWriter();
const l = w.mirror("k", { at: T(1), from: { kind: "owner" }, text: "hi", prompt: "p-1", said_at: T(0) })[0];
ok(l.sentences.add.said_at === T(0), "ChatWriter copies said_at onto the sentence");
ok(!("said_at" in w.mirror("k", { at: T(2), from: { kind: "owner" }, text: "yo", prompt: "p-2" })[0].sentences.add), "no said_at, none written");

// 2. a hole at the front: the missing lines go BEFORE the mirrored tail, nothing twinned, said_at filled on the existing sentence.
const v1 = [chat(T(1), "owner", "one", { prompt: "p-1" }), chat(T(2), "smart", "reply one"), chat(T(3), "owner", "two", { prompt: "p-2", said_at: T(2) }), chat(T(4), "smart", "reply two")];
const tail = new ChatWriter(); tail.state("s");
const have = [...tail.mirror("s", { ...v1[2].chat, said_at: undefined }), ...tail.mirror("s", v1[3].chat)];
const file = [...v1, ...have];
const add = ChatToMessages.plan(file);
ok(add.length === 3, "two missing messages and the said_at: " + add.length);
ok(add.some(x => x.sentences?.["" + have[0].sentences.add.id]?.said_at === T(2)), "said_at set in place on the mirrored sentence");
const s = Session.replay([...file, ...add]);
const texts = s.messages.messages.map(m => m.sentence_items ? m.sentence_items.map(x => x.text).join(" ") : m.text);
ok(JSON.stringify(texts) === JSON.stringify(["one", "reply one", "two", "reply two"]), "list order is the chat order: " + JSON.stringify(texts));
ok(s.sentences.length === 2, "no twin sentence");
ok(JSON.stringify(V1Bubbles.from_session(s).map(b => b.pieces[0].text)) === JSON.stringify(V1Bubbles.from_chat_lines(file).map(b => b.pieces[0].text)), "same bubbles as V1");
ok(ChatToMessages.plan([...file, ...add]).length === 0, "idempotent: planning again adds nothing");

// 3. a complete file adds nothing; a file with nothing mirrored gets a plain append (no `after`).
ok(!ChatToMessages.plan(v1).some(x => x.messages?.add && "after" in x.messages.add), "nothing mirrored: no `after`");

// 4. // the real, partly mirrored v-u48msei session (tracked in git; read only, never written): filled in memory, V1 draws the same.
const big = ChatToMessages.read(path.join(here, "../public/framework/ai/sessions/2026/11/01/v-u48msei/session.jsonl")), big_add = ChatToMessages.plan(big);
const rs = Session.replay([...big, ...big_add]), a = V1Bubbles.from_session(rs), b = V1Bubbles.from_chat_lines(big);
ok(ChatToMessages.plan([...big, ...big_add]).length === 0, "real session: idempotent");
ok(a.length === b.length && a.every((x, i) => x.sender === b[i].sender && x.pieces.map(p => p.text).join(" ") === b[i].pieces.map(p => p.text).join(" ")), "real session: 0 differing bubbles");
console.log(`ChatToMessages.test: ${n} checks passed`);
