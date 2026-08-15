# Why the file list is declared

The Files tab shows the module's real files: the tree on the left,
`doc/file/<path>.md` beside the source. The list of paths is **hand-typed** in the
page's `files:` string. Two other answers were available and both lose.

## `directory.json` — rejected

The dev server writes `public/directory.json` and `public/framework/directory.json`
on every start, and they already carry the whole tree. It looks like the obvious
source: no list to maintain, nothing to go stale.

It breaks the **static compatibility** constraint. Both files are gitignored, so a
clean checkout deployed to Cloudflare has neither, and every Files tab on the
production site would render an empty tree — silently, since a missing JSON is just
a fetch that fails. A doc page that works on localhost and is blank in production
is worse than a list that can go stale, because nobody who can fix it will ever see
it break.

It is also 340 KB. A module page would fetch the entire site tree to name eight
files.

## A directory index endpoint — rejected for the same reason

`Server/plugins/Directory.js` could serve a scoped listing. Same constraint,
one sentence: **nothing may depend on server-side logic at runtime.**

## The list is authorial anyway

This is the same argument `methods:` and `notes:` already won. A module's directory
is not a reading order — it interleaves the thing (`Doc.js`), its stylesheet, its
page, its demos and whatever half-finished sketch is sitting there. The list says
*which files are worth reading, and in what order*, which is the one thing a
crawler cannot answer.

`doc/` and `ai/` are never listed: they are the documentation *about* the module,
not the module. Listing them would put the Files tab inside itself.

## The cost, stated

A file added to the module and not to `files:` is absent from the tab, and nothing
throws. That is the same failure mode as `methods:`, and it takes the same fix: the
`documentation` skill's audit walks the directory and compares it to the list. A
check in a skill that runs before every task beats a crawler that breaks the
deploy.
