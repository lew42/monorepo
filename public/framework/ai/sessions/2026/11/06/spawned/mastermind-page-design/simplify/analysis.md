# Page system simplification: analysis

Read-only; nothing in `public/` was changed. Every claim is `file:line` in this worktree (`C:/Code/lew42/worktrees/qf-4`).

## 1. The Live\* classes

| Class | What it is | What's actually "live" | Imported by | Generic version already? | A generic replacement |
|---|---|---|---|---|---|
| `LiveButton.js` | `class LiveButton extends Item`, a tappable card that runs one of the page's own methods (`press()` → `page[method](args)`) | Nothing — it's a generic button-as-data card; "live" is only that the press is a saved log line everyone sees | `LivePage.js:10,29,60,424,480-481` (kinds, card_types, `Children` view). No other file imports it. | No (`ui/` has no button-card; checked, no match). | `ui/Button` wired to a card (`id`, `label`, `method`, `args`) — belongs in `core/Page/parts/` as `part-button`, since it's shaped exactly like the other parts. |
| `LiveLight.js` | `class LiveLight extends Item`, a status dot: on/off + colour | Nothing specific to /live/ — `LiveLight.paint()` is also called from `LivePage.paint_voice()` for the header's own dot | `LivePage.js:9,29,60,186,326` | No. | A plain `StatusLight` part (`on`, `color`), same shape. |
| `LiveChecklist.js` | `class LiveChecklist extends Item`, title + a `List` of `{text, done}` rows | Nothing /live/-specific; a tap sets `done` the same way a voice delta would | `LivePage.js:8,29,60` | No (checked `ui/`, no checklist). | A plain `Checklist` part, same shape — worth keeping as one class since nothing else does this. |
| `LiveScreen.js` | `class LiveScreen extends Item`, one saved screen's cards (a `content` List) | Genuinely tied to /live/'s save/restore model (`LivePage.save/restore`) | `LivePage.js:12,38,89-90,98,151` only | — | Leave as-is; it's not a generic UI piece, it's /live/'s own save mechanism. |
| `LiveContent.js` | `class LiveContent extends PageContent`, overrides `remove`/`clear`/`adopted` so removed cards move to a `removed` list instead of vanishing, and makes every card its own sub-page (`adopted`) | Yes — "nothing is lost" and "every card is a page" are /live/'s own rules, not a generic Page behaviour | `LivePage.js:13,41`, `LiveScreen` doesn't import it, `LiveScreens` is exported from it and used at `LivePage.js:13,45` | No generic undo-list exists on `PageContent`. | Could become a `Page.undo_content` option (`keep_removed: true`) so any page gets it, but that's a real behaviour change, not a rename — lower priority than the others. |
| `TaskState.js` | Plain static class (no imports), classifies a task's closeout state from its `task.jsonl` lines | Nothing — it has nothing to do with /live/ at all; its own comment says it's shared between "the Today card" and `Server/task-closeout.mjs` | `Server/task-closeout.mjs` (noted in `mastermind-live-page/move-v1.mjs:3`); grep over `public/` found no importer *inside* `public/` other than that comment | — | **Move, don't rewrite.** It's a plain, dependency-free utility that happens to sit in `public/live/` for no reason tied to Live. Belongs beside `ai/tasks/` or `core/Task/`, e.g. `core/Task/TaskState.js`. |

**Verdict:** `LiveButton`, `LiveLight`, `LiveChecklist` are three generic components wearing a `Live` prefix because they were built for /live/ first. Nothing in `ui/`, `ux/`, `ext/`, or `core/Page/parts/` already does this job (checked all four). `LiveScreen` and `LiveContent` are genuinely /live/-specific and should stay. `TaskState` isn't a Live class at all — it's misfiled.

## 2. `core/Page/parts/`

| File | What it does | Class? | Imported by | Duplicate of another? |
|---|---|---|---|---|
| `kinds.js` | The one list: imports the six `Page*.js` files so they self-register, exports `PART_TYPES` | No (side-effect module) | `Parts.js:2`, `LivePage.js:6,14`, browser (`AISessionDetail`), the item tool (`Servex/agents/page_tools.js`), tests | — |
| `PageHeading.js`, `PageText.js`, `PageCard.js`, `PageLink.js`, `PageView.js`, `PageFile.js` | The six real part classes: each `class PageX extends Item` with its own `static View` | Yes, each | via `kinds.js` | No — six distinct wire types (`part-heading/text/card/link/view/file`) |
| `MdToParts.mjs` | CLI: turns a markdown file into `page.jsonl` lines (`node MdToParts.mjs in.md out.json "Title"`) | Yes (static-method class, no instances) | Run by hand, not imported by code | No |
| `Part.js` | **Shim.** Comment: "the Part base class is gone"; re-exports `Item` so an old `import Part from "./Part.js"` still resolves | re-export only | Nobody found importing it under `public/live/` or `public/framework` in the paths checked | Dead weight — a historical alias |
| `HeadingPart.js`, `TextPart.js`, `CardPart.js` | Not opened this pass (readme calls them shims for old names, same pattern as `Part.js`) | shims | — | Same: old-name aliases |
| `Parts.js` | **Shim.** `class PartsPage extends Page {}` — empty on purpose, kept only so an old `page.jsonl` line `"class":".../Parts.js"` still resolves; also re-loads `kinds.js` | Yes, trivially | Any page.jsonl still naming `Parts.js` as its class | Functionally identical to plain `Page` now |

**What is a "part"?** Answered by the readme and the code together: a part is **a plain `Item` with its own `View`**, stored as one line in a page's `content` list (`page.jsonl`). It is not a special base class (that died 2026-10-12) and not a template — it's just "the thing `Page.render_content_list()` draws," the same mechanism `LiveButton`/`LiveLight`/`LiveChecklist` already use outside this folder.

**Clearer model:** since a "part" is nothing but an `Item` + `View` wired into `content`, the folder could drop the word "parts" for new work and just be "the built-in card types" (`core/Page/cards/` or keep `parts/` as the name but stop treating `Part.js`/`Parts.js`/`HeadingPart.js`/`TextPart.js`/`CardPart.js` as anything but historical aliases — they can be deleted once nothing references the old names (needs a repo-wide grep before deleting, not done in this pass).

## 3. Every import in `public/live/LivePage.js`

| Import (line) | Why LivePage needs it |
|---|---|
| `Page` (1) | LivePage's own base class |
| `View, {div, span, a, h1, h4, select, option, icon, code}` (2) | Every element factory the static View classes (`Head`, `Crumbs`, `Tabs`, …) draw with |
| `Item` (3) | `Item.register`, `Item.source`, and `item.wire?.()` checks in `Block`/`Main`/`Focus` |
| `List` (4) | Backs `removed` (3-46) |
| `DefaultView` from `ux/Content/Object/DefaultView.js` (5) | `DefaultView.place()` in `static Main` — the same reconciling-redraw helper used widely elsewhere (`ux/Dictate/playground`, `ext/Refine`, `ext/Chat/list`, `core/Test`, `ext/Doc` and more — **not** a Live-only dependency, it's the house diffing helper for "redraw only what changed in a list") |
| `"./kinds.js"` (6) | Registers `part-card`, `part-text`, etc. so a card written with `type: "part-card"` resolves |
| `PageLink` (7) | `instanceof PageLink` checks (route, Card, Main) to tell a sub-page link card apart from a content card |
| `LiveChecklist`, `LiveLight`, `LiveButton`, `LiveCode`, `LiveScreen`, `{LiveContent, LiveScreens}` (8-13) | The card types this page registers in `static kinds`/`card_types` |
| `{PART_TYPES}` from `kinds.js` (14) | `Focus`/`Block` check `!PART_TYPES.includes(item.wire?.())` to decide "does this type already have its own View, or does it draw as a plain part" |

**A single `core/core.js` entry file:** of the 14 import lines, 7 (`Page`, `View`+factories, `Item`, `List`, `kinds.js`, `PageLink`, `PART_TYPES`) are not Live-specific — every page-with-custom-card-types file would need the same seven. A `core/core.js` re-exporting `{Page, View, div, span, a, h4, icon, code, Item, List, PageLink, PART_TYPES}` would collapse those 7 lines to 1, saving 6 of LivePage's 14 import lines (~43%). The 6 `Live*` imports and `DefaultView` stay as-is (they're the page's own content, not framework plumbing).

**Does something like this already exist?** `/app.js` is the closest thing — it's a single entry point, but it's the *site's* bundle (menu, drawer, demo, highlight, AITask, ui…), not a minimal *framework-primitives* entry. Nothing today exports just `{Page, View, Item, List, PageLink, PART_TYPES}` as one import. `core/core.js` would be new, small, and sit below `/app.js` rather than replace it.

## 4. Moving the keepers into the default `Page` class

| Feature | Where it lives today | What a move to `core/Page` would take | What breaks |
|---|---|---|---|
| Breadcrumb | `LivePage.js:381-398` (`static Crumbs`) — reads `location.pathname` directly, word for word | Make `Crumbs` a static part on `Page` itself, called from `Page`'s own header render | Nothing breaks it, but every existing page gains a breadcrumb it didn't opt into — needs a `Page.fields`/flag to opt in, not a silent default |
| Gear (settings link) | `LivePage.js:323` inline in `static Head` — one `a.c("live-gear")` pointing at `page.url + "settings/"` | Needs `Head`/header rendering to exist on `Page` first (today's `Page.class.js` has no sticky header view at all — grepped, no `Crumb`/`gear`/`breadcrumb` match) | The settings page itself must exist first (next row) |
| Settings page (`static Settings`) | `LivePage.js:492-513` | Reads `of.focus`/`of.screen`/`of.url`, and `Page.listing(holder)` to find the page's own file. Generic enough to move, but it currently assumes "a page is either plain, or a focused card, or a saved screen" — `focus`/`screen` are LivePage-only concepts (`is_top`, `screen`, `focus` fields don't exist on plain `Page`) | Moving it means either teaching plain `Page` about `focus`/`screen`, or stripping those branches down to "a page's own file + its folder's files" only |
| `/settings/<file>/` code view (`static Files`) | `LivePage.js:518-544` | Self-contained: reads `Page.listing`, lazy-imports `ext/highlight`. No LivePage-specific state used except `page.url` and the `folder`/`at` args it's given | This one is the easiest of the four to lift as-is — it doesn't touch `focus`/`screen`/`is_top` |

**A class doc page on `core/Page/` itself:** `app.js:148` already exports `Doc` (`ext/Doc/Doc.js`) — "a module with a `.md` file next to its `page.js` becomes a child page showing that member's real source," the exact shape the brief is asking for. Putting one on `/framework/core/Page/` would be `export default Doc.for(...)` (pattern not fully traced this pass — see `ext/Doc/readme.md`), not a new mechanism.

**Cost/risk summary:** `Files` ≈ cheap, no risk. `Settings` ≈ medium, must decide whether `focus`/`screen` become real `Page` concepts or get stripped. `Crumbs`/gear ≈ cheap code, but a visible site-wide change (every page grows a header) — needs the owner's sign-off on turning it on everywhere versus opt-in.

## 5. Icons

Yes — `Page.class.js:86` already declares `static fields = ["title", "icon", "description"]`, and `page_tools.js:1728` lets `pages.add` take `icon` (used for session folders already, e.g. `"icon":"📝"`). But today `icon` is only read by `nav()` (`Page.class.js:683`, for card/listing previews) — **nothing draws it in a page's own header.** The header draw point would be `LivePage.Head`'s `live-head-row` (`LivePage.js:325-333`), beside the `h1`; for a generic `Page` it would be wherever that header view ends up living per item 4.

## 6. Old systems

| Path | What it is | Last commit |
|---|---|---|
| `/live/sessions/` | `LiveSessions` page — "every session of ideas shown on /live, newest first," reads v1's log (`sessions/page.js:3`) | `2026-11-06` (same day as this worktree's other moves — not a meaningfully "old" date, just the last churn) |
| `/live/next/` | **Does not exist.** No folder, no file, no reference anywhere under `public/live/` or in the readme. Likely a brief typo for `/live/v1/` or `/live/archive/` (both of which exist and are explicitly named in `LivePage.js:257` `tab_skip` and the readme's "What is stale" section). | — |

`/live/archive/` and `/live/v1/` are the other two `tab_skip`'d old views (`LivePage.js:257`); the readme (`public/live/readme.md:80,98`) already says plainly: all three "read v1's log and show nothing new," and the footer of /live/ links them (`LivePage.js:576-580`). This is already documented, not a new finding.

## Proposal: six steps, current state → simpler

1. **Move `TaskState.js` out of `public/live/`** into `core/Task/TaskState.js` (or `ai/tasks/`), fix the one importer (`Server/task-closeout.mjs`), update the comment that currently says "stays where it is." *Files: `public/live/TaskState.js`, `Server/task-closeout.mjs`. Cost: trivial (~15 min). Risk: none — it has no imports of its own and one known caller.*
2. **Delete the dead aliases in `core/Page/parts/`** (`Part.js`, `Parts.js`, `HeadingPart.js`, `TextPart.js`, `CardPart.js`) once a repo-wide grep confirms nothing still writes `"class":".../Parts.js"` or imports the old names. *Files: those 5 shims + any `page.jsonl` found referencing them. Cost: ~30 min (mostly the grep + fixing any hit). Risk: a forgotten `page.jsonl` line somewhere would 404 its class — must grep before deleting, not assume.*
3. **Add `core/core.js`**, a small entry re-exporting `{Page, View, div, span, a, h4, icon, code, Item, List, PageLink, PART_TYPES}`; switch `LivePage.js` to import from it. *Files: new `core/core.js`, `public/live/LivePage.js` (7 import lines → 1). Cost: ~20 min. Risk: none — purely additive, old imports still work untouched.*
4. **Generalize `LiveButton`/`LiveLight`/`LiveChecklist` into `core/Page/parts/`** as `part-button`, `part-light`, `part-checklist` (same classes, dropped prefix, moved folder); keep old `live-*` names as one-line Item.register aliases so existing `page.jsonl` lines don't break. *Files: 3 moved classes + `LivePage.js`'s `kinds`/`card_types` lists + `kinds.js`. Cost: ~1–1.5 h (moving + alias + updating the one importer). Risk: medium — anything hard-coding `"type":"live-button"` in a `page.jsonl` must keep working through the alias; must test `/live/` itself after.*
5. **Lift `Files` (the settings code-view) onto `core/Page`**, gated behind the same `Page.listing`-driven logic it already uses, with no `focus`/`screen` dependency. *Files: `core/Page/Page.class.js` (new static part), `LivePage.js` (drop its own copy, point `Settings` at the shared one). Cost: ~1 h. Risk: low — it's already self-contained.*
6. **Decide breadcrumb/gear/settings-page as an opt-in `Page` feature**, not a silent default, before building it generically — needs the owner's call on "every page gets a header now" versus a flag. *Files: `core/Page/Page.class.js`, every page that would newly show a header. Cost: design decision first, then ~2–3 h to build once decided. Risk: highest of the six — visible site-wide change; cut this step first if the budget runs out, per the brief's own cut order.*
