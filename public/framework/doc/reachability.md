# Reachability — the crawl, the audit, and what the probe changed

## The method, and there are two halves

Both are scratch scripts rather than repo scripts — a work-in-progress check doesn't
earn an npm script — but the ideas are what matter, and they ask **inverse** questions.

- **Crawl the links.** Follow every in-app anchor from `/` and assert
  `.active-page === 1` per route. This finds every page that is *linked but does not
  render*, and no amount of reading finds any of them. Retry each route once: a shared
  browser page under load produces `networkidle` races that look exactly like real
  failures, and five false alarms in one run is enough to make you stop trusting the
  green.
- **Audit the tree.** Walk `page.js` files on disk and check each is named in its
  parent's `children`. No browser needed. The crawl finds pages nothing links to; the
  audit finds pages nothing declares.

**The audit's meaning changed** when `Page.child()` gained the filesystem probe. An
undeclared `page.js` is no longer a 404 — it resolves when routed to. So the audit is
now a **navigation** check, not a reachability one: an undeclared page is missing from
its parent's menu, which is a real finding and a much smaller one.

The crawl is unaffected, and is now the only half that can find a genuinely broken
route.

## The ~40 orphaned sandbox pages

Found by crawling from `/` rather than by checking a list — the same method that caught
`/notes/git-branch-names.page.js` before it.

`alex/`, `arya/`, `castin/` and `edric/` declare no `children` on their index pages.
Measured under the old semantics: **13 broken routes** reachable in one crawl, across 48
`page.js` files that no parent names. `michael/` was the exception, with an eager
`children: [pageDoc, elements, layout, …]` array resolving its 29 pages.

**Under the probe, those urls resolve.** What is left is that they are invisible: no
preview card, no sidebar entry, nothing in the parent's menu. That is a content
decision per directory — some of it is dead and should be deleted rather than declared —
and it is a conversation, not a silent edit.

One genuine break survives and is not a routing problem: `michael/branding/page.js`
calls `app.nav()`, which no longer exists, so it renders a load error rather than a
page. A stale call.

> Corrected once, and worth remembering how: an earlier version of this claimed *none*
> of the four sandboxes declared children, michael included. That came from a `grep`
> whose output was truncated by a `head`. The claim was wrong **in the direction of
> alarming**, which is the direction a design record must not be wrong in.

## `/framework/` itself

Every page is declared by its parent. The only undeclared directory is
`start/example/`, which is deliberate — it is a fetched doc fixture, not a route. See
`ext/files/readme.md`.
