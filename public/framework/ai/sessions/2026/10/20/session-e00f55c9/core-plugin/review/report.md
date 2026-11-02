verdict: fix
1. [fix] No record that the server's tests ran (Requirements, fences). The brief says "never edit Server/Events.js callers without running the server's tests", and plan.md:62 and :92 promise all `Server/*.test.mjs` before and after. session.jsonl has commits and shots, but no test result. This diff changes the class-level `"new"` event for every server subclass.
2. [fix] Ask 1 is only half met: `Server/Events.js` is now `class Events extends Plugin {}`, so there are still two files named Events. The static and `"new"` half lives in Plugin, not in `core/Events`. Server/readme.md names the dependency, but not the owner's second sentence: "if the server moves to its own package, Events moves with it."
3. [fix] Stale readme: `core/Events/readme.md` and `doc/architecture.md` still say the mixin is "`on`, `off`, `emit`", while Events.js now adds `once` and `clear` and `off` matches `listener.fn`. Neither says that class-level events and `"new"` now live in core/Plugin.
4. [fix] `doc/investigation.md` was copied into `core/Plugin/doc/` with its task-folder links unchanged. `[requirements.md](requirements.md)` and `[../dictate-plugins/plan.md]` now resolve inside `core/Plugin/`, where neither file exists. It also still says "this file moves there … at execute", which is now history, and every "guess" in it is unresolved.
5. [fix] Two plugin systems remain (law 6): `Page.use(Ext)` → `Ext.setup(page)` at `core/Page/Page.class.js:36`, and it is still advertised in `core/Page/ext/Inbox/Inbox.js:129,144,156`. design-notes.md says "no callers" and leaves it, but neither `core/Page` nor `core/Plugin` says which one a new agent should use.
6. [fix] Ask 7 ordering: the owner asked for `before_<name>` / `after_<name>` hooks "where needed". design-notes.md says "There is no before_/after_ split" and does not say when one would be added or why none is needed now.
7. [fix] Ask 8 has no follow-up task: there is no task on the session for "Voice Chat onto core/Plugin". It is mentioned only in plan.md:56 and :112, so a fresh agent would not pick it up.
8. [fix] Ask 6, "expandos that twirl down to each plugin's settings": no shot shows a row opened, so the slider, the scrub number and the sections are unproven. The closed rows have no disclosure arrow (shots/…/1200.png, "Try it" band), so nothing tells the reader they open.
9. [note] Ask 3, "an agent can configure it all through the item tool": `Host.plugins` is an in-memory List with no page.jsonl or path. The item tool can't address it; only `.set()` deltas in code reach it. The test calls `.set()` directly.
10. [note] Investigation steps were skipped: no Haiku scouts, no web search ("Prior art … from memory, guess"), and the mixin utility the brief asked for was "not found". The brief asked for all three.
11. [note] "Classes using plugins right now" is written once. It doesn't redraw when a box is ticked, so "Shout (off)" stays after Shout is switched on (page.js, last section).
12. [note] design-notes.md's Cost section doesn't state the owner's own line: "a game with millions of objects should hard-code its calls". Debugging risk is one short paragraph.
13. [note] The live-result label is an all-caps h4 that wraps to 3 lines at 1200 (shots/…/1200.png, "Try it" band). The code block clips sideways at 400.

Widths given: 400, 1200, 1920, 3440 (one page, /framework/core/Plugin/).

## Requirements
- 1 "One Events class, not two" — no — Server/Events.js survives as a subclass of Plugin; static events live in core/Plugin, not core/Events
- 1b "Write that dependency down in the Server readme" — partly — Server/readme.md gains a line, but not "Events moves with it"
- 2 "class Plugin, in core/Plugin/, extends Events, A.use(B, C…)" — yes — Plugin.js: `class Plugin extends Events(Object)`, `static use(...plugins)`
- 2b "new instances tracked through the class's new event" — yes — constructor emits `"new"`; static emit walks the class chain
- 2c "propose a clearer word for setup" — yes — `attach`/`detach`, with `setup` kept as an alias (Plugin.js, end of file; investigation.md "Names")
- 3 "A.plugins is a lazy getter … a List" — yes — `static get plugins()`; test "A.plugins is lazy"
- 3b "turning off un-uses it … live instances let go" — yes — `disable()` calls `detach` on WeakRef'd live instances; test "unuse removes the hook"
- 3c "register itself as available before it's on" — yes — `available()`; test passes the Shout row (off) on the page
- 3d "own saved config; sub-plugins" — yes — `Plugin.store` key `plugin.<Host>.<Plugin>`; `PluginEntry.plugins`/`active`
- 3e "an agent can configure it through the item tool" — partly — rows are Items, but the List has no path the item tool can reach (note 9)
- 4 "maybe Item and List extend Plugin … measure first" — yes — measured at +0.37 µs (+27%); decided no (design-notes.md, "Cost")
- 5 "the server's plugins use core Plugin" — yes — through the Server/Events.js shim; but no recorded server test run (fix 1)
- 6 "code snippet with live preview of its control panel" — yes — shots/…/1200.png, code band and "Try it" band
- 6b "checkbox per plugin" — yes — Frame, Glow, Shout rows
- 6c "expandos that twirl down" — not shown — rows are `<details>` with no visible arrow; no opened shot (fix 8)
- 6d "sliders, scrubbable numbers, sections" — in code, not shown — page.js `scrub`, `control`, `Object.groupBy` by section
- 6e "mobile-friendly" — yes — shots/…/400.png: panel and result stack, no overflow (layout.json overflow_x false)
- 6f "check what UI controls exist first" — partly — investigation.md lists ui/controls and ext/Panel, then builds its own scrub
- 7 "design-notes doc" — partly — events/extension/mixins, no-override and use-only-where-needed are there; before/after is refused (fix 6); the "millions of objects" line is missing (note 12)
- 8 "Voice Chat as a separate follow-up" — no — no task filed (fix 7)
- Process: Haiku scouts, web search, mixin utility — no — investigation.md says so itself (note 10)
- Class shown with live instances — partly — `Plugin.hosts` is listed on the page, but it is a one-time snapshot (note 11); there are no per-instance rows
- Index / continuity — no — core/Events readme is stale (fix 3), investigation links are broken (fix 4), there is no test record (fix 1) and no follow-up task (fix 7). A fresh agent could not tell from the folder whether it is safe to merge.

## Page structure
- the title says what it is — yes — "Plugin", shots/…/1200.png, top band
- one takeaway first — yes — the intro paragraph and the snippet come before the demo
- show, don't tell — yes — a live control panel beside a live result
- readme reachable — yes — `md.details` Readme at the foot (layout.json band md-details)

## Navigation
- identify — a sidebar (≥1200), a bottom rail (400), expandos (details) inside the content
- the sidebar marks the current page — yes — "Plugin" highlighted under Core, shots/…/1200.png
- the bottom rail at 400 — yes — shots/…/400.png, bottom band; its labels wrap 3.2 lines (layout.json wraps), as on other pages
- the expandos show that they open — no — no disclosure arrow on the rows (fix 8)
- tab_rows — n/a

## Layout
- the layout fits the content — yes — layout "standard" at every width; one reading column
- the demo pairs the panel and the result side by side, and stacks them on mobile — yes — 1200 side by side, 400 stacked
- wide screens — yes, with a note — empty 0.683 at 1920 and 0.777 at 3440; the content stays one measure, as the standard layout intends

## Sizing
- the controls are a size you can tap — yes — the rows have minHeight 2.75em, shots/…/400.png
- the panel and result size to what they hold — partly — at 1200 the panel box is stretched taller than its three rows, which leaves empty space under Shout (shots/…/1200.png, "Try it" band)
- text measure — yes — widest_text 548 at 1200, 368 at 400

## Wrapping
- headings — yes, with a note — "Classes using plugins right now" wraps to 2 lines at 400 (layout.json), which is acceptable
- the live-result label — no (small) — 3 lines at 1200 (note 13)
- code — no (small) — the snippet clips sideways at 400 (shots/…/400.png, band 3)
- overflow_x — yes, no overflow at any width

## Spacing and padding
- the page pad grows with width — yes — left_stack p 16 / 38 / 54 / 90 at 400 / 1200 / 1920 / 3440
- the rhythm between sections — yes — even gaps between the title, the intro, the code and "Try it" in the bands
- inside the panel — yes — rows padded evenly, with dividers

## Colour and contrast
- the text reads — yes — dark on light; the code block is light on dark
- the accent is used for state only — yes — orange checkboxes for "on"
- the muted labels are readable — yes — the h4 label is grey but legible at every width

## Flow
- read order — yes — what it is → code → try it → who uses it → readme
- state survives a reload — yes — localStorage store (page.js top)
- feedback on change — yes — the badge redraws on each change; the host list does not (note 11)

## Words
- plain sentences — yes — the intro defines "plugin" before using it
- every word earns its place — yes — the paragraphs are short
- the owner's names — yes — Plugin, `use`; `attach` is proposed and explained
- no history in the readme — yes — readme.md is current; investigation.md still reads as a dated plan (fix 4)
