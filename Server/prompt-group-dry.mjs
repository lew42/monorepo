#!/usr/bin/env node
// Dry run, writes nothing: the prompt-sourced root tasks a session record holds, and how many the grouping rule would leave
// (one parent per prompt with 2+ asks, a plain root for a 1-ask prompt = one per distinct prompt).
//   node Server/prompt-group-dry.mjs [session.jsonl]   (default: session e00f55c9's, from the main tree)
import fs from "node:fs";
import path from "node:path";
import PromptRecords from "./PromptRecords.mjs";
import RefineQueue from "./RefineQueue.mjs";

const file = process.argv[2] ?? path.join(RefineQueue.main_root(), "public/framework/ai/sessions/2026/10/20/session-e00f55c9/session.jsonl");
const by = new Map();
for (const l of fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return {}; } })){
	const a = l.tasks?.add; if (!a || !PromptRecords.from_prompt(a.source)) continue;
	const k = typeof a.source === "object" ? a.source.prompt : a.source;
	by.set(k, (by.get(k) ?? 0) + 1);
}
const before = [...by.values()].reduce((s, n) => s + n, 0), grouped = [...by.values()].filter(n => n >= 2).length;
console.log(`prompts | root tasks before | root tasks after | prompts grouped (2+ asks) | single-ask prompts\n${by.size} | ${before} | ${by.size} | ${grouped} | ${by.size - grouped}`);
