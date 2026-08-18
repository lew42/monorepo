# readme-retreat — every framework readme, ≤ 30 lines, in the new shape

Mike, 2026-08-17: readmes are the reader's index, not a decision log. Minimal, clear,
prioritized. Mostly suggestions; no rules that might need breaking; past problems named
in one line with the doc linked; nothing extra. One Fable minion per readme.

## The brief each minion gets (verbatim below the line)

---
Three laws (CLAUDE.md): **less is more — ASAP**, clarity is the one exception, prioritize.
Your deliverable is ONE readme, ≤ 30 lines, plus the doc that keeps its history.

Invoke the `documentation` skill first (Skill tool). Then, for `<DIR>`:

1. Read `<DIR>/readme.md`, `<DIR>/page.js`, and `ls <DIR>/doc/`. Do not read the module's
   source unless the readme's "Use" snippet needs checking.
2. Create `<DIR>/doc/decisions.md` (or append, if it exists) and move there **verbatim** every
   Decisions / Traps-detail / Open / Proposed / Recent / history paragraph you cut. Nothing
   is deleted from the repo — it moves one click down. Start it with `# <Module> — decisions
   and record` and one line: *moved from readme.md 2026-08-17; conclusive, not current guidance.*
   In the moved text, rewrite relative links `./doc/x.md` → `./x.md` and `doc/x.md` → `x.md`
   (the file now lives inside `doc/`); leave everything else verbatim.
3. Rewrite `<DIR>/readme.md` in this shape, ≤ 30 lines total:
   - `# <Name> — one line: what it is, for whom`
   - `## Use` — one snippet, the common case (from page.js or the old readme; verify it is
     the current API by grepping the source for the method names it uses).
   - `## Watch out` — one line per real past problem or silent trap, each ending with the
     doc that has the detail (`[doc/x.md](./doc/x.md)`). Suggestions, not laws.
   - `## More` — one line per important `doc/*.md` (every doc gets named here — the readme
     is the AI's index), the page url, and the two or three files that matter with a
     three-word note each.
4. If `<DIR>/page.js` is a `Doc` with `notes:`, add `decisions` to it so the record is a
   url. Touch nothing else in page.js. If it is not a Doc, skip.
5. Verify (prefix `MSYS_NO_PATHCONV=1` under Git Bash or the `/framework/…` args get mangled): `MSYS_NO_PATHCONV=1 node "C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/f4bc3a9e-dcfa-429b-97ee-931bb9e17fbf/scratchpad/probe-page.mjs" <URL> <URL>/doc/decisions/`
   must print `ok` and `mderr: 0` (the second url only if step 4 applied). Never touch
   Mike's live tabs.
6. Append ONE line to `public/framework/ai/2026-08-17/readme-retreat/task.jsonl` (bash
   `printf '%s\n' '…' >>`, no BOM): `{"log": {"at": "<ISO local>", "msg": "<DIR>: <old lines> → <new lines>; moved <n> paragraphs to doc/decisions.md; probe ok"}}`
7. Return a 3-line report: old → new line count, what moved, anything you left.

Fences: `<DIR>/readme.md`, `<DIR>/doc/decisions.md`, the `notes:` line of `<DIR>/page.js`,
and the one log line. Nothing else. No code changes. Do not restart the dev server.
