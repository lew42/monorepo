# System — the shape, for the architect

**The ask:** "the framework design, framework code, framework UI, maybe framework UX … the same top tabs" and "where's our System class? Didn't it extend Page?"

**What it is:** `core/System/System.js` — `class System extends Doc` — one class, so one fix now reaches every system at once.

```js
export default new System({
	meta: import.meta,
	title: "Design", icon: "palette",
	children: "layout color navigation content ui",
	concepts: [{ name: "Layout", slug: "layout", icon: "view_quilt" }, …],
	omit: "parts",          // the parts are tiles on the Overview, not tabs
	content(){ md("…"); },  // the intro, between the tiles and the readme
});
```

Or with no `page.js` at all — line 1 of a bare `page.jsonl`:
```json
{"class": "/framework/core/System/System.js", "title": "Demo", "concepts": […]}
```
Both are live: [core/System/](/framework/core/System/) (a `page.js`) and [its Demo tab](/framework/core/System/demo/) (one `page.jsonl` line, no `page.js`).

## What it adds, on top of Doc's own Overview · API · Docs · Files
- **Concept tiles** on the Overview — the module's own parts, shown, not told.
- **An Inbox tab** on every system, so any agent can leave a note.
- **`omit:`** — one word that drops a derived tab (`"api"`, `"overview"`) or every declared child at once (`"parts"`), without breaking its url.

## The five instances
| System | Was | Now |
|---|---|---|
| [Design](/framework/design/) | `Doc` | `System`, `omit: "parts"` |
| [Code](/framework/code/) | `Doc` | `System`, `omit: "parts"` |
| [UI](/framework/ui/) | `Doc` + hand-rolled `bar()` | `System`, `omit: "parts"` |
| [UX](/framework/ux/) | plain `Page` + hand-rolled `route()` | `System`, `omit: "parts"` |
| [AI](/framework/ai/) | plain `Page`, hand-rolled Inbox/Log/System tabs | `System`, `omit: "overview"` — own sub-task, landing separately (main's `ai/page.js` has moved substantially since this branch started; a blind merge risked the newer AIRail work, so it's being redone against current `main` rather than force-merged) |

## One real bug found and fixed landing this
Doc's `notes:` config word (doc section names) and the Inbox extension's `page.notes` (an array it collects note lines into, added 2026-10-02) share one property name — `ext("Inbox")` is async and clobbers `this.notes` after `initialize()` returns, breaking `bar()`'s later reads. Worked around inside `System.js` (captures the config value before Inbox runs); the two-`notes`-names collision itself still belongs to `ext/Doc`/`ext/Inbox/Inbox.js`, logged as a `need`, not fixed there (outside this task's fence).

## Landed
Commits on `worktree/ui-system-clean-land` (cherry-picked clean off current `michael/dev`, since the original `worktree/ui-system` had unrelated orphaned WIP blocking merge): the class, `core/System/`'s module (readme, page.js, doc/system.md, the demo), and the Design/Code/UI/UX conversions. Reviewed (`node Server/review.mjs`) clean. AI's conversion stays its own commit, to follow once redone against current `ai/page.js`.
