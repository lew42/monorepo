import fs from "fs";
const R = [
["Context cards (icon item as a row with context)", "never-started", "design in vision doc; no UI code shown"],
["Request filing at class/page page.jsonl with back-reference to session", "never-started", "open design question in vision doc; nothing built"],
["Refined prompts in Inbox as cards (ask later dropped)", "never-started", "2026-09-30 ask duplicated, second marked dropped; not built"],
["Per-card assistant retirement (old fast-assistant cleanup)", "never-started", "retirement asked 2026-09-30; no removal shown"],
["Interactive request cards in the chat (stage 3)", "half-done", "prompt-card.js renders ladder column; not wired into chat UI as interactive cards"],
["Handoff of a refined prompt to a mastermind (stage 5)", "half-done", "minion-echo / minion-voice-refine tasks exist; handoff mechanism not shown"],
["Per-sentence confidence used in practice (stage 4)", "half-done", "coverage table and attributes exist; confidence scoring not documented"],
["One Dictate widget everywhere (rail, sidebar, drawer, card)", "half-done", "2026-09-30 consolidation tasks stopped in starting state; unified widget not shown"],
["Now card with topics as nested sub-cards from refined prompts", "half-done", "2026-10-03 ask; task state unclear, no UI shown"],
["Live dictation segment cleaning", "half-done", "engine supports live and batch; live side not integrated"],
["Raw sentence highlight matching end to end", "half-done", "algorithm documented in raw-match.md; not joined to coverage"],
];
const rows = R.map(([title, state, evidence]) => JSON.stringify({ title, ask: "Prompt refinement pipeline (vision-2026-10-08.md)", source: "refine audit (Haiku)", date: "2026-10-08", state, evidence, dir: "public/framework/ext/Refine/", module: "refine", count: 1, priority: true }));
const f = "loose-ends.jsonl", old = fs.readFileSync(f, "utf8");
fs.writeFileSync(f, rows.join("\n") + "\n" + old);
console.log(rows.length, "added");
