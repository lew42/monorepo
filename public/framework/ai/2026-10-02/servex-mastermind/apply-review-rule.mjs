// Applies the owner's 2026-10-02 review rule to the minion and sub-mastermind skills.
// Written by mastermind-servex-10, which could not write under .claude/ (acceptEdits).
// Run from the repo root: node public/framework/ai/2026-10-02/servex-mastermind/apply-review-rule.mjs
// Aborts, changing nothing, if any old text is missing or not unique.
import fs from "node:fs";

const MINION = ".claude/skills/minion/SKILL.md";
const SUB = ".claude/skills/sub-mastermind/SKILL.md";

const edits = [
	[MINION,
`**The build order (the owner, 2026-09-29).** In every task (your part is (1) and (2); your mastermind runs (3) to (5) unless your brief hands them to you): (1) build in the worktree; (2) update the docs, the readme and what it links to, so they are true now, pointing to a log for ongoing detail and never holding log data; (3) spawn a FRESH mastermind that reads only those docs, as a smoke test: \`spawn_agent\` role \`reviewer\`, Sonnet, prompt "You are a mastermind working in <dir>. Load its readme chain with \`load_module\` and nothing else. Does it make sense? Is anything unclear or missing? Write <taskdir>/docs-check.md, then stop." Fix what it finds; (4) THEN the fresh-eyes review (\`review.mjs\`), which now reads current docs; (5) then merge. The reason: every later mastermind starts from a blank slate and learns the directory only from its readme.`,
`**The build order (the owner, 2026-09-29; review rule 2026-10-02).** Your part is three steps:
1. **Build** in the worktree, and commit.
2. **Update the docs**: the readme and what it links to, so they are true now. They point to a log for ongoing detail and never hold log data, because every later agent learns the directory from its readme alone.
3. **Report to your mastermind and end your turn.** Your mastermind reads your diff and your docs itself. It adds a fresh reviewer only when something is in doubt, or when the change touches a page or a layout. Don't spawn a docs-check agent or run \`review.mjs\` yourself unless your brief tells you to: a check nobody needed costs as much as the build.

When a review finding comes to you, make the simplest fix that works. If you know why a fix won't work, say so in one line (\`declined: <why>\`). Raising a concern is good; arguing is not. Your mastermind rules once, and that ruling is the last word.`],

	[SUB,
`**The build order (the owner, 2026-09-29).** In every task: (1) build in the worktree; (2) update the docs, the readme and what it links to, so they are true now, pointing to a log for ongoing detail and never holding log data; (3) spawn a FRESH mastermind that reads only those docs, as a smoke test: \`spawn_agent\` role \`reviewer\`, Sonnet, prompt "You are a mastermind working in <dir>. Load its readme chain with \`load_module\` and nothing else. Does it make sense? Is anything unclear or missing? Write <taskdir>/docs-check.md, then stop." Fix what it finds; (4) THEN the fresh-eyes review (\`review.mjs\`), which now reads current docs; (5) then merge. The reason: every later mastermind starts from a blank slate and learns the directory only from its readme.`,
`**The build order (the owner, 2026-09-29; review rule 2026-10-02).** In every task:
1. The minion builds in the worktree and updates the docs (the readme and what it links to), so they are true now. Every later agent learns the directory from its readme alone.
2. **You read the minion's diff and docs yourself first**, against the brief. You already hold the context, so this read is nearly free.
3. **Add a fresh reviewer only when something is in doubt, or when it's a page or layout change** (\`review.mjs\`; a page change always gets one, with screenshots). Spawn a docs-check agent only when the docs themselves are in doubt. With no doubt and no page, record your own read: \`node Server/review.mjs <taskdir> <worktree> --size none --why "mastermind read: <one line>"\`.
4. **The fix goes to whoever is best placed.** That is usually the fresh reviewer, revived with \`send_to_agent\` and \`revive: true\`. The builder answers instead when it knows why the fix won't work.
5. **You rule once** (\`--rule\`, review turn 4). Then merge.

Every agent in a review seeks agreement and the simplest fix that works, as fast as possible. Raising a concern is good; arguing is not. A review never turns into analysis paralysis. Detail: \`Server/doc/review.md\`, "Who reviews".`],

	[SUB,
`**A fresh agent reviews every task when it lands (the owner, 2026-09-29).** This is the \`review.mjs\` step below, and its reviewer must be a FRESH agent, or a fork of the builder's session for the cache. Give it the owner's original prompt, prefixed: "Don't build this. You are reviewing the finished result against it." Fix what it finds, and log one line \`{"review":{"found":N,"real":M,"fixed":K}}\`, so we learn whether reviews pay off.`,
`**When a fresh reviewer is needed** (step 3 above), it must be a FRESH agent, or a fork of the builder's session for the cache. Give it the owner's original prompt, prefixed: "Don't build this. You are reviewing the finished result against it." Log one line \`{"review":{"found":N,"real":M,"fixed":K}}\`, so we learn whether reviews pay off.`],

	[SUB,
`After the minions deliver and before \`merge.mjs\`, run \`node Server/review.mjs <taskdir> <worktree>\`, answer every finding, then \`--turns\` to run the reviewer's reply on any decline, and rule yourself (\`--rule\`) on anything still held after that one round.`,
`After the minions deliver and before \`merge.mjs\`, read the diff yourself (build order step 2). When a fresh review is needed, run \`node Server/review.mjs <taskdir> <worktree>\`, see that every finding is answered in \`task.jsonl\`, run \`--turns\` (it copies the answers into \`review.jsonl\` and gets the reviewer's reply on any decline), and rule yourself (\`--rule\`) on anything still held after that one round.`],
];

const files = {}, crlf = {};
for (const [f, oldText, newText] of edits) {
	if (!(f in files)) { const raw = fs.readFileSync(f, "utf8"); crlf[f] = raw.includes("\r\n"); files[f] = raw.replace(/\r\n/g, "\n"); }
	const s = files[f];
	const count = s.split(oldText).length - 1;
	if (count !== 1) { console.error(`ABORT: ${f}: old text found ${count} times, starting "${oldText.slice(0, 60)}"`); process.exit(1); }
	files[f] = s.replace(oldText, () => newText);
}
for (const [f, s] of Object.entries(files)) fs.writeFileSync(f, crlf[f] ? s.replace(/\n/g, "\r\n") : s);
console.log(`applied ${edits.length} edits to ${Object.keys(files).join(", ")}`);
