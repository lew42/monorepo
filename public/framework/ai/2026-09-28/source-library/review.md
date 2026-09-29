verdict: fix

![the sources page under review](review/shots/monorepo-localhost-framework-sources/1920.png)

More shots: [review/shots/](review/shots/), [proof/](proof/)

1. [fix] Proof was missing: no 1920 shot of the 3-deep Docs tree, none of a `/docs/` url landing on `/doc/`, no fan-out cost report. Commit fefcef7c ("proof shots") added none; finding 5 from round 1 was still open. Take the two shots, and write the fan-out's printed summary into the landing report.
2. [fix] Review screenshots were taken against monorepo.localhost (main tree), not the worktree branch — that's why `sources` 404s and the sidebar has no Sources entry, even though page.js:14 names it. Re-shoot against source-library.localhost, or after merge.
3. [fix] `decisions.md` is stale: it still says the CSS prefix "is recorded here instead," though that line now exists in css-scopes.txt. `page.js:70` claims a files-browser entry that doesn't exist. Update the first, add the second.
4. [note] The topic page has no heading naming the topic — only a sidebar highlight — and shows cut-off slugs instead of the titles `index.jsonl` already holds. A heading and title labels would make it scannable.
5. [note] The library front page is three bare folder cards with no count or preview of what each topic holds. Pulling that from `index.jsonl` would make the wall a real preview.
6. [note] A saved page is the searcher's own rewrite of what it fetched, not a mechanical conversion (`Server/sources.mjs:132`) — `decisions.md` says so honestly now, but it's still a gap against "read quickly and cite." The owner should hear it in the landing report, not only in a doc.
7. [note] Two `page.jsonl` bookkeeping lines are unrelated pre-existing noise (explained, plausible) — leave both out of the merge commit so they don't read as this task's change.
8. [note] `Doc.js:139` only rewrites the first `/docs/` in a url and needs a trailing slash, so a no-slash url still loads with the wrong address. Small fix: anchor the regex on the segment.
9. [note] The landed fixes hold up: `sources` routes as a child, all `docs/` links now say `doc/`, the topic page reuses ext/files' browser (routed per file), the `res.ok` guard is in place, the dead Server link points at GitHub, `sources-` is reserved, and the research skill's §6 rule matches requirement 3.
