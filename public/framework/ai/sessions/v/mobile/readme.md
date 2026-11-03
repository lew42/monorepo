# Mobile sessions: the phone variant

Four pages sized for a 400 px phone, on real session data, that you tap through: day list, then session, then task, and back. Open it at [/framework/ai/sessions/v/mobile/](/framework/ai/sessions/v/mobile/). The design is [mobile-cards.md](../../doc/mobile-cards.md).

## The pages

| Page | URL under `v/mobile/` | Class |
|---|---|---|
| Day list | `/` today, `<yyyy>/<mm>/<dd>/` | `MobileHome` (extends `AISessionsPage`); `MobilePath` collects the date segments |
| Nested sessions | `all/` | `MobileAll` (extends `MobileHome`) |
| One session | `<session id>/` | `MobileSession` (extends `AISessionDetail`; its menu is the real `head_tools()`) |
| One task | `<session id>/<task path>/` | `MobileTask` (extends `Page`; deeper folders extend the path) |

`page.js` builds `MobileHome` and hangs `All`, `Session` and `Task` on their parents as statics, so no file imports its own subclass.

## Parts

- `MobileData` reads: the day's `sessions/YYYY/MM/DD/index.json` (one snapshot per session), `sessions/session-tree.json` (parent, role) and `ai/index.json` (every task, through `SessionTree`). It computes groups, kinds and outcome lines; nothing is typed.
- `MobileRow` is a session row, `MobileTaskRow` a task row. `SwipeTabs` is the scroll-snap tab strip. `MobileRun` is the run indicator: a dot, a "next" mark computed from a running series parent, and the buttons that fit the state. A press appends the task's own verb (`start`, `pause`, `resume`, `stop`) through `core/Task`.
- The one segmented bar is `TaskView.draw_bar` (`core/Task/TaskView.js`); nothing here draws its own.
- `mobile.css`, class prefix `mob-`.

## Outside this folder

`AISessionsPage.route()` hands the name `v` to this folder's page; `TaskView.draw_bar` and `TaskView.css` carry the amber and red states; `styles/css-scopes.txt` lists `mob-`.

## Watch out

- The generated files (`ai/index.json`, `session-tree.json`, the day indexes) are gitignored; a fresh worktree needs them copied or built.
- `session-tree.json` is built by a script and can be days old, so a newer minion shows no parent. The page does not guess one.
