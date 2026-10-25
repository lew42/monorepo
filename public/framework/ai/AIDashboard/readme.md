# AIDashboard `ai/AIDashboard/`

The default page at `/framework/ai/`: what matters most, in order. A place to say something, what needs the owner, the big things now, what is running, the task queue, usage pace. The day's sessions list is one click down, at `/framework/ai/sessions/`; the old Inbox is at `/framework/ai/inbox/`. Brief and shots: [ai-dashboard task](../../core/Page/tasks/page-mastermind/ai-dashboard/requirements.md).

## Structure (one class per file)

| File | Class | Job |
|---|---|---|
| `AIDashboard.js` | `AIDashboard extends View` | the page body: a three-column grid (two columns at 60em, one on a phone), then usage pace, then the pill row |
| `DashNeeds.js` | `DashNeeds extends View` | "Needs you": waiting count + top 3 rows, and the ready-to-merge count + top 3 |
| `DashBig.js` | `DashBig extends View` | "The big things now": each `### N. Title` in `ai/priority.md` with its `- **Now:**` line, cut to whole sentences |
| `DashQueue.js` | `DashQueue extends View` | "Task queue": count and the top 3 by score |
| `UsageLine.js` | `UsageLine extends View` | usage pace, one line (`ai/usage/UsagePace.js`); removes its whole section when there is no `usage.json` |
| `PageNav.js` | `PageNav extends View` | a row of pill links (`links: [{href, label, title, primary, count}]`); the dashboard, the sessions page and `/live/` use it. `PageNav.merge_link()` is the Merge pill with the waiting count |
| `AIDashboard.css` | | all rules `ad-` prefixed, in `@layer site` |
| `PageNav.css` | | the pill row, `pn-` prefixed; on a phone the row is one line that scrolls sideways |
| `SessionStore.js`, `SessionTree.js`, `SessionRow.js`, `DayStrip.js`, `OriginChips.js` | | **not used by this page any more** (it used to be the sessions list). Kept, not deleted; nothing imports them |

`page.js` shows the dashboard when the path is exactly `/framework/ai/`. Plan history: [doc/ai-dashboard-plan.md](../doc/ai-dashboard-plan.md).

## Where each section reads from (verified against the code)

| Section | Source | How |
|---|---|---|
| Say something | `ux/Dictate/chat.js` (`chat(el, {keep:true})`), the one global chat box | reused, not rebuilt |
| Needs you: waiting | Servex `GET /waiting` (decisions, questions, blockers, asks) | read once |
| Needs you: ready to merge | Servex `GET /api/ready-to-merge` (`Server/ReadyToMerge.mjs`), the same list as `/framework/ai/merge/` | read once |
| Big things now | `ai/priority.md` | fetched once |
| What is running | `AINow` (`ai/now/AINow.js`), the "inflight" query | **the page's one live source** |
| Task queue | the "taskqueue" query, as on `/framework/ai/queue/` | asked once; the client hands `QueryClient.current` straight back |
| Usage pace | `ai/usage.json` | read once |

A failed read is said out loud ("Servex did not answer…"); a count is never drawn from a failure.

## Watch out

- **Only one live `QueryClient` per page.** Pushes route by `QueryClient.current`, so `DashQueue` saves and restores it. A second live client would starve "what is running".
- `render()` runs before subclass fields exist: set state in `initialize()`, use getters for `classes`.
- Links to other ai pages use `target=_self` so the root page rebuilds.
- A worktree server lacks the gitignored `index.json`, `usage.json`, `tasks.json`; those 404 there (allow-listed warnings), so a worktree shows layout, not data.
