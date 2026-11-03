verdict: pass
1. [note] With no chip on, "Needs you 18" sits above a pinned "Waiting on you 15" (shots/inbox-none-1920.png, top band). The two disagree. rail.css:570 hides the pins whenever a chip is on, on the grounds that "Needs you is the same set", so either make the two rules one rule (DashRow.card_waits / of_ask vs WaitingOnYou) or say why they differ.
2. [note] New shows 313 rows (shots/inbox-new-400.png) because DashChips.js:359 counts every `idle` task as new, however old it is. Abandoned idle tasks will bloat "new work". Consider limiting idle tasks to recent ones, or show idle under its own chip.
3. [note] An ask with status `parked` counts as waiting and needs:true (DashRow.js:455, 470), so it lands under Needs you. The brief said "asks marked needs-owner"; a parked ask is not obviously waiting on the owner.
4. [note] `walk_dirty` (State.mjs:67) makes the second count incremental. It re-reads only the files fs.watch marked, and the fold re-reads the same dirty set. A missed watch event now hits both counts the same way until the 10-minute rewalk, which weakens the "different discovery" proof in Server/doc/state.md. The speed gain (2.4 s down to 0.65 s) is real; the trade-off should be written in state.md.
5. [note] `draw_extras` (rail.js:696) silently drops the group rows and the changed-site-page rows from the Inbox. plan.md's "What the rail keeps" section does not mention that they go.
6. [note] In shots/inbox-older-1920.png, a long task line wraps in a narrow column beside "TASK complete", which leaves a ragged indented block. Let `.inbox-row-line` take the full row width (wrap under the kind) or clamp it to one line, as the card rows do at 400.
7. [note] The Older chip has no past-work search of its own; the plain rail search runs over the state rows. plan.md says why (PastWork.mjs has no browser reader). That is a reasonable call, but it is a reduced version of the owner's ask.
8. [note] The task is not landed yet: task.jsonl ends in `log` lines with no `finish`, nothing is merged, and the work tree lists plan.md, past-work.md, doc/ and review/ as untracked. The lander must still run merge.mjs, write the finish line with the counts and dollars, and note that Servex must be restarted.

## Requirements
- 1 "Plan first, one screen": yes. plan.md has the row shape, a table of the four kinds, the check, the chips, what the rail keeps, and a decision line with the rejected alternatives.
- 2 "State folds cards and asks": yes. State.mjs fold_cards/fold_asks, check.cards/asks/sessions each counted two ways, State.test.mjs extended (including a broken copy). The CLI prints the three check lines (State.mjs:212). The stream picks them up through sig().
- 3 "The Inbox list over the one state, chips that combine, each state a url, red check line": yes. DashState tails state.jsonl and refetches state.json. The DashRow row is used for all four kinds. Live, New, Recent (with the three sub-windows), Older (week/month), Needs you and Kind are all urls (DashChips.query/write). TasksPage.chip, why and note_bad are reused. Gaps: see findings 2, 3 and 7.
- 4 "Proof": partly. The shots at 400 and 1920 for none, Live, New, Recent, Older and Needs you are present, and the timing of 0.65 s is logged in task.jsonl. The merge, the finish line and a clean git status are still to come (finding 8).
- Fence: yes. The edits are in State.mjs, State.test.mjs, state.md, rail/**, TasksPage.js (only chip/why/note_bad pulled out, with the same behaviour) and the two doc lines. There is no new page and no new folder.

## Words
- content: yes. The chip labels are plain ("Live", "New", "Recent", "Older", "Needs you", "1–4 weeks ago"). "newest 150 of 3015" says what is being shown. The red line names every count that differs (TasksPage.why).
- The doc lines in readme.md and one-dashboard.md say "Built: steps 1 and 2 (2026-10-19)" as asked, but neither gives the commit (the brief asked for "date, commit").
