# Site audit (A4) — job-prospecting above-the-fold pass

## The ask (owner, verbatim, in blog-program/requirements.md)

> do an audit of the whole site, all framework pages, etc: take screenshots at the major
> resolutions (400, 1920, 3440), and pay attention to: above the fold experience (give a
> strong overview with navigation above the fold). I know I've asked for "show don't tell",
> "give me a demo". I think a compact demo that actually shows something important is fine.
> we don't want 3 demos when 1 would work.

## Scope

Crawl `/framework/` + `/notes/` + `/` (homepage) by walking the LIVE page tree (import each
root's `page.js`, await `.loading`, walk `.children` Maps) — same technique as
`ai/2026-08-29/imagine-tidy`. Skip `/imagine/` (audited separately) and personal sandboxes
(not reachable from these three roots anyway).

## Grading

Per page, per width (400/1920/3440, viewport 1000 tall): does the ABOVE-THE-FOLD crop show
(a) what the page IS (title + orienting line), (b) navigation to go deeper, (c) something
SHOWN not told? Score 0/1 each → 0-3 per width. Also: demo count (flag 3+), fixed-height
clipped demos, horizontal overflow, console errors.

## Deliverable

Ranked worst-20 (owner-priority: homepage/framework-root/topic-roots/core-modules before
leaf demos), one line each, keeper screenshots for worst 20 + best 5. Aggregate numbers.
Full grid as `audit.json`.

## Fences

Read-only except this task dir. Never kill/restart :80. Never drive owner tabs. No stash,
no commit.
