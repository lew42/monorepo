# Editor notes — one selection, one right sidebar

Read before the editor rethink. Three editors exist; none of them is wrong, and the
shape the owner asked for is already half-built in two of them.

## What is there now

**ext/Panel** (3,899 lines, 23 files) is the most finished. Its floating bar is down to
**four buttons** — split into columns, split into rows, *tune*, close — because the bar
"carried **fifteen** icons and a popover behind most of them; nobody could remember them
and half of them were clipped" (`toolbar.js`, 2026-08-19). Every word it lost went into a
**right rail** (`properties.js`, 410 lines, ~54 labelled rows) that fills from three
document events — `panel-focus`, `panel-text`, `panel-item` — so nothing imports anything
to know what is selected. That is exactly the owner's ask, already working: click a panel,
its words appear on the right. What it does badly is that the rail shows **every** word a
panel can take, all at once, and a panel is a rectangle with no name — so the thing you
selected has no label and the 54 rows have no order a newcomer can hold.

**The Panel playground** adds the shell around it: a left rail of saved documents, `+` to
make one, the url carrying which document you are in, and the right drawer docked open at
load so a selection *fills* a rail rather than shoving one open ("too jumpy", the owner,
2026-08-18). It contributes the shell, not the editing.

**Make** (1,508 lines) has the pane layout right: **tree · page · settings**, where the
tree is every page you made, the middle is that page drawn for real, and the right is
everything the page says about itself, in three groups (Page, Words, Blocks). Every control
writes through one seam, `apply()`, which rebuilds the whole tree and works out the smallest
set of files that gets there — so the three panes can never disagree. Its weakness is that
selection only exists in the tree: you cannot click a thing *in the middle* and have the
right pane follow.

## The shape to build

**One selection scheme.** Click anything in the middle — a page, a block, a run of text —
and it gets one outline and one name badge saying what it is ("page · notes", "block ·
cards"). Nothing else is ever outlined, and the middle is the only place you select; the
tree just mirrors it. Build it from Panel's `panel-focus` contract (a document event
carrying the target or `null`) and Panel's own focus ring, over Make's tree.

**One right sidebar**, and it shows only the selected thing's few properties:

| selected | what the sidebar shows |
|---|---|
| a page | title, description, icon · the realm's seven words as the one labelled bar · delete |
| a block | what kind it is, its one or two words, and where it sits |
| an element | the run's own words — tone, size, align — and nothing about its parents |

Built from Make's `settings_pane()` grouping and Panel's `properties.js` rows, filtered by
what is selected instead of showing the whole vocabulary.

**What goes.** Panel's floating bar entirely — split and close are two rows in the sidebar
once there is a selection, and a bar that floats over the thing it edits is the defect this
realm already measured twice. The Panel playground's document rail folds into Make's tree.
Nothing else is deleted; the words all survive, in one place, behind one click.

## The one number that matters

A control that is not about the selected thing should not be on screen. This task proved
the principle on the paging realm itself: a page about *one* word showed **nine** controls
and now shows **one**, with the other six counted out loud on the button that holds them
("6 more words"). The editor is the same fix at a larger size.
