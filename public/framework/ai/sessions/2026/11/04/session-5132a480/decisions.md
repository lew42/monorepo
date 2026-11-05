# Decisions this session made for the owner

The owner, 2026-11-04: make the best reversible decision, get it done, and write it down. Each line says what was chosen and what the alternative was. Git undoes any of them.

- **`CLAUDE.md` line 11: removed "task mastermind".** It's an alias of `mastermind`, not a role (`Servex/agents/roles.js:53`). The alternative was to leave it for the owner, because that file normally needs asking; the owner gave standing permission for reversible choices the same evening, and this is two words.
- **"Never push" in the mastermind role becomes "never push by hand; `merge.mjs` pushes".** `CLAUDE.md` says `merge.mjs` pushes after each landing. Not applied yet: the role file is being edited by the cleanup job. The alternative was to ask.
- **Jobs run in stages, not all at once.** On 11-04 at 23:04 the week read 2% used, 1% gone, over pace. That early in a window it's noisy, since one job moves it, but the owner wants spend kept under the line. So the logging, cost, report page and open-work jobs start as the four running jobs land, cheapest first, with the report page after the completion score it reads. The alternative was starting all four at once, for $13 more in flight.
- **Hard spend caps: not built.** The owner declined them. Expected and actual costs are tracked instead.
