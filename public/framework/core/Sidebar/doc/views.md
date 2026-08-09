# The four `$` handles — three of them write-only

`Sidebar` stores four child views. Grouped here rather than given a page each,
because the finding is collective.

| property | assigned | read |
|---|---|---|
| `$bar` | `Sidebar.js:38` | **never** |
| `$menu` | `Sidebar.js:78` | **never** |
| `$mode` | `Sidebar.js:113` | **never** |
| `$toggle` | `Sidebar.js:60` | `Sidebar.js:31` (Escape refocus), `72` (`aria-expanded`) |

## Usage

Nothing outside the class reads any of them. `grep -rn "\$bar\|\$menu\|\$mode"
public/` returns the assignments and nothing else.

## Necessity

**`$toggle` is essential** — `open()` cannot write `aria-expanded` without it, and
the Escape handler cannot return focus.

**The other three are storage with no reader.** Each is a `return this.$x = …` in a
method whose return value is also discarded, so both halves of the line are unused.

The argument for keeping them: the `$`-prefix convention exists so a site or a
subclass can reach a part without re-querying, and a component that hides its parts
forces `el.querySelector` on anyone extending it. That argument is real and
untested — nobody has extended `Sidebar`.

## Simplicity

The naming rule they follow is worth stating, because it is the reason they read
cleanly: **name a `$prop` after the class it carries.** `$bar` holds
`div.c("sidebar-bar")`, kebab class read back as snake_case, so you get from CSS to
JS and back without opening the other file.

Proposal (readme): drop `$bar`, `$menu` and `$mode`; keep `$toggle`. Three lines
shorter, and the remaining handle then *means* something — "this one is here
because something reads it."

Counter-proposal: keep all four, on consistency, and accept that a component's
parts are public by convention. Either is defensible; the current state — four
handles, one reader, no note saying which — is not.
