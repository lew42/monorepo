Which page earns a tab bar. The test, and the ordering is deliberate:

1. Do the children need more width than this page's measure? → **previews**
2. Does the reader drill *into* them rather than flip *between*? → **previews**
3. Is the list open-ended? → **previews**
4. Otherwise, and only then → **tabs**

`/framework/ext/` used to be the site's one tab bar and met the old four-condition
test — flat, four children, none with children of its own, flipped between rather
than drilled into — and it was still the wrong call. **A fifth condition was
missing, and it is the one that decides it:**

> A tab bar mounts its children **inside the hosting page**, so every child inherits
> that page's measure.

`ext` is a measured doc page at `60em`, so `files` — a file tree beside a code pane —
was laid out in **847px of a 1253px region**, and the component that most needs width
had the least. `previews()` mounts each child in the **region** instead, at the
region's width: the file browser went from 781px to 1187px.

## Where tabs are right

A page with no prose of its own that exists to arrange its children. [`Doc`](/framework/ext/Doc/)
is that page twice over — a horizontal set of groups, and a vertical rail of
members inside each — and today it is the only **functional** caller in framework
code: `Doc.js` is the one place `this.tabs()` is actually invoked outside this
module's own demo page. `app.js` imports `tabs.js` a second time, on its own line,
precisely so any other `page.js` can reach for it directly without depending on
`Doc` for it — see [who calls it](/framework/ext/tabs/) in the readme. Nobody has
yet, which is itself worth watching: either nothing else on the site has needed a
fixed sibling set, or the pattern is under-advertised.
