# Session page: fit a phone (stats bar and tab row)

Budget: $5. Load the `minion` skill first, then `code`, `css` and `ui`.

**The problem, measured on michael/dev at 5c2eac4f3:** at 390 px the session page shows only the title and the stats bar on the first screen. The stats bar (`SessionStats`, sticky, "Figma band E") is about 285 px tall, a third of the phone, and it covers the top of every tab. Below it, the tab chips wrap to three rows. The Timeline the owner asked for starts off screen. See `../timeline/tl-1-short.png` and the review in `../timeline/review.md` (findings 4 and 5). The plan is `../plan.md` ("The views (tab row)").

## Where

- **Worktree:** run `node Server/worktree-up.mjs session-phone-fit` and work only there. Commit at every working step. **Don't merge**: the mastermind merges after review.
- **Files:**
  - `public/framework/ai/AISession/AISessionDetail.js`: the tab row (`TABS`, `div.c("sessions-tabs …")`, around line 228–244).
  - `SessionStats`: find its file from the import.
  - `public/framework/ai/sessions/sessions.css` and `public/framework/ai/AISession/SessionTimeline.css`.
  - Docs: `public/framework/ai/sessions/doc/ui/detail-layout.md` and `doc/ui/classes.md`.
- **Leave the Chat panel alone.** mastermind-chat-v2 is adding a "Chat v2" toggle inside it in its own worktree.

## The change

1. **Stats bar on a phone: one line.** Below about 600 px, the sticky bar shows one short line: cost, state and running time, for example "$309 · $1325 with children · 5d". The full grid opens one tap down, or shows unsticky above the tabs. Desktop stays as it is.
2. **One tab row.** The row is **Overview · Timeline · Chat · Tasks · More ▾**:
   - **More ▾** holds Board, Coverage, Cost, Models and tokens, Related, Task queue →, and Full screen.
   - Build More ▾ with `SessionPopover.open` (`ai/AISession/SessionPopover.js`). No new dropdown.
   - Every `?tab=` key keeps working, and when the open tab is inside More, the More button shows as on.
   - Chat stays hidden when `chat_ok` is false, as it is now.
   - At 390 the row fits on one line.
3. **One scroll on a phone.** The Timeline's `.stl-list` scrolls inside a 72dvh box today, so the page has two scroll areas (review finding 5).
   - Make the page scroll instead, and open the Timeline scrolled to its last row by scrolling the page.
   - If you keep the inner box at desktop widths, say why in one line.
4. **Small cleanups from the review:**
   - **Finding 2:** Coverage reads the prompt lines from the Timeline's tail instead of fetching `prompts.jsonl` a second time.
   - **Finding 3:** call `SessionTimelineRows` directly instead of the aliases at `SessionTimeline.js` ~192.
   - **Finding 6:** `detail-layout.md` lists the current tabs, and `classes.md` lists the Session* tab classes.
   - Fix the over-indented `if (key === "timeline")` line in `show()`.

## Proof (shots in this folder; findings as `log` lines in this folder's `session.jsonl`)

- `before-390.png` and `after-390.png` of `/framework/ai/sessions/2026/10/20/session-e00f55c9/?tab=timeline`. In the after shot, the first Timeline rows must be visible on the first screen.
- `after-1920.png`, and `after-390-more.png` with More ▾ open.
- **Two numbers:** the stats bar's height at 390 (aim for 60 px or less), and the tab row's height at 390 (one line, about 44 px).
- Run `node --check` on each edited file, then `node Server/smoke.mjs <worktree> /framework/ai/sessions/2026/10/20/session-e00f55c9/?tab=timeline /framework/ai/sessions/e00f55c9/`. There must be no FAIL.

## Rules

- Never kill or restart the dev server.
- Never drive the owner's tabs: use headless Playwright only, from `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`.
- Never `git stash`. Never push.
- When done, report one screen to `mastermind-sessions-page`: the commits, the two heights, the shot names, and what's left.
