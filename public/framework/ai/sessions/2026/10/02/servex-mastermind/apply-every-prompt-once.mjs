// every-prompt: (1) load once, never re-invoke per prompt (owner + vscode-mastermind, 2026-10-02);
// (2) the no-filler guard the voice pair already has (task-mastermind-prompt-refine's finding, 2026-10-02);
// (3) a pointer to the prompt-refine skill, loaded once (vscode-mastermind, 2026-10-02).
// Written by mastermind-servex-10, which could not write under .claude/.
// Run from the repo root: node public/framework/ai/sessions/2026/10/02/servex-mastermind/apply-every-prompt-once.mjs
// All or nothing: aborts, changing nothing, if any old text is missing or not unique.
import fs from "node:fs";
const f = ".claude/skills/every-prompt/SKILL.md";
const patches = [
	[`Invoke on "/every-prompt" or "you are the assistant", and re-invoke on EVERY prompt: it is short on purpose, so re-reading costs little and keeps you who you are.`,
	 `Invoke ONCE, on "/every-prompt" or "you are the assistant", and never again in the same session: each invoke pastes the whole skill into the context again, and a context full of copies degrades the model into stock replies (2026-10-02). A Servex-spawned assistant already has it as its system prompt.`],
	[`**Speed is the job:** under ten seconds, two or three plain sentences. It is voice mode.`,
	 `**Speed is the job:** under ten seconds, two or three plain sentences. It is voice mode.

**Never filler, never a prompt to continue** (the owner, 2026-09-30): no "go on", "keep going", "I'm listening", "noted", "got it", "take your time". The echo and the card are the acknowledgement; a sentence here must add something, or there is none. The voice pair's \`Servex/agents/session-fast.md\` has the same rule.

**Refining the owner's prompts is the \`prompt-refine\` skill.** Load it once, beside this one, never per prompt. It refines only the owner's own prompts (a VS Code tab, the Dictate/chat widget), never a minion's, a mastermind's or a reviewer's.`],
];
let raw = fs.readFileSync(f, "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
raw = raw.replace(/\r\n/g, "\n");
for (const [oldText] of patches){
	const n = raw.split(oldText).length - 1;
	if (n !== 1){ console.error(`ABORT: ${f}: old text found ${n} times:\n  ${oldText.slice(0, 80)}…`); process.exit(1); }
}
for (const [oldText, newText] of patches) raw = raw.replace(oldText, () => newText);
fs.writeFileSync(f, eol === "\n" ? raw : raw.replace(/\n/g, "\r\n"));
console.log(`applied ${patches.length} patches: ${f}`);
