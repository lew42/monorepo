The measurement that indicts a token rather than a page: **`--measure: 52em` is
not 75 characters on this site.** It is 83 to 103, and which one you get depends
on the copy.

## Why the number does not move with the window

The site's root font size scales with the viewport (15.04px at 1280, 16px at
1920, 18px at 3440) and the measure is in `em`, so the line width and the
average advance scale together. A 52em column reads identically at 1280 and at
3440 — which is worth knowing before someone tries to "fix" a `measure` finding
by checking it at another width.

## The spread is the text

103 characters for lowercase-heavy technical prose, ~83 for copy with capitals,
inline `code` and links. Both at 52em. That is why the same rule fires on some
prose pages and not others, and why the file's closing ⚠ is *measure the copy
you actually ship*.

## It stops short of proposing an edit

`--measure` lives in `core/Page/Page.css` and is a site-wide type decision. The
file records the number and the ceiling that would be safe for any copy (~42em,
which is where the corpus's independently-derived `38em` sits) and leaves the
call to a human — the same line `audit/`'s accept queue draws.

## Improvements

1. **The advance was measured on two paragraphs.** Two is enough to show the
   spread and not enough to state a distribution; a pass over every prose block
   on the site would give a real range and is a `probe()` loop, not new code.
   *(medium, useful.)*
