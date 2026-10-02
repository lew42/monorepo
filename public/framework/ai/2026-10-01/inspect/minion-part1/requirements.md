# Part 1: `inspect()` — the house pattern for seeing any object

You are a Sonnet minion. Load the `minion` skill first. Your parent is task-mastermind-inspect;
its task dir (full transcript, the owner's raw words) is
[public/framework/ai/2026-10-01/inspect/](../). Read `../owner-words.md` and `../requirements.md`
before you start — they're short. This brief is just Part 1 of that; Part 2 (the Dictate
playground) is a separate minion, after you land.

**Work in the worktree already up:** `C:\Code\lew42\worktrees\inspect` (proxy
`http://inspect.localhost/`, branch `worktree/inspect`). Commit there; don't touch the main tree.

## Why (the owner's own words, trimmed — full text in `../owner-words.md`)

The owner wants every class to carry its own icon and a built-in "show me what you are" view,
separate from whatever `render()` a class already has for its real UI. "An inspect method...
renders its icon and its instance name and its class name... like a log view... these content
cards and context cards." A class gets a bigger, more formal version of the same card — "the
whole inspect card... the class card essentially." This is step one of a bigger plan: once this
exists, Part 2 uses it to turn the Dictate playground into a live diagram of real objects.

## What already exists — build on it, don't duplicate (law 6)

Read these three files first, in full:
- `/framework/ux/Content/Object/Object.js` — `object(subject)`: one small card (class name,
  `name = value` per property, method names). This is the "card" look you extend.
- `/framework/ux/Content/Object/DefaultView.js` — `view(thing)`: a lazy tree of `ui/item` rows.
  A class overrides it with `static View = class extends DefaultView {...}`.
- `/framework/code/objects/readme.md` — the existing pattern: "every class ships a view of its
  state," at three sizes (chip, row, panel) — your `minimal`/`card`/`full` variants ARE this.

Also skim `/framework/ux/Content/Object/readme.md` and `/framework/code/patterns/readme.md`
("parts as statics," the `Thing.View = class...` convention `static icon` follows).

## Deliverables

1. **`static icon = "material-symbol-name"`** — a convention, not a new mechanism: any class may
   declare it (default to `"data_object"`, the same fallback `DefaultView` already uses, when
   absent). Read it off `subject.constructor.icon` (instance) or `subject.icon` (the class
   itself). Render it with the site's existing `icon()` (`ui/icon` — `import { icon } from
   "/app.js"` or wherever `ObjectCard`'s render already imports from `core/View/View.js`; check
   how `DefaultView`'s `item({ icon: "data_object", ... })` already does it and match that).

2. **`inspect(subject, opts)`** — a new function, same one-call shape as `object()`/`view()`
   (`ux/Content` modules are always "one call, everything in one data object"). Put it in a new
   file, `Inspect.js`, beside `Object.js`. This is the `render()`-separate debug/inspector view
   the owner asked for — it never touches or requires a class's own `render()`.
   - **Instance card** (`inspect(someInstance)`): icon (bigger than `object()`'s, enough to read
     as "a definition," per the owner), instance name if it has one, class name, the key
     properties (same selection rules `ObjectCard.own_properties()` already uses, or an explicit
     `properties:` override), and — the new part — **a property whose value is itself an object
     or array renders as a NESTED `inspect()` card, not a one-line description.** Recursive: a
     nested card's own object properties nest again. Guard cycles the same way
     `DefaultView.expandable()` does (a `path` Set of ancestors; a value already in it shows
     "↺ already open above" instead of recursing forever) — reuse that exact idea, don't invent a
     second one.
   - **Class card** (`inspect(SomeClass)`): the SAME icon, in a visibly bigger/heavier frame (the
     owner: "a more substantial frame... the icon is bigger... looks like a class definition").
     Lists properties AND methods together, core API members first (pass an explicit `properties:
     methods:` order the same way `object(Page, {properties: PAGE_PROPERTIES, methods:
     PAGE_METHODS})` already does on this module's own `page.js` — don't invent a second
     "core API" detector), each member as its own small nested card/row, not a flat list.
   - **Three variants**, a `variant:` option: `"minimal"` (icon + instance/class name only — the
     owner compared this to "an Inbox context card" — check `/framework/ext/Mention/` or wherever
     Inbox's context chip lives for that exact look and match its size), `"card"` (the default —
     everything above), `"full"` (same as card today; leave a clear seam — a comment naming what
     "full" should eventually add beyond card — the owner hasn't decided that detail yet, record
     it as a decision/caveat in your log rather than guessing).

3. **One default view, not an array.** Keep `Thing.View = class extends DefaultView` as the one
   override mechanism (already true). Do NOT add a `views: []` array — the owner raised it as an
   option he's used before, then named its own cost himself ("tricky too for updates... have to
   loop through each view"). Log a one-line `decision` in your task.jsonl recording that you kept
   one view and why, so it's not re-litigated.

4. **Document it.** Two small doc edits, not a rewrite:
   - `/framework/code/objects/readme.md` — add `inspect()` to its "Use" block and Index (it's the
     fourth size: "the debug view," alongside chip/row/panel), one line, link to your new doc.
   - `/framework/code/objects/doc/views.md` — append a short "render vs inspect" section: render()
     is the object's own real template (or absent); inspect() always exists, is never the same
     method, and is for seeing structure, not using the thing.
   - `/framework/ux/Content/Object/readme.md` — add `inspect()` next to `object()`/`view()` in its
     "Two ways in" list (now three), with a one-line example, same style as what's there.
   - **A class's doc page opens with its class card:** prove this on ONE real page —
     `/framework/ux/Content/Object/page.js` itself. Add a short section, near its existing
     `object()`/`view()` demos, showing `inspect(Page)` (the class card) and `inspect(somePage)`
     (an instance card, nested properties visible) side by side. This is the "show it, then use
     words" proof — don't just claim it opens with the card, make this page's own content block
     actually do it.

5. **CSS.** New rules go in `/framework/ux/Content/content.css`, inside the existing layer that
   file already uses (check its top — probably `@layer site` or similar; match it, never add a
   bare untiered rule — see CLAUDE.md "every CSS rule inside a layer"). Class names follow the
   existing `ux-content-object-*`/new `ux-content-inspect-*` prefix convention — run the `css` and
   `new-css-class` skills before naming anything new.

## Fence (yours only — nothing outside this list)

- `public/framework/ux/Content/Object/Object.js`
- `public/framework/ux/Content/Object/DefaultView.js`
- `public/framework/ux/Content/Object/Inspect.js` (new)
- `public/framework/ux/Content/Object/page.js`
- `public/framework/ux/Content/Object/readme.md`
- `public/framework/ux/Content/content.css`
- `public/framework/code/objects/readme.md`
- `public/framework/code/objects/doc/views.md`

If you find you need a file outside this list, stop and say so in your task log rather than
editing it — tell your parent (task-mastermind-inspect) before touching anything in
`ux/Dictate/` (claimed by a sibling minion, Part 2, landing after you).

## Prove it, don't just build it

- Screenshots at **400** and **1920** of `/framework/ux/Content/Object/` (your new section),
  through the worktree's own server (`http://inspect.localhost/framework/ux/Content/Object/`).
- `node Server/merge.mjs <worktree> /framework/ux/Content/Object/ /framework/code/objects/` before
  you tell your parent you're done — zero console errors, zero failed requests.
- Open your own `inspect()` card and check by eye: does an instance card actually nest a real
  array/object property as a smaller card inside it, not just say "Array(3)"? That's the one
  thing a screenshot proves that a green build doesn't.

## Land

Own task dir: `public/framework/ai/2026-10-01/inspect/minion-part1/` — open it with `new-task`
before your first edit (parent_task: `public/framework/ai/2026-10-01/inspect`). Log milestones
and the one decision above as you go. When done, tell task-mastermind-inspect directly
(`send_to_agent`) with your task dir path — don't wait to be asked.
