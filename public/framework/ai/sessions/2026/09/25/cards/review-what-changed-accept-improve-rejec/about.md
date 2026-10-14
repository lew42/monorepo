# From a page to an approved improvement: one loop

A page's `page.jsonl` already holds its content as a list of lines. This design adds a few new kinds of line: an agent **proposes** a change, you **accept**, **improve** or **reject** it, and the page shows the result straight away. Reordering sections and changing settings work the same way: each is a line in the page's own log.

```
 the page                an agent                    you, on the page
 ─────────               ────────                    ────────────────
 intro.md       ──►  writes why.md, then        ──►  ┌─────────────────────────┐
 note.md             {"propose": add why.md}         │ intro                   │
                                                     │ ┃ + why  (green)        │
                                                     │ ┃ [Accept][Improve][Reject]
                                                     │ note                    │
                                                     └─────────────────────────┘
                                                              │ click
                                                              ▼
                                              {"accept": "p1"}  → why.md is now part of the page
                                              {"improve": "p1", "say": "shorter"} → the agent tries again
                                              {"reject": "p1"}  → the green section goes away
```

## The parts

```
page.jsonl                   the page's log. The latest line wins
├── propose / accept / improve / reject    1. Review changes
├── order                                  2. Reorder (sections by drag and drop)
├── nav                                    2. Reorder (child pages)
└── setting / configure                    3. Settings

core/Page/Log.js             the new line kinds are new methods here; set() already calls them
ux/Content/Review.js   NEW   draws a pending change: green (added) or red (removed), and 3 buttons
ux/Content/Settings.js NEW   draws declared settings as controls; a change writes a line
dev/DevBar  → a "Page" tab   the edit sidebar: this page's pending changes, its order, its settings
```

**Where the edit sidebar lives: a "Page" tab in the dev bar.** The dev bar is already on every page, only appears on localhost, and already holds the switch that turns editing on and off. The alternative, a separate edit sidebar, would mean writing new code and would compete for space with the navigation column.

## 1. Review changes

| | |
|---|---|
| **Agent proposes** | It writes the new file beside the page, then appends `{"propose": {"id": "p1", "add": "why.md", "after": "intro.md", "by": "minion-x", "why": "explains the log"}}`. The other two kinds of change: `{"remove": "old.md"}`, and `{"replace": "note.md", "with": "note.p1.md"}` |
| **You click** | `{"accept": "p1"}` · `{"reject": "p1"}` · `{"improve": "p1", "say": "half as long"}` |
| **What you see** | Each pending change is drawn in place: an added section in green, a removed one in red, a replaced one as red followed by green. The three buttons sit on it. An accepted change draws as normal content. A rejected one is gone, but stays in the log |
| **Improve** | Your note goes to the agent that made the proposal, through the card's assistant (the existing `/card/append` route). That agent writes a new proposal with `"replaces": "p1"` |
| **Any page, module or class doc** | Pages written as `page.jsonl` get this straight away. A `page.js` page, or a class doc from `ext/Doc`, gets a `page.jsonl` beside it that holds only these lines, and the page loader reads it after `page.js` runs |
| **Reused** | `Log.js` `set()` (a key that names a method calls it) and live streaming · `ContentModule.write()` (localhost only, follows the edit switch) · Decision's button and "chosen" styling (`ui/decision`) |
| **New** | 4 small methods in `Log.js` · `Review.js`, about 60 lines |

## 2. Reorder

| | |
|---|---|
| **Line** | `{"order": ["intro.md", "why.md", "note.md"]}`: the latest `order` line wins |
| **`place`** | `place` still means "this file is part of the page". `order` only sorts what is placed. A file placed after the latest `order` line, which that line therefore doesn't name, goes at the end, so nothing is lost |
| **`children:`** | `children:` still decides which child pages exist. `{"nav": ["b", "a"]}` only changes the order they appear in the navigation, and a child the `nav` line doesn't name keeps its declared place |
| **Who** | Your drag writes `order` directly: you are the approver. An agent that wants to reorder a page proposes `{"propose": {"id": "p2", "order": [...]}}`, and you accept or reject it like any other change |
| **Reused** | `ext/Draggable/Sortable` (drag handle, placeholder, drop) on the sections `log_view()` already draws |
| **Not used** | Item, List, Saver and the editor: they save a whole document tree to a file each time. A log of appended lines replaces that, and lines never overwrite each other |

## 3. Settings

| | |
|---|---|
| **Declare** | `{"setting": {"key": "minion.tier", "label": "Minion", "choices": ["fast", "manager", "architect", "scan"], "default": "fast"}}` |
| **Change** | `{"configure": {"minion.tier": "manager"}}`: the latest line for each setting wins. (The word is not `set`, because `set` is the method that reads every line) |
| **UI** | `Settings.js` draws each declared setting as a control: a dropdown for choices, a switch for yes/no, a box for text. A change appends a line, and the page redraws from that line, so the page is live and saved in one step |
| **First use** | The roles table becomes `/framework/servex/roles/`. It declares one setting per role (its tier), and the table's Model column shows what `tiers.js` gives for the chosen tier |
| **Reaching Servex safely** | Servex reads the page's `configure` lines each time it starts an agent. `roles.js` `defaults(role)` checks the tier is a real one in `TIERS` and the role is a real one in `ROLES`. A line that fails the check is ignored and logged. So a change affects the next agent started and never one already running, and a bad line cannot break Servex. The tier-to-model table stays in code, and the page only chooses between tiers |
| **Reused** | Log streaming, `ContentModule.write()`, `Dropdown` |
| **New** | 2 methods in `Log.js` · `Settings.js`, about 60 lines · about 20 lines in `roles.js` |

## Build order, smallest first

| # | step | you can then… | est. |
|---|---|---|---|
| 1 | `order` line + drag on `page.jsonl` pages | drag a section and have it stay there after a reload | $1.50 |
| 2 | `propose` / `accept` / `reject` + `Review.js` | see an agent's addition in green and accept it | $3 |
| 3 | `improve` → sent back to the agent through the card | say "shorter" and get a second try | $1.50 |
| 4 | `setting` / `configure` + `Settings.js` on the roles page | change a role's tier and see the table update | $2.50 |
| 5 | Servex reads `configure` lines when it starts an agent (needs a Servex restart) | the next minion uses the tier you picked | $1.50 |
| 6 | `page.js` pages and class docs get a `page.jsonl` beside them | review changes on `/framework/core/Page/` and on Servex pages | $2 |
| 7 | the dev bar's "Page" tab: pending changes, order and settings | edit any page from one place | $2 |
| 8 | line-by-line diff inside a changed `.md` section | see one added sentence in green, not the whole section | $2 |

Total about $16. Steps 1 and 2 on their own already give the whole loop on one page.
