# Decisions — edit/ drafts

## Why `store_key` was never set

`page.store()` keys on the page's own `url` by default. This page has never moved and edits
exactly one file (`FILE`, a module constant) — the url and the thing it edits are already the
same address, so a `store_key` override would be a second name for a fact `naming()` already
gives for free.

## Why the note says "restored" even mid-session

The literal event is "there is an unsaved draft in storage," which is true from the first
debounced write, not just after a reload. `load()` only shows it after actually restoring one
(`draft.text !== undefined && draft.text !== text`) — but once shown, typing more doesn't hide
it, and a *fresh* draft (typed this session, never reloaded) shows the same note the moment its
first debounced write lands. One label for one state (there is a draft protecting your typing)
beat two labels for a distinction ("restored" vs. "unsaved") the reader doesn't need to act on
differently either way — both mean "reload, and it's still here."

## Why the debounce is 400ms and lives on `input`, not `change`

`change` only fires on blur — a tab closed mid-paragraph would never have patched anything.
400ms is short enough that a reload seconds after the last keystroke still catches the write,
long enough that a fast typist isn't serializing JSON on every character.

## Why Save and Discard both call `store().clear()`, but only Save updates `this.original`

Save writes the CURRENT textarea value to disk, so `this.original` has to move with it — a
second Discard right after a successful Save should return to the just-saved text, not the
text from before this session started. A failed Save clears nothing: the write didn't happen,
so the draft is still the only copy of the words that didn't make it to disk.

## Why the mark is `baseline()`, not the bespoke span it replaced (2026-09-05)

This page had its own "draft · restored" span and "Discard draft" button since before
`/imagine/paging/baseline.js` existed. The ux-rethink pass swapped them for the shared mark so
this page reads the same as every other page that persists — one press to arm, a second to
confirm, ending the one-click-loses-your-typing shape the old button had. The only wiring: pass
`restore: () => this.discard()`, because the default `restore()` clears the store and reloads,
and this page's `discard()` already puts the file back in the textarea with no round trip —
reusing it, not reimplementing it.

## Verified

Headless (`ai/2026-08-31/drafts-and-glass/`): typed a marker string, reloaded — text and the
"draft · restored" note came back, `localStorage["lew42:/imagine/cms/edit/"]` held it. Clicked
Discard — note gone, textarea back to the fetched file. Reloaded again — still gone,
`localStorage.getItem(...)` `null`. Zero new console errors (a pre-existing, unrelated 404 for
`/imagine/cms/welcome/page.js` — `Page.file()`'s own markdown-has-no-`page.js` case — fires on
this page and its parent alike, before and after this change).

Re-verified headless after the `baseline()` swap (`ai/2026-09-05/ux-cms/`): typed a marker,
saw the amber mark + Reset, Saved — `welcome.md` on disk gained the marker. Typed a second,
unsaved change — mark came back. Pressed Reset (armed), pressed "Press again to forget…" —
textarea returned to the last-saved text in place, no reload, mark gone. Restored the file to
its original bytes and cleared `localStorage` to leave no trace. One console error per load
throughout, the same pre-existing 404 named above, at 1280 and 3440.
