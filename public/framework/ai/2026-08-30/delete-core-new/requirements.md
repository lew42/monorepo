# Delete core/new/0/ and core/new/starter/

Verbatim ask: delete `public/framework/core/new/0/` and `public/framework/core/new/starter/`
per the simplify audit's #1 item (445 files, 2.8MB, 308 page.js, zero importers by rule —
`ai/2026-08-30/simplify-audit/proposal.md`). `core/new/1/` is on the DO-NOT-TOUCH list — leave it.

## Order

1. Before deleting: grep all of `public/` for references to the doomed paths
   (`core/new/0`, `core/new/starter`, `new/starter`, `starter/site`) — imports (should be
   zero, verify the audit's claim), doc links, prose citations. Known: the columns docs cite
   starter's `display:contents` proof — `core/Page/doc/columns.md` and/or `overview/columns/`.
2. For each citation: rewrite the sentence to carry the fact inline (the measured numbers
   329|329|329 vs 494|246|245 are the value — keep them, drop the link). Never leave a dead link.
3. Check `core/new/page.js` (the parent) declares `0` or `starter` in `children:` — update its
   children line and any prose.
4. Delete the two trees.
5. Verify: crawl `/framework/` core section (~30 urls incl `/framework/core/new/` and
   `/framework/core/new/1/`) — zero console errors, zero new 404s, rewritten citations render.

## Scope fence

- Only deletes + the minimum citation rewrites needed to avoid dead links. No other edits.
- `core/new/1/` untouched.
- Never commit — report leaves the changes staged/unstaged for the mastermind to commit.
