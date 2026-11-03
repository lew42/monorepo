# V1: raw transcripts disappear (urgent)

Budget: $8. Load the `minion` skill first, then `code`. You own this one fix end to end, one merge. The owner's words: [night-2026-11-01/requirements.md](../../night-2026-11-01/requirements.md), point 3 ("V1 raw transcripts are disappearing… that's alarming: V1 is the raw log").

**The bug.** In the V1 chat view (`ux/Dictate/v1/`), sentences the owner dictated vanish from the screen after they were shown. The owner suspects the fast seat (the fast assistant) moves them into Questions or Tasks.

**The owner's rule.** V1 is the raw log: every sentence the owner said stays visible, in order, whatever an assistant does with it later. A Question or Task made from a sentence is drawn in addition to it, never in place of it.

**A lead (from `mastermind-dictation-v3`, not confirmed).** The voice session `public/framework/ai/sessions/2026/11/01/v-u48msei/session.jsonl` holds many lines shaped `{"p-<id>": {"tasks": {"add": {"type": "Question", "text": …, "from": "p-<id>"}}}}`, which are fast-seat edits on a prompt. It also holds `{"place": …}` lines and 130 top-level `{"tasks": …}` lines.
- Check whether V1 stops drawing a prompt's text once the prompt has `tasks` children, or once a `place` line moves it.
- Check, too, whether a `{"p-<id>": {"text": …}}` edit overwrites it.
- Look at sessions after 21:30 as well: `ls -t public/framework/ai/sessions/2026/11/01/`, and the voice sessions in `index.jsonl`.
- Don't edit any session file; copy lines into a fixture.

**Find the cause first, then fix it.** Log the cause as a `log` line in this dir's `task.jsonl`: which line kind hides which sentence, with a line number from the real session. If the cause is the fast seat's writes (Servex side), fix V1's drawing so the raw text always shows. Then, as a second commit, add one line to `ux/Dictate/improvements.jsonl` (through the `item` tool) about the writer.

**Prove it.** Write a node test beside `ux/Dictate/test/order.mjs`: replay a fixture taken from the real session, and check that every sentence the owner said is in V1's rendered output, including those that later got a Question, a Task or a `place` line. Every existing case and the full suite still pass. Take one headless shot at 400x860 of V1 with the fixture, put it in `shots/` here, and read it yourself.

**Fence.**
- `mastermind-ink-check` edits `ux/Dictate/` views in `worktree/views-fix`. If you touch a file it also changes, message it first (`send_to_agent`) and agree.
- `mastermind-chat-model` owns the chat data model (`core/Session/`, Refs, `session.messages`). Don't change its shapes; ask it if you need to.
- `audio/Recite/` and `ext/Chat/v3/` are not yours.

**Land:**
- [ ] Worktree: `node Server/worktree-up.mjs v1-raw`; commit by exact path.
- [ ] Docs, same branch: update `ux/Dictate/readme.md` or its V1 doc, adding the raw-log rule.
- [ ] Review: `node Server/review.mjs <this dir> <worktree>`; answer every finding as `{"review":{"answer":{"n","reply"}}}` (`node .claude/hooks/append.mjs`).
- [ ] Merge: `MSYS_NO_PATHCONV=1 node Server/merge.mjs <full worktree path> --review-dir <this dir>`.
- [ ] Check: `node Server/smoke.mjs` shows no FAIL; `git log michael/dev..worktree/v1-raw` is empty.

**Report** once, after the merge, to `mastermind-dictation-v3`, in 3 lines: the cause, the proof, the commit.

**Never:** restart or kill any server or Servex, run `python`, drive the owner's tabs, set work aside with git (diff instead), or `git add` the generated `files.jsonl`. Resolve, don't park: decide, and write the alternative beside it.
