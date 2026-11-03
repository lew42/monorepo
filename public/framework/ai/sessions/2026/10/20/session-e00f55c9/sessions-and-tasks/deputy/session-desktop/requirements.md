# Session page on desktop, from the Figma design

Budget: $10. Load the `minion` skill first, then `page`, `layout` and `navigation`.

## Why

The session detail page already has a design, so this is not a fresh one.
- The Figma designer's band **E**, "session page" (file `QYN0G2URSBHYH5I06MOjxU`, node `331:55264`), has:
  - stats first, in a sticky bar;
  - a top that scrolls away;
  - full-screen floating buttons;
  - a Chat tab.
- A shot of band E is at [figma-cards/session-page.png](../../figma-cards/session-page.png).
- Band **F** (node `333:55500`) covers the task, project and process cards.
- The phone version is already coded and merged: [/framework/ai/sessions/v/mobile/](/framework/ai/sessions/v/mobile/) (`worktree/mobile-picks`, 6593e474c; its readme is `sessions/v/mobile/readme.md`).

The owner asked for the desktop session page and its Work tab to be built from these frames. vscode-mastermind relayed the ask on 2026-10-23; the prompt hook logs the owner's words.

## What to do

1. **Read what exists first.**
   - The session page: `public/framework/ai/AISession/AISessionDetail.js`.
   - Its Work tab: `SessionWork.js`, landed in c2912efec.
   - The phone classes: `MobileSession` extends `AISessionDetail`; `MobileRow`, `MobileTaskRow`, `MobileRun` and `MobileData` read the real data.
   - Reuse them; don't build a second version of any row or card (CLAUDE.md law 6).
2. **Build the desktop page from band E**, with the Overview · Tasks · Chat tab order the frames show:
   - Stats first, in a sticky bar: cost, model, running for, done X of Y, with the one segmented bar (`TaskView.draw_bar`).
   - Then the Open, Project, Done and Dropped cards, in the frames' order. At 1920 and 3440 they sit side by side, so the screen is used and not one long column. Band F gives the card shapes.
   - The title scrolls away. Full-screen mode keeps the two floating buttons.
   - The Chat tab is the session's conversation, which already exists in `AISessionConversation.js`. Reuse it.
   - The Work tab's content (SessionWork: the nested work, costs, Approve) becomes this Overview, or sits under it. Pick one, and log a `decision` line with the alternative.
3. The owner has dropped Miller columns in favour of previews plus full detail views (mastermind-page's nav-rule, cdf00bb25). A clicked row opens the full detail page. Add no column layouts.

## Check it

- Shoot `/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/` at 400, 1200, 1920 and 3440, into `session-desktop/shots/<width>.png`.
- The 400 shot should still match the phone version.
- The console has zero errors on that page (`Server/smoke.mjs`).

## Deliverable

- A branch from current `michael/dev` (the pool worktree Servex gives you). Commit at every working step.
- One `show:` line: the four shots, plus one line per frame part saying whether this build follows it (stats bar, scroll-away title, floating buttons, Chat tab, cards).
- Then `ready: <branch> <sha> <one line>`, and stop. The deputy sends it to review.

## Fences

- **Yours:** `public/framework/ai/AISession/AISessionDetail.js`, `SessionWork.*`, and new files beside them. You may import from `sessions/v/mobile/`, but don't change its behaviour on the phone.
- **Not yours:**
  - `public/framework/ai/merge/*`.
  - `AITask/AICost.js`, which the session-report minion owns.
  - `core/Page/*` and `core/Router/*`, which belong to mastermind-page. Send it a message if you need a change there.

## Never

Never kill or restart the dev server. Never drive the owner's tabs. Never `git stash`. Run `node --check` on every file you touch. Findings go in your `session.jsonl` as `log` lines.
