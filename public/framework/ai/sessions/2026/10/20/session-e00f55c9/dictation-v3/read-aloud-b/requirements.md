# audio/Recite: no flood, then tap to pause

Budget: $15. You own this one task end to end (your `mastermind` role text, "Owning one task end to end").

## What to build

The next two items of the Open list in `public/framework/audio/Recite/readme.md` ("Open, by the agreed build order"), in this order:

1. **No flood + prioritise** (item 1): a 2–3 s quiet window before a queued reply plays (today `turn_wait_ms` / `barge.quiet_ms` = 1.5 s); the reply that answers the owner's latest line plays first; an agent update collapses into one spoken line ("I have an update on X, tap to hear it").
2. **Tap to pause** (item 2, piece b): tapping a bubble plays or pauses it; taps on links, mention chips and buttons are ignored.

Items 3–5 stay on the Open list for the next agent. The decisions and open questions for each item are already in `public/framework/audio/Recite/doc/architecture.md`; read it before deciding anything.

## Where to start

- The previous agent's last note: `../read-aloud-next/session.jsonl` (last line), and its `review.md` (what the reviewer caught last time).
- The owner's words: the dictation-v3 `requirements.md` one folder up.

## How

- Work in a worktree (`node Server/worktree-up.mjs read-aloud-b`) and commit at every working step.
- Proof: `Recite.test.mjs` passes with new cases for both items; headless shots at 400 and 1200 px of a paused bubble; `node Server/smoke.mjs` on `/framework/audio/Recite/` and `/framework/ux/Dictate/` shows no FAIL.
- Review with `node Server/review.mjs <this dir> <worktree>`, answer the findings, then land with `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree>`.
- ⚠ If merge.mjs fails and you land by copying files and committing by path, afterwards run `git diff michael/dev worktree/read-aloud-b -- public/framework/audio/ public/framework/ux/Dictate/` and land every file it shows (except `files.jsonl`). Last time this fallback left Recite.css behind.
- Update the Recite readme's Open list and `doc/architecture.md` as each item lands. Log in `session.jsonl` in this folder.

## Never

Kill or restart any server or Servex · drive the owner's tabs · stash (diff instead) · `git add` a generated `files.jsonl` · edit `ux/Dictate/chat.js` (another agent owns it; ask through mastermind-dictation-v3).
