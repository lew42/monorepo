## What this file is

The type scale, live, plus the twenty-odd inline elements `framework.css`
deliberately never touches (`strong`, `em`, `mark`, `sub`, `sup`, `abbr`,
`cite`, `q`, `time`, `data`, and more) and the two kinds of anchor — a link
in prose, and navigation that already opted out of looking like one.

## The scoping argument for the link rule

`:where(p, li, td, th, dd, blockquote, .md) a` rather than a flat `a { … }`
is the page's sharpest point: a flat rule would bold every tab, crumb, ToC
row and sidebar entry, and `a:visited` at `(0,1,1)` would out-rank
`.sidebar-link`/`.tab`/`.nav-link` and grey out the site's own navigation
behind the reader. Worth reading before touching the anchor rule in
`framework.css` for any reason.

## Improvements

1. **Nothing ranked.** The `:visited` section is unusually careful about
   what a browser will and won't let CSS read back out of layout — a real
   platform constraint stated plainly rather than glossed over.
