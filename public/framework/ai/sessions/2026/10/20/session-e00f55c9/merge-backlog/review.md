verdict: fix
1. [fix] Ask 1 is not done: `worktree/chatv3-title-dedupe` was merged into `worktree/mb-chatv3` (9323c3067), but that branch has not landed on michael/dev, and nothing records why. The brief says to merge it first. Run `merge.mjs` on mb-chatv3, or write down what is blocking it.
2. [fix] Nothing is recorded yet, on the task or in triage. `merge-backlog/session.jsonl` holds only the assign line and two commit lines, and `unmerged-work/triage.md:8-14` still shows all four branches as unmerged. A fresh agent could not tell from the folder that worktrees `mb-chatv3` and `mb-twins` exist, or what state they are in. The brief asks for each outcome "on its task, and in triage.md next to the branch".
3. [fix] `Server/readme.md:53` is now out of date. It lists `SessionConsolidate.mjs` with only `<uuid> [--apply]` and says it folds "into the oldest". The diff adds `--all`, `--all --apply`, `--check [--write] [--json]` and a home rule (oldest day first, then the folder that holds most), and it adds `Server/session-twins.test.mjs`, which is not listed there.
4. [note] The two-file conflict in `mb-twins` (merge a9e35e44c: `.gitignore`, `Server/SessionConsolidate.mjs`) was resolved in favour of dev, as the brief asked. Dev's `Runtime.safe_write` change and the ChatV3 gitignore lines are both kept. The diff does not touch `Servex/agents/Sessions.js`, Recite, Dictate or Chat V3, so the stop rule did not apply.
5. [note] Tests in `mb-twins` pass: `session-twins.test.mjs` (10), `SessionFolders.test.mjs` (15), `session-dir-clash.test.mjs` (10), `TaskMove.test.mjs` (11). I found no `review.mjs` report or `merge.mjs` run for it in the task folder yet.
6. [note] `Server/ChildLinks.mjs:19` still declares `const UUID`, which nothing in the file uses since the diff removed its only use. One line can go.
7. [note] `AISessionIndex.dir_of` (diff, AISessionIndex.mjs at about line 352) now asks `SessionFolders.home()` on every write, not once per id. That is correct: it is the fix. It now costs a read on each write, though, so it is worth one timing check on the full store once this lands.
8. [note] Asks 3 (`voice-bridge`) and 4 (`v1-switch-prep`) have no worktree or record yet. That is fine if the mastermind is still working through the list in order. It is a gap if the task is closed as it stands.

## Requirements
- 1 "chatv3-title-dedupe … Merge it" — no — on worktree/mb-chatv3 only; `git log michael/dev..worktree/mb-chatv3` shows 3 commits
- 2 "session-twins-fix … resolve the conflicts in favour of what's on michael/dev" — partly — resolved correctly in mb-twins (a9e35e44c), tests pass, not merged yet
- 3 "voice-bridge" — no — nothing started
- 4 "v1-switch-prep … land the 2 leftover files … or mark it superseded" — no — nothing started
- "Record the outcome on its task, and in triage.md" — no — triage.md:8-14 unchanged
- "Fences: … delete no branch or worktree" — yes — session-twins-fix and voice-bridge worktrees are still there
- New class `SessionFolders`: a page showing its live instances — no page — [note] only; it is a node-only finder, and its live state is `sessions/session-folders.json` plus the twin check

## Words
- content: clear, plain sentences — yes — `one-folder.md`, the `identity.md` and `readme.md` edits explain the one finder in full sentences, with links
- content: no stale text left — no — `Server/readme.md:53` (finding 3)
