# Browse — the class architecture

The owner, 2026-10-14 ([dictation 14, ask 7](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-12.md)): the Inbox and the Sessions page are "the same essential problem: pages and sub pages and previews and how you click through them to see a deeper thing". So there is one view for it, `Browse`, and each of them is a `Browse`.

## What Browse is

A list on the left, the thing you clicked on the right. The list stays put while you read; it is resizable, a third of the screen at 1920 and wider at 3440; on a phone the list and the detail are two screens.

```
┌─ Browse ─────────────────────────────────────────────┐
│ ┌─ list (resizable) ─┐ ┌─ detail (page.$pages) ─────┐ │
│ │ pinned: Waiting on │ │  the row's own page,       │ │
│ │   you (one line    │ │  routed: /…/<row>/         │ │
│ │   each, tick = gone)│ │  reload and Back land here │ │
│ │ rows …             │ │                            │ │
│ └────────────────────┘ └────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## The classes

| class | file | job | extends | composes |
|---|---|---|---|---|
| **`Browse`** | `ux/Browse/Browse.js` | **The orchestrator.** Builds the shell: the list pane, its grip, the detail pane (`page.$pages`, so a row's page renders there through the Router) and the third column for a sub-page. Remembers the list's width. | — | `Browse.Pinned` lists, the rows a subclass draws |
| `Browse.Pinned` | `ux/Browse/Browse.js` (static) | A short titled list pinned above the rows: one line each, a link, a tick that makes it go. Hidden when empty. | — | its rows `{id, title, href, sub, at}` |
| `Inbox.Rail` | `core/Page/ext/Inbox/Rail.js` | The Inbox's rows: ranking, read and unread, archive, the filters, the live "new" pill. | **`Browse`** | — |
| `AIRail` | `ai/rail/rail.js` | The AI page's Inbox: usage meters, cards, the pinned day rows, Waiting on you. | `Inbox.Rail` | `WaitingOnYou` |
| `WaitingOnYou` | `core/Page/ext/Inbox/WaitingOnYou.js` | Every open owner decision, one line each, its card linked; ticked → archived, gone. Reads `ai/cards.jsonl` and `ai/asks.jsonl`. | `Browse.Pinned` | — |

## What each surface becomes

- **The Inbox** (`/framework/ai/`): `AIRail extends Inbox.Rail extends Browse`. Its rows are its own; the shell, the width and the pinned list are Browse's. Built first (the smallest slice).
- **The Inbox timeline** (`/framework/core/Page/ext/Inbox/timeline/`): a configuration: a `Browse` whose list is a `DataGrid` in rail mode. Today it uses the `columns()` page layout instead; moving it is one step.
- **Sessions** (`/framework/ai/sessions/`): a configuration: a `Browse` whose list is its `DataGrid` (table at 1920 and wide, rail of cards when the pane is narrow) and whose detail is the session's own page, the "side peek" it already has. Next brief: `ai/sessions/doc/next.md`.
- **The catalog** (`/framework/catalog/`): a configuration: rows are catalog entries, the detail is the entry's page.

## The list grows with the screen

The list pane is a container (`container-type: inline-size`), so a row reads its own width, not the screen's:

- under about 30em (a phone, a narrow drag): one line per row, the title and when;
- from 30em (the default third at 1920): the row's badges, title and when on one line, its one-line summary under it;
- from 60em (3440, or dragged wide): one line per row as a table: badges, title, summary, when, side by side, like the Sessions data grid.

## One of everything

Browse replaces the shell code that was in `Inbox.Rail` (and the copy of it that the timeline gets from `columns()`); it is not a third rail. The CSS classes `inbox-shell`, `inbox-rail` and `inbox-detail` stay on the same elements, so every rule in `ux/Inbox/Inbox.css` still lands; Browse adds `browse`, `browse-list` and `browse-detail` beside them.
