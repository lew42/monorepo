# AI Inbox: stop status updates landing in "Waiting on you", at the source

Owner, 2026-10-16 (owner-words.md item 22, voice question 5ed46996): of the 133 items "waiting on owner" over two days, most are status updates with the wrong label. The rule: don't wait on the owner. Find which skill or hook writes them, stop the mislabelling at the source, and relabel the existing ones. No UI revamp. Sonnet minion (load `minion`). Budget $8.

## The diagnosis (computed; read it first)
`public/framework/ai/sessions/2026/10/16/voice-20261016/inbox-diagnosis.md`. In short:
- `WaitingOnYou.waits()` (`public/framework/core/Page/ext/Inbox/WaitingOnYou.js`) counts every open card that has an `owner_note`, has status `needs-you`, or contains the words "for you"/"decision".
- Of the 133: 68 owner_note kind `decision` (an FYI: "I decided this for you"), 11 `risk`, 11 `needs-you`, 41 status `needs-you` without a note (7 of them `Server/health.mjs` page-down alerts), and 2 matched on words. Only about 1 is a real open question.
- The writers: agents through the Servex `owner_note` tool (`Servex/cards/Cards.js`, `OWNER_NOTE_KINDS`, default `decision`), told to by `.claude/skills/mastermind/SKILL.md` line ~20 and `.claude/skills/sub-mastermind/SKILL.md` line ~100. Also find who else sets card status `needs-you` (grep Servex/ Server/ .claude/ for every writer) and list them.

## Do
1. The source:
   - `WaitingOnYou.waits()` counts an owner_note only when its kind is `needs-you`; drop the bare "decision" word match.
   - In the two skills, say plainly: an owner_note of kind `decision` or `risk` is an FYI; only `needs-you` (something only the owner can do: a key, a login, money) waits.
   - In `Cards.js`, fix the `owner_note` tool's description to match. That is a Servex file: commit it, but DO NOT restart Servex; note in your report that it takes effect at the next restart.
   - Any other writer that sets `needs-you` for a status update: fix it the same way.
2. Relabel the existing rows, non-destructively: a node script with a dry run first and a manifest of every card touched. It appends lines and never edits or deletes one. Each `needs-you` card that is really a status update gets a line that moves it out of the waiting bucket (use whatever line shape the card readers already honour, e.g. a status or reviewed line; check `NeedsRule`/`Timeline.Cards`). Keep the real ones.
3. Recount with the same rule the list uses, and report before and after.

## Rules
Worktree, smoke-test the AI Inbox page headless (never the owner's tabs), merge to michael/dev, commit each step. Never restart Servex. Never write the owner's name. Report to mastermind-voice-20261016 in 5 lines: the writers found, what changed (commits), the count before and after, and what waits on a Servex restart.
