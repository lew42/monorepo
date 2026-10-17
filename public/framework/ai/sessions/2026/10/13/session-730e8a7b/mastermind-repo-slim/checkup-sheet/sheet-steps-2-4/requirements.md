# Sheet steps 2, 3 and 4: one class, ☰ = navigation, three sizes

Budget: $9. Sonnet, as a minion of `mastermind-checkup-sheet` (load the `minion` and `code` skills first). Taken over from mastermind-sheet, which stalled on step 2 with nothing uncommitted.

Read first: [the proposal](../../../../../../../2026/10/16/voice-20261016/sheet/proposal.md) (steps 2 to 4, the class architecture), [the audit](../../../../../../../2026/10/16/voice-20261016/sheet/audit.md), [the owner's words and the decision record](../../../../../../../../../ext/drawer/doc/owner-2026-10-16-sheet.md), `ext/drawer/readme.md`. Nothing waits for the owner's yes: the route and the layout pick are decided.

## The three steps, each its own commit, in order

1. **Step 2: fold the sheet chain into one class.** In `ext/drawer/Sheet.js`, `DrawerRailSheetV1 → DrawerRailSheet → DrawerRailSheetPanel → DrawerRailSheetChat` becomes `Sheet.Panel` (a static part, `this.constructor.Panel`). The old classes move to an archive file (`ext/drawer/archive/sheet-chain-2026-10-16.js`) still exported, so their three callers keep working or are pointed at `Sheet.Panel` (`ext/drawer/rail/page.js`, `ext/drawer/tabs/ai.js`, and leave the dated `ai/sessions/2026/10/01/nested-sheet-example/` page on the archive import). **Behaviour does not change.**
2. **Step 3: ☰ = navigation, ✦ = AI.** The phone strip's ⋯ More becomes ☰ Menu and opens the page's navigation (the Sidebar's tree) from the bottom; the desktop's top-right ☰ that opens the drawer becomes ✦. No icon means two things.
3. **Step 4: the three sizes.** Strip (about 100 px, the last line said, as in [variant A](../../../../../../../2026/10/16/voice-20261016/sheet/variants/a-compact.html)), split, and full past about 90% with ✕ in the head (A's head: "AI · <path>" + ✕). Drag up and down on the grip; a drag down on the head goes full → split → strip. Each size step adds a history entry with the same url, so the phone's back button steps down one size. One size machine (`Sheet.Size`), replacing today's 84 px / 28% / 85% numbers.

## How each step lands

- In a worktree (`take_worktree`, or `git worktree add` under `C:/Code/lew42/worktrees/`), never in the main tree.
- Proof: headless shots at 400 and 1200 of `/framework/ext/drawer/` and one ordinary page, before and after (`mcp__site__shot`, or `Server/Browser.mjs`); `check_page` shows no new console errors. Shots go in your scratchpad, never committed.
- Commit by path, then `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree>`. Log `{"commit":"<hash>"}` and one `log` line in this dir's `task.jsonl` (write it with `node .claude/hooks/append.mjs`).
- Message `mastermind-checkup-sheet` one line per step (hash, cost so far), then go straight on to the next step without waiting.
- If the budget runs out, stop after a clean merge and say which step is next. Update `ext/drawer/readme.md` (one line per change) in the step that changes it.

Fence: `ext/drawer/**`, `ux/Dictate` only where the Sheet's strip needs it, this dir. Never push, never restart Servex, never delete (archive instead), never drive the owner's tabs.
