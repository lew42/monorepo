# Minion C — object views: DefaultView, `Thing.View`, `track`, the live Page and App

Load the `minion` skill first, then `code`, `page`, `new-page`. The owner's words: `public/framework/ai/2026-09-29/item-ui/owner-words.md` (read in full, especially from "in terms of the object oriented structures"). Task brief: `../requirements.md`, Phase 2 (deliverables 6–9). Card: `2026/09/29/item-ui-and-object-views-icon-items-tree`.

**Built on what landed before you** (read both first):
- `ui/item/` — the icon item (`item()`, class `.item`, nests into a tree). Your view renders WITH it.
- `ux/Content/Object/doc/census.md` — which classes deserve a view, and which Page/App properties to show first.
- `ux/Content/Object/Object.js` — the object card built 09-28. **Keep it working and reachable as v1**; your view is a new thing beside it, not a rewrite.

**Work only in the worktree** `C:\Code\lew42\worktrees\item-ui` (server http://localhost:49318/). Commit there by exact path. Log in your own task.jsonl beside this file (`node .claude/hooks/append.mjs`).

## The owner's words for your part
"every instance basically can be a card. In fact, every class can easily track its new instances by just in the constructor calling the class dot track … on the core page page, we could see a little page object that has the page name and indicates that it's an instance of a page and has maybe the core properties like children or nav or files … for the app itself … look at this current app and go into its settings and see … the current route … the default view for any class might even be automatic. It just loops through its own properties and renders a default view just doing a best guess. And then maybe you can override that. The pattern I've often used in the past is Thing.View … `Thing.View = class ThingView extends View`."
Also: "using a dot in front of the property name is probably the best … to indicate this is a property."

## Build (names are decided: `DefaultView`, `track`, `Thing.View`)
6. **`DefaultView`** in `ux/Content/Object/DefaultView.js`: give it any instance; it draws a header item "a Page" (article + class name, plus the instance's own name/title if it has one), then one `.item` per own property, the name written with a leading dot (`.children`, `.nav`). A value that is an object or array becomes an expandable item whose children are its properties / entries, drawn lazily on open (so cycles and huge graphs cost nothing until clicked; also guard cycles). Primitives show inline after the name. Skip functions and DOM nodes by default, like ObjectCard does.
   **The override:** a helper `view(thing)` returns `new thing.constructor.View({ subject: thing })` when the class (or a parent class) defines `static View`, else `new DefaultView({ subject: thing })`. Show one class with a hand-written `static View = class extends DefaultView {…}` override on the demo page, beside its default, so the difference is visible.
7. **`track`**: opt-in instance tracking. `Class.track(this)` in a constructor records the instance for that class (a WeakRef set, or a plain array if you justify it — say which in a `decision` line). `Class.instances()` reads them back. Put it where any class can take it with one line (e.g. a tiny `core/track/track.js` exporting `track` to be installed as a static, or a mixin — pick the simplest; log the decision with the runner-up). Don't make every class track by default.
8. **First uses:**
   - A live **Page object** for `/framework/core/Page/`. Cleared by task-mastermind-page-system, exactly this and no more: (a) add ONE line `Page.track(this)` in the constructor in `core/Page/Page.class.js` (plus the import/static it needs); (b) write the block as its own module `core/Page/object.js` exporting `page_object(page)` (the Page instance drawn as a DefaultView: name, "a Page", `.children`, `.nav`, `.files`…). **Do NOT edit `core/Page/page.js`** — page-system's layout minion is reworking it and places the call itself. Show the block live on a page of your own at `ux/Content/Object/page/` ("the Page object").
   - The **App**: `ux/Content/Object/app/` — the running app: its current route and its settings, as items.
   - Both linked from `ux/Content/Object/page.js` (add to its `children:`), with the demo page showing: the Page object, the App object, and the override example, at full width.
9. **The `code` skill**: add a short OOP section to `.claude/skills/code/SKILL.md` in the worktree (at most 10 lines): `Thing.View` as a static subclass, `view(thing)`, `DefaultView` as the fallback, `Class.track(this)` opt-in. Link the demo page.

Update `ux/Content/Object/readme.md` (index shape) and add `doc/default-view.md`.

## Done means
- [ ] `/framework/ux/Content/Object/`, `/framework/ux/Content/Object/page/`, `/framework/ux/Content/Object/app/` and `/framework/ui/item/` load with zero console errors and zero failed requests on http://localhost:49318.
- [ ] Screenshots at 1920 and 400 of the Object page and the Page object page (Playwright headless, script in the scratchpad named `item-ui-c-*.mjs`), saved beside this file; you looked at them. Expanding `.children` in the Page object shows child items — prove it with a shot after a click.
- [ ] Committed in the worktree. Reply with files changed, the shot paths, and your two decisions (track storage, track location).

Never: touch main-tree copies, restart servers, open windows (`windowsHide: true`), break ObjectCard's existing callers (grep `Object/Object.js` for them). Budget: about $5.

