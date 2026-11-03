verdict: pass
1. [note] All four asks are met. I checked each one in `C:/Code/lew42/worktrees/v1-switch-prep` at aa8cd656e. `node Server/ChatToMessages.test.mjs` prints "11 checks passed", which matches `core/Session/Chat/readme.md`. The Chat, Prompt.raw and V1Bubbles tests pass. `node Server/ChatV1Compare.mjs` finds 0 differing bubbles on all 5 sessions, the same numbers as `compare-after.txt`.
2. [note] Both fixes from the second review are done. The readme's check count is now right, and `clean_line()` sits above `place()`'s comment block (`Servex/agents/ChatWriter.js:115`). The fences held: the diff doesn't touch `Widget.js` or `ext/Chat/Chat.js`, and nothing ran `--apply`.
3. [note] The comment at `Server/ChatToMessages.test.mjs:37` still says "a complete file adds nothing", but its check only covers the nothing-mirrored case. The idempotence checks at :35 and :43 already prove the complete-file case, so the comment should say that.
4. [note] `V1Bubbles.js:33` reads `m.said_at` on a Message, but Message has no `said_at` getter, so the value is always null and does no harm. Either drop the read or add the getter beside `Sentence.said_at`.
5. [note] Test section 4 (`ChatToMessages.test.mjs:41`) reads the real `2026/11/01/v-u48msei/session.jsonl`, not a frozen copy. If that session grows, the "0 differing bubbles" check could break later.
6. [note] The 0 diffs are measured against `V1Bubbles.from_chat_lines`, which is a model of V1, not V1 itself. `Widget.place()` also splits a bubble on `to: "paragraph"/"card"`, and neither side models that split. Check it before step 4 switches `Widget.js`.
7. [note] After the merge, Servex has to restart before live sessions write `said_at`. `pseudo-properties.md` step 4 says this, but no one is named to do the restart.

## Requirements
- 1 "Copy `said_at` … into each message as it's written … Add a test" — yes — `ChatWriter.js:58` copies it, `Sentence.js` adds the getter, and test section 1 checks both cases. `say()`/`line()` both go through `mirror()`.
- 2 "`ChatToMessages.mjs` fills a partly mirrored session … no twins … `--dry` by default" — yes — `plan()` adds only the missing messages, each with `after`. The test covers a hole at the front, no twin sentence and idempotence. It also fills the real v-u48msei session in memory with 0 diffs. Nothing was applied.
- 3 "Run the compare again on the same 5 sessions … goal is 0 diffs" — yes — 0 of 1314, 765, 278, 215 and 170. I re-ran it and got the same numbers.
- 4 "Update the switch-over plan … and the ⬜ items in the Chat readme" — yes — steps 2, 3 and 6 of `pseudo-properties.md` are updated, and the readme's two ⬜ items are now ✅. The class map adds `said_at?`.
- Class question — n/a. The diff adds a getter and a static helper, not a new class.

## Words
- Docs read plainly, and each one names its test and its result. The stale test comment is note 3.
- A fresh agent could continue from the task folder: `requirements.md`, `compare-after.txt`, the review history in `session.jsonl`, and the next steps in `pseudo-properties.md` (Servex restart, then step 4).
