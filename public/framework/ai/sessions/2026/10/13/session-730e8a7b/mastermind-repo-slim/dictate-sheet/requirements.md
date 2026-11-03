# The phone sheet is the sidebar's collapsed form: one dictation UI on desktop and mobile

Budget: $12. Load the `sub-mastermind`, `page`, `navigation` and `ui-test` skills first. The owner's words: `../requirements-2.md` ask 7 and `../requirements-5.md` ask 3 ("the sidebar and the mobile sheet should be a unified process, the same code, so whether I'm dictating via desktop or mobile the outcome is the same"). The brief is already written by the dictate-check task: **`public/framework/ux/Dictate/doc/next.md`, section "Next: make the phone sheet the sidebar's collapsed form"**, with the exact change (`ext/drawer/rail.js`, `DrawerRailSheetChat`: in the `full` state mount `DrawerTabs` content instead of the `links()` buttons; the collapsed `open` state stays; keep the mic running across open → full) and the proof (`dictate-check/mic-proof.mjs` passes; a 400 px shot of the full state shows the tab row; four widths through `Server/layout-check.mjs`). Findings behind it: `ux/Dictate/doc/asks.md`, the 2026-10-13 section. Your log is this dir's `task.jsonl`.

## Deliverable

1. Do exactly the change in `next.md` section 1, in a worktree; `ext/drawer` has a coordinator note in its readme: ask it by `send_to_agent` or `ask_expert` first and wait for one reply (log it; proceed after 10 minutes of silence).
2. Proofs as listed; before/after 400 px shots on the card; `merge.mjs`.
3. Update `ux/Dictate/doc/next.md`: section 1 done with the commit hash; `ux/Dictate/doc/surfaces.md` (the surfaces page) gains one line: the sheet and the sidebar are now one component.
4. Report on your card: the shots, the hash, the link; landing line.

Fence: `ext/drawer/rail.js` (+ its css/doc), `ux/Dictate/doc/next.md` and `doc/surfaces.md` (one line), this task dir. Not `ext/Chat`, not `ext/Refine` (the bubble-order sibling). Sonnet.
