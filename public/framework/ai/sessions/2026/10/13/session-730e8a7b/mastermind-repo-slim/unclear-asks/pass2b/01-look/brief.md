# One question about 16 asks (look)

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files you need. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2b/01-look/results.json` and stop.

A first pass could not tell whether each ask below is done. For each ask answer ONE question:

> The first pass ran out of places to look. Look further: grep the whole repo (not only the module) for two or three key words from the ask, read the module's doc/ and tasks/, and run git log --oneline -n 5 -S"<key word>". Is it built? done (path:line and quote), undone (the places you looked), or unclear.

Be strict: "done" needs a file you opened; a related thing is not the thing. The site serves `public/` as `/`; modules live in `public/framework/<module>/`. Rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`. Use Grep/Glob first; `git log` always with `-n 5` and a path.

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2b/01-look/results.json`

A JSON array, one object per ask, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command"],"owner_question":"only when unclear: one short yes/no question the owner can answer by voice"}]
```

## The 16 asks

1. `c6adcf7143` [ai] Find out where the assistant transcription and refinement pipeline stands and get it working
   first pass said: Work item (Find where the transcription and refinement pipeline stands and get it working; finishing it changes pipeline files.); built-or-not still to check
2. `cc8bce2fc0` [ai/models] Verify that the systems are tuned and working as asked, and answer the questions about minion count, model, effort and output.
   first pass said: Work item (Verify the minion tuning (Servex/agents/tiers.js and handover.md) and record the answers; check-and-record changes files.); built-or-not still to check
3. `83b2c033e1` [ai/sessions] Consider one name for the sessions tab used consistently in the VS Code sidebar and on the phone
   first pass said: Work item (Pick one name for the sessions tab and write it in the sidebar and phone labels plus doc/ui/views.md.); built-or-not still to check
4. `29beb2654d` [ai/sessions] Investigate whether updates can be buffered so the browser paints once.
   first pass said: Work item (Investigate and record whether AISessionFollow.js (lines 64-65) can coalesce updates into one paint; may change that file.); built-or-not still to check
5. `50895c9f4a` [ai/sessions] Consider making the right sidebar scroll independently.
   first pass said: Work item (Decide and, if adopted, add an independent right-sidebar scroll rule in sessions.css.); built-or-not still to check
6. `afdc30ec2b` [ai/sessions] Check the chat bubble link to refine haiku live; it may be malformed or still point to the old style.
   first pass said: Work item (Check the Haiku refine link on the chat bubble (AISessionDetail.js, around line 145) and fix it if malformed.); built-or-not still to check
7. `fffc8104c7` [ai/sessions] Check how sessions are indexed and whether indexing is correct
   first pass said: Work item (Check the session indexing code and record the result, fixing it if wrong.); built-or-not still to check
8. `a9e07c29e8` [ai/sessions] Check whether the sessions cost breakdown is current and accurate.
   first pass said: Work item (Check the sessions cost breakdown against the real data and fix the file that computes it if stale.); built-or-not still to check
9. `f34fd2237d` [ai/sessions] Check whether the footer refreshes live and why tasks show as stalled when some are no longer stalled.
   first pass said: Work item (Check the footer live refresh and the stalled flag (AISessionFlags.js:19,46) and fix the stale logic if wrong.); built-or-not still to check
10. `36de0de1d6` [ai/sessions] Fix the cluttered sessions tab so it has visual hierarchy and text is positioned properly
   first pass said: Work item (Rework the sessions tab hierarchy and text placement in sessions.css (around lines 186-189 and 297).); built-or-not still to check
11. `ef710ac885` [core/Page] Make page data structure the go-to wrapper for cards and templates
   first pass said: Work item (Would change core/Page/Template/Template.js and the page data wrapper for cards and templates.); built-or-not still to check
12. `6471b08f1c` [core/Page] Solve the page-boundary problem through different page layouts.
   first pass said: Work item (Would change page layouts in core/Page (open questions in core/Page/doc/layout.md:68).); built-or-not still to check
13. `7246c112ac` [core/Page] Prioritise above-the-fold content at the top of each page, as in web design
   first pass said: Work item (Would change page layout so above-the-fold content sits at the top (core/Page/doc/layout.md:17).); built-or-not still to check
14. `a2d01a32d6` [ext/ai] Review the ext/AI task system
   first pass said: Work item (Review of the AI task system would check and record findings in ai/AITask and ext/ai docs.); built-or-not still to check
15. `d026c28da6` [ext/Figma] Analyse the edit that clobbered the mobile Figma page's color scheme.
   first pass said: Work item (Analysis of the past clobbering edit would be recorded in an ext/Figma doc (no clobber analysis exists yet).); built-or-not still to check
16. `0c1a95902e` [ext/Refine] Use a single consistent preview scale or a scale chosen per filter width so grid items fit with labels
   first pass said: Work item (Would change the ext/Refine preview-scale code so grid items fit their labels (one scale or one per filter width).); built-or-not still to check
