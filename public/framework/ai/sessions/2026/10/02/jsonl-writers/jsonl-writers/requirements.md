Budget: $12

# One JSONL system: close the five unchecked writers

**The owner's words (2026-10-02, via the JSONL writer audit):** twelve `.jsonl` writers exist; the validated routes (`append.mjs`, `append_log`, research `store.mjs`, `decide.mjs`, `Cards.js`) are solid. Five gaps let an unchecked line into a live file. Close them, in this order. "Compute, don't recall" (CLAUDE.md law 7): every line a live page reads goes through `jsonl-schema.mjs`'s `check()`.

**The one rule that outranks the rest (the owner, earlier):** a guard must never stop logging itself. A hook that cannot decide lets the write through (fails open); a check that throws on its own bug logs and lets the line through. Nothing here may make `append.mjs`, `append_log`, `ledger.mjs` or `prompt-relay.mjs` go silent.

## Items

1. **Write/Edit guard.** `.claude/hooks/jsonl-guard.mjs` only reads `tool_input.command`. Add a second matcher in `.claude/settings.json` — `"matcher": "Write|Edit|MultiEdit|NotebookEdit"` — running the same hook. The hook reads `tool_input.file_path`: if it ends in `.jsonl` **and the file already exists**, exit 2 with the same message (name `append.mjs` and `append_log`). A brand-new `.jsonl` (file does not exist yet) is allowed, so a task can still open its log. Extend `jsonl-guard.test.mjs`: existing file blocked, new file allowed, a `.json` file allowed, malformed hook input lets through.
2. **`Server/plugins/SocketServer/Append.js`** (the browser's `rpc:append`): before `appendFileSync`, run `check(full, line)` from `.claude/hooks/jsonl-schema.mjs` on every line (import it by relative path; it is plain ESM). One bad line refuses the whole batch and answers the browser with the check's reason; nothing partial is written. A file with no schema (`schema_for` → null) passes as before — the check only has to be valid JSON then, which `check()` already does. Add a test beside it (`Append.test.mjs`) with a good batch, a bad batch, and a no-schema file.
3. **`.claude/hooks/ledger.mjs`**: both `appendFileSync` sites (line ~26 and ~167) go through one small `append_checked(file, entry)` that calls `check()` first. If the check **fails**, the hook still writes the line and adds `"unchecked": "<reason>"` to it, so a page never loses a log line and the reason is visible. If `check()` itself throws, write the line as before. Prove in a test that the hook writes in all three cases.
4. **`.claude/skills/clarity/flags.jsonl`**: add a `flags.jsonl` schema to `jsonl-schema.mjs` from the lines that exist now (`at`, `target`, `verdict`, `what`, and whatever else every line already has — compute the field set with a script, don't guess), with `verdict` an enum of the values in use (`clear`, `ui`, …). Then change `.claude/skills/clarity/SKILL.md` step 3 (line ~49) and line ~41 so they say: write the line to a scratch `.json` array and run `node .claude/hooks/append.mjs .claude/skills/clarity/flags.jsonl <lines.json>`. Run the schema against every existing line; if any fails, loosen the schema (never edit the data).
5. **`.claude/skills/new-task/SKILL.md`** day.jsonl step (line ~48): name the route — `node .claude/hooks/append.mjs ai/<date>/day.jsonl <lines.json>` — and say that `append.mjs` creates the file when the day is new (confirm it does; if not, make it).

## Proof before landing

- `node .claude/hooks/jsonl-guard.test.mjs`, `node .claude/hooks/jsonl-schema.test.mjs`, the new `Append.test.mjs`, and the ledger test all pass.
- From your worktree, one real `append.mjs` write to your own task.jsonl and one `append_log` tool call both still land a line.
- The hook never blocked you from writing your own task log (your task log already exists — you append with `append.mjs`, which is the point).

## Fence

You own: `.claude/hooks/jsonl-guard.mjs`, `jsonl-guard.test.mjs`, `jsonl-schema.mjs`, `jsonl-schema.test.mjs`, `ledger.mjs` (+ its test), `.claude/settings.json` (the one new matcher only), `Server/plugins/SocketServer/Append.js` (+ test), `.claude/skills/clarity/SKILL.md`, `.claude/skills/new-task/SKILL.md`, and this task dir. Nothing else. Never edit `flags.jsonl`'s data, CLAUDE.md, or any `.jsonl` by hand.

## Land

Work in your worktree, land through `node Server/merge.mjs` (it will refuse if a review is missing — this task touches no page, so say so in the landing line). Report on the card in five plain lines: what is now checked that was not, and the test counts. Note that the settings hook takes effect for sessions started after the merge, and `Append.js` after the dev server restarts (mastermind-servex handles restarts — don't restart anything).
