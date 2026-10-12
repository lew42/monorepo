# Past work: templates, Item events, Property, parts, binding

Short map of what already exists, so the Template work builds on it and does not repeat it. Paths are repo files; commits are hashes you can open with `git show`.

## 1. Page templates and layouts as pages

- The owner's idea of "layouts wrapped as pages" is new as a name, but the pieces exist: a page is already a class that draws itself, and `Page.render_content_list()` draws each part through its class's `View`. See [core/Page/doc/content.md](/framework/core/Page/doc/content.md).
- Sessions already use one class per page: every Sessions page extends `Page` and names its template. See [ai/sessions/doc/archive/templates.md](/framework/ai/sessions/doc/archive/templates.md).
- A layout drawer exists as a class: `public/layouts/Layout.js` draws a wireframe from real CSS, with no content. See [layouts/doc/decisions.md](/framework/layouts/doc/decisions.md).
- Layout work is big and scattered: commit `969c85410` (night wave A: 18 numbered layouts, stacks vs splits), `ada01ac99` (layout system audit), `3e5d8eec5` (Figma autolayout pages).
- The paging/template idea was studied in [ai/sessions/2026/09/05/paging-templates/requirements.md](/framework/ai/sessions/2026/09/05/paging-templates/requirements.md): templates should be usable as page content, with storage.
- `ext/panel` has its own template list (`templates = { name: { icon, draw } }`, 23 entries) in [ai/sessions/2026/08/13/panel/templates.md](/framework/ai/sessions/2026/08/13/panel/templates.md). It is a plain object of draw functions, not a class.
- Commit `ad53150ef` added `core/Page/dynamic/`, a dynamic page as its own concept, separate from routing.

## 2. Item and its events

- `Item` is `Events(Object)`: `on`, `off` and `emit` come from a mixin. See [core/Item/readme.md](/framework/core/Item/readme.md), landed 2026-10-02 (`9f66f0dbb`).
- Events bubble: a parent hears a child's event without subscribing to the child. See [core/Item/doc/method/emit.md](/framework/core/Item/doc/method/emit.md).
- Listeners run in registration order, and adding the same function twice calls it twice, because nothing dedupes. See [core/Item/doc/method/on.md](/framework/core/Item/doc/method/on.md). This is the most likely source of the "updates when they should not" trouble the brief mentions.
- The decision to use events, not a `views[]` list, is in [core/Item/doc/decisions.md](/framework/core/Item/doc/decisions.md) (line 61). Root autosave is one listener.
- Ids are a known trap: `Date.now()` collides inside 1 ms, so `decisions.md` requires a stable handle.
- `List` also gets events built in, so there is no event-less list any more.

## 3. Old `Property` class or property binding

- No `class Property` exists in git history (`git log --all -S "class Property"` finds nothing). The owner's earlier Property object is not in this repo under that name. Ask the owner for the file or the name they remember, or treat it as lost.
- The word "property" in the repo means a doc folder, not a class: `core/Page/doc/property/` (one doc per page key such as `title.md`, `data.md`) and `core/Item/doc/property/` (`data.md`, `id.md`, `saver.md`). See [core/Page/doc/property/](/framework/core/Page/doc/property/).
- `core/Page/doc/property/data.md` shows the one-word style: `data: true | {…} | absent`, so a page with no data costs no fetch.
- Commit `8e2d29713` ("patterns: property named after its class") is the nearest rule: a property is named after its class.

## 4. `core/Page/parts/`, `content.md`, `ai-api.md`

- **parts:** a page body is a list of parts, stored as lines in its own `page.jsonl`. Line 1 names the class; later lines add, move or remove parts. Each part is an `Item` with its own `View`, with no base `Part` class. See [core/Page/parts/readme.md](/framework/core/Page/parts/readme.md).
- **content.md:** a page has three kinds of stuff with one name each: `page.pages` (child pages, navigation), `page.content` (blocks, a list of `Item`s), and code `content(){…}`, which is one more part. See [core/Page/doc/content.md](/framework/core/Page/doc/content.md).
- **ai-api.md:** an agent changes a page with one tool, `page_set`, and reads it with `page_read`. A change is a JSON delta applied key by key: a plain key sets a property, a method key calls a method, an id key walks into an item. See [core/Page/doc/ai-api.md](/framework/core/Page/doc/ai-api.md).
- The delta model is the closest thing to property binding that already works: every open tab redraws within about a second when a line is appended.

## 5. Data binding, clone, Object.create

- The brief asks for `clone({ title, cost: someProperty })` and a live Property. Nothing in the repo does this yet; no file uses `Object.create` for a template.
- `core/View/doc/decisions.md` (around line 70) lists `clone`/`repeat` as View methods, and says `repeat()` once threw away every clone it made. That is the warning: clones need their own listener cleanup.
- `ux/Tree/Tree.js` (line 465) notes that a clone takes its real width, so a ghost hugs its content. Cloned DOM is a known source of layout surprises.
- The phrase "data binding" appears only in briefs and audits, not in any finished doc. Treat the binding design as new.
- Commit `674fd2d15` ("added socket") and `ada01ac99` touched `Object.create` in `core`; not a design, so do not copy it.

## What it means for Template

- Keep the base: `class Template extends Page`. A page already draws parts, owns a `page.jsonl`, and has events through `Item`. Nothing new is needed underneath.
- Reuse `Item` events for binding. A bound field is an `Item` listener, not a second system, so one fix covers every use.
- Put the clone rule first: a template rendered twice must keep its own listeners, or the events bug from section 2 comes back.
- Name the data side by the existing pattern (`core/Page/doc/property/`, one doc per key), so a template field is a property, not a new word.
- Before building the Property object, ask the owner once for the old file (section 3); if none is found, record that in the Template architecture page and build the small slice.
