# AI head: one row on every AI page

**The ask** (the owner, 2026-10-24 22:26, priority 1, the third time; [prompt 12727434](/framework/ai/sessions/2026/10/20/session-e00f55c9/prompts.jsonl)): the robot icon, the "AI" title and the top tabs sit in ONE flex row on every AI page, and the tabs swipe sideways. Nothing below may break.

## What was found

- On current `michael/dev`, every AI page under `/framework/ai/` already draws that row (the `.inbox-head` in `ai/page.js`, CSS in `ux/Inbox/Inbox.css` and `ai/rail/rail.css`). Checked headless at every width from 320 to 4000 px on the sessions list and the session page, and from the first paint.
- Two pages did not: **`/framework/ai/`** (the dashboard), which drew core's big "AI" title alone on its line with the link pills below, and **`/framework/ai/tasks/`**. The Tasks tab forwards to `/framework/ai/?live&recent=today&kind=task` (ai/tasks/SavedFilter.js), which the dashboard had captured: the Tasks tab opened the dashboard ([before](shots/before-tasks-1920.png)).

## What changed (branch `worktree/ai-head-row`, commit a798f2ba0)

1. `ai/page.js`: the head is one method, `head()`, drawn by the dashboard too. The first tab, which opens the dashboard, is now called **Home** (it said Inbox; the old Inbox is `/framework/ai/inbox/`).
2. `ai/page.js` `is_dash()`: a url with a query is an Inbox filter, so it keeps the rail. The Tasks tab works again.
3. `AIDashboard.css`: the page has no padding, so the head runs edge to edge as on the other AI pages; core's title and Folder link are hidden (the head names the page).
4. `AIDashboard.js`: the pill row leaves the top. Its links that the tab row already has (Sessions, Tasks, Queue) and Merge (the "Needs you" count links it) are dropped; the rest sit in a **More pages** row at the bottom.

## Proof

[dashboard 1920](shots/dashboard-1920.png) · [dashboard 390](shots/dashboard-390.png) · [Tasks tab, 1200](shots/tasks-1200.png) · [sessions 390](shots/sessions-390.png) · [session 1920](shots/session-1920.png). Probe: title and tab strip share a row on `/framework/ai/`, `tasks/`, `sessions/`, the session page and `queue/` at 390, 1200 and 1920; at 390 the head stays stuck at the top after scrolling 900 px.

## Alternatives

- The first tab could be called **Dashboard** (the owner's word for the page), but `/framework/ai/dashboard/` is already a tab with that name (the older grid of previews).
- The pill row could have gone into the head instead of the tabs: one row, but different tabs on the dashboard than on every other AI page.
