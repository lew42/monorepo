# Decisions

## Topics listed from a top-level index.jsonl, not a hand-typed list (2026-09-28)

The brief's own requirements.md left this as a call: "a short declared list of topic names
in the page itself, or a top-level `public/framework/sources/index.jsonl` the script also
appends a `{"topic":...}` line to on a topic's first save — your call, pick the simpler one."

Picked the file. A hand-typed list in `page.js` needs a code edit every time
`Server/sources.mjs` seeds a new topic — two things to keep in sync, one of them a page
nobody but this task's author has reason to open. The file is one line per topic, appended
by the same script that already appends every other line this module writes, and `page.js`
already has the exact same read (`fetch` + split-on-newline + `JSON.parse`) for a topic's
own `index.jsonl` — one function, `read_jsonl()`, does both. Nothing crawls
(`core/Page/doc/data-children.md`'s own point): the file names the topics, same as a
hand-typed string would, just written by the tool instead of by hand.

## `sources-` — a new CSS namespace (2026-09-28)

`page.js` needed one new class, `.sources-badge` (+ `-high` / `-medium` / `-low`), for the
authority badge on a source. `framework/styles/css-scopes.txt` was outside this task's
original fence (only `public/framework/sources/` and `Server/sources.mjs`); a review-fixes
pass widened the fence to cover exactly this line, and `sources-` is now reserved there.

## A topic's sources use the ext/files browser, not a card wall (2026-09-28, review finding 3)

The brief's own words: "the sources library uses the same browser." `topic_page()` in
`page.js` now gives its render() to `ext/files`' `files()` — the same tree + about + source
three-pane view `ext/Doc`'s Files tab uses — instead of a wall of preview cards. The path
list `files()` wants is the topic's own `index.jsonl` rows' `path` field, already the right
shape (space-joined, relative, fetchable). `about()` looks the clicked path back up in that
same data for the badge row (authority/kind/url) and the converted body. The library's FRONT
page (the wall of topics) stays cards — that one lists topics, not files, and a topic is a
better fit for a preview card than a tree leaf.

## A saved page is the searcher's rewrite, not a literal conversion (2026-09-28, review finding 8)

`Server/sources.mjs`'s searchers are told to answer with a JSON array whose `markdown` field
is "that page's own content, already converted" — but what a headless `claude -p` turn
actually hands back is its OWN read of the page (via WebFetch, which already summarizes),
written in its own words, not a mechanical HTML→markdown conversion of the original. Two
consequences worth knowing before trusting a saved page as a citation:

- A saved `.md` can drop or compress detail the live page has, and can occasionally get a
  fact slightly wrong the way any model summary can.
- Re-running the fan-out on the same question can save a DIFFERENT rewrite of the same url
  under a different slug (this is why the dedupe-by-url in `fanOut()` matters — it stops
  the same page being re-summarized every run, but the first rewrite saved is whichever
  searcher got there first, not necessarily the best one).

Left as-is rather than fixed now: a true mechanical conversion (fetch the raw HTML,
mechanically convert with a real HTML→markdown library) would be a second tool and a new
npm dependency, and the brief's own words ask for "cheap searchers" doing the fetching, not
a separate pipeline. Anyone citing a saved page for something that matters should follow the
`url` field back to the source rather than trusting the markdown alone — same rule as citing
any AI-summarized source.

## Colour reused, not invented

The badge's three colours are the site's own status ramp (`framework.css`'s `--ok` / `--warn`
/ `--error`), not a new palette — "how much to trust this page" is the same shape of
question the usage rail's colour already answers.
