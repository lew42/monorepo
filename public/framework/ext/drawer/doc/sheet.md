# The ✦ sheet is a page

On a phone, the ✦ sheet can be dragged from part of the screen up to all of it. At the top it stops being a panel over the page and becomes a page of its own. It gets its own url and a **‹ Back** button, and the phone's own back button steps it down. (The owner, 2026-09-30: "as I swipe this thing up… all the way at the top, it's almost like we've just navigated to this page… the user's operating system level back button should always work.")

Screenshots of every step: [Mobile bottom rail](/framework/ext/drawer/rail/).

## Three states, three urls

| State | Url | What shows |
|---|---|---|
| closed | `/framework/` | the bottom rail only |
| open | `/framework/?sheet=open` | the sheet over part of the screen, at the height you last left it |
| full | `/framework/?sheet=full` | the sheet is the whole screen, with ‹ Back in its head |

Going **up** a state adds a history entry: tapping ✦ (closed → open), or letting go of a drag near the top (open → full). Going **down** a state goes back through those same entries: the phone's back, ‹ Back, ✕ (all the way to closed), or letting go of a drag near the bottom. So the phone's back button always steps the sheet down one state, and it never leaves the site while the sheet is showing.

A reload or a shared link at `?sheet=full` opens the sheet at full height, and first rebuilds the two entries under it (closed, then open). The phone's back still steps down twice before it would leave. A sheet opened from the url starts **quiet**: the microphone waits for a tap, because nobody asked it to listen.

## The drag

Letting go settles the sheet by where it was let go. At 85% of the screen or more (`full_at`), it goes full. Below 28% (`close_at`), it closes. Anywhere between, it stays where you let go, and that height is remembered. Both numbers are prototype fields on the sheet class, so a variant can change them.

While you drag, the sheet has a real height (`.drawer-rail-sheet-sized`), not only a ceiling. With only `max-block-size`, a drag above the sheet's own content did nothing: the finger moved and the sheet stayed where it was. The edge stays under the finger (measured within 1 px) because `ext/grip` now remembers where in the strip the finger landed, on the y axis only.

## The code

- `DrawerRail.to(mode)` is the one way to change state: it pushes, goes back, or replaces, then shows. `apply(mode)` only makes the screen match a state and never touches history. The popstate listener calls `apply(routed())`.
- `history.state.depth` counts our own entries above the closed one (open = 1, full = 2). A step down goes back only when that count says the entry below is ours. Otherwise it replaces the current entry, so it never goes back into a different page.
- After an in-app link, the new page's url gets `?sheet=open` written back (a full sheet steps down to open so the new page is in view). That entry has no depth, so ✕ there replaces it rather than going back to the page you came from.
- `core/Router` ignores a popstate that stays on the same path (`popped()`). Before, every back step reloaded the page underneath, scrolled it to the top and fired `navigated()` again.

## Watch out

- Show or hide the sheet with `rail.to(mode)`, never by toggling `.on` yourself. Otherwise the url, the history and the screen stop agreeing.
- The sheet's own box also has the class `.drawer-rail-sheet-panel` (View stamps the class name `DrawerRailSheetPanel`). A bare rule for that class hits the sheet too: a `display: flex` there once kept the sheet on screen after ✕ (fixed with a descendant selector in `rail.css`).
- Above 52em the sheet is hidden but the url is left alone. Narrowing the window again shows whatever the url names.
