Budget: $12

# validated-writes — every JSONL write goes through a validator; then the guard

Items 11 and 12(a) of [../requirements.md](../requirements.md). The owner, 2026-09-30: "tool calls… that then take the same data and validate it first before writing it to file." Order matters: make the validated route the easy default FIRST, wire the guard LAST.

## Fence
`.claude/hooks/append.mjs`, `.claude/hooks/jsonl-guard.mjs`, `.claude/hooks/jsonl-schema.mjs` (new: the one schema module), `.claude/hooks/readme.md`, `.claude/hooks/*.test.mjs`, `.claude/settings.json` (the hooks section only), the Servex `append_log` tool and the module it writes through (find it: `grep -rn append_log Servex/*.js Servex/**/*.js`), and one-line pointers in skills under `.claude/skills/*/SKILL.md` that still show a shell append to a .jsonl. Scripts under `Server/` and `Servex/` that shell-append .jsonl: list them on the card; fix only the ones in your fence.

## Build
1. **One schema module** `.claude/hooks/jsonl-schema.mjs`: for each file kind — `task.jsonl`, `day.jsonl`, a card's `page.jsonl`, `asks.jsonl`, `board.jsonl` — the known verbs (the top-level key) and the required fields of each. Derive the lists from the readers (`public/framework/ext/JSONL/JSONL.js` `static verbs`, `public/framework/ai2/card.js`, the asks reader) and the skills that teach a verb (`experiment`, `review` are legitimate — the verbs-reader minion is adding them to JSONL.js at the same time; list them). A test reads JSONL.js's verb arrays and fails if the schema and the reader disagree.
2. **`append.mjs` and `append_log` validate** each new line against the file's schema before writing: an unknown verb or a flat line (no verb key) is REFUSED, and the error names the right shape (e.g. task.jsonl lines are `{"log":{"at","msg"}}`, `{"assign":{…}}`, …). Old lines stay; only new lines are judged.
3. **Make it the default:** every skill or hook readme that shows `>>` into a .jsonl now shows `node .claude/hooks/append.mjs <file> <lines.json>` (or `append_log`). Keep each change to the one line.
4. **Then wire the guard:** add `.claude/hooks/jsonl-guard.mjs` as a PreToolUse hook on Bash and PowerShell in `.claude/settings.json`, beside `git-guard.mjs`. It refuses a shell append to `*.jsonl` with the pointer to the tool. It must fail open on its own errors (it already does — keep that).

## Proof (on the card)
- `node .claude/hooks/append.mjs` refuses `{"at":"…","task":"x","msg":"flat"}` on a task.jsonl and names the shape; accepts `{"experiment":{…}}` and `{"review":{…}}`.
- A Bash `echo '{}' >> x.jsonl` is refused with the pointer (run the hook by hand with a fake tool input).
- The schema/reader agreement test passes.
- Your own task log was written through the tool.

## How you work
- Load the `minion` skill first, then the `code` skill. Read the readme chain for every directory you touch (`/framework/ai/readmes/`).
- Work ONLY in the worktree `C:/Code/lew42/worktrees/proposal-flow` (branch `worktree/proposal-flow`, its server `http://localhost:62566/`). Never edit the main tree. Other minions share this worktree with their own fences — touch only your files.
- Commit each piece as soon as it works, by exact path, on this branch. Do not merge: say "ready to merge" on the card and the mastermind merges.
- Every look is headless (`mcp__site__shot` or Playwright). Never touch the owner's tabs.
- Log with the validated route only: `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` or Servex `append_log`. Never `echo >>`.
- Report on the card `2026/09/30/proposal-flow-main-is-production-then-pr` (card_reply): two sentences at start, at "ready to merge" with the proof links, and if blocked. Nothing else goes to the mastermind.
- The owner's words are verbatim in `public/framework/ai/2026-09-30/proposal-flow/owner-words.md` (last section). Re-read them before you start; build what they say.
