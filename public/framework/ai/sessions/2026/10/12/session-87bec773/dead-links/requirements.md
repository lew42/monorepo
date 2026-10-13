# Dead links after today's moves (fix brief)

Today the `task-folders` move put every `ai/<date>/<task>/` under `ai/sessions/YYYY/MM/DD/`, and the night audit (`night-audit/report.md`, now under the sessions store) listed minor dead links: the `/framework/ai/doc/` page, the CLAUDE.md consolidation report link, the page-columns line citations.

## Done when
- [ ] A node crawl of `/framework/` + `/notes/` (headless, same-origin links only; the `site-crawl-verification` rules: sandbox dirs and mini_app/marking demo hrefs 404 by design) lists every same-origin 404, with the page it is linked from.
- [ ] Fix each dead link at the source (old flat task paths go through the redirect or the relink script `Server/TaskMove.mjs --relink`; never hand-retype paths in bulk). Don't edit CLAUDE.md: list its dead links in `STATE.md` for the owner.
- [ ] Re-crawl: count before → after in `STATE.md`; smoke clean; commit; merge (review report, so `merge.mjs` accepts it); land.

Sonnet 5.5, Haiku for the link triage. Worktree; one-sentence replies; land with `finish-task`, and only after the merge is on `michael/dev`.
