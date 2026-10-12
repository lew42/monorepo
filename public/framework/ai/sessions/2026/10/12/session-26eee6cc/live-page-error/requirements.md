# Live site: a page load error hit the owner mid-browse, and UI lands without screenshots

**Owner (2026-10-12, ~14:10 local):** browsing `/framework/ai/sessions/` (a session detail open), the page refreshed itself and showed a page load error.
> "We shouldn't be causing errors on the live site while I'm browsing it… I thought we weren't doing that anymore."

## Done when (tick each with proof)
- [ ] **Find the cause:** what reloaded and what failed around 19:00–19:15Z (merges on `michael/dev`: `git log --since`, the dev server and Servex logs via `server_logs`, the hold log). Name the commit or write that did it and why the guard (`Server/hold.mjs`, worktree → `check_page` → merge) didn't stop it.
- [ ] **Close the gap in code**, not in a rule only: e.g. merge holds reloads and boots the page headless before releasing; a page that fails after a reload keeps the old one with a one-line notice instead of an error screen. Smallest fix that would have prevented this one; record the alternative.
- [ ] **Screenshots gate:** UI agents keep landing layouts nobody looked at (cut-off columns, crammed tables). Check whether `merge.mjs`'s review gate really requires the 400/1200/1920/3440 shots for a page change; if it can be skipped, make it require them (files present in the task dir). One line in the relevant doc.
- [ ] Note in `Server/doc/watch.md`; commit; merge; land.

Sonnet 5.5. Worktree; one Servex restart if needed, proven on a private port. `STATE.md` here; one-sentence replies; land with `finish-task`.
