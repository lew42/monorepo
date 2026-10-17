# One question about 18 asks (work)

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files you need. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/03-work/results.json` and stop.

A first pass could not tell whether each ask below is done. For each ask answer ONE question:

> Is this a work item at all? Answer work: "yes" if finishing it would change a file, page or setting in this repo (build, fix, write, check-and-record). Answer work: "no" if it is an opinion, a question, a request for a chat answer or report, a rule about how to work, or a decision only the owner can make; then say in one line what it is.

Be strict: "done" needs a file you opened; a related thing is not the thing. The site serves `public/` as `/`; modules live in `public/framework/<module>/`. Rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`. Use Grep/Glob first; `git log` always with `-n 5` and a path.

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/03-work/results.json`

A JSON array, one object per ask, same ids, nothing else in the file:

```json
[{"id":"abc1234567","work":"yes|no","reason":"one line: what it is, or what file it would change"}]
```

## The 18 asks

1. `235bbde924` [ai/sessions] Take a screenshot of monorepo.localhost/framework/ai/sessions at 3440 pixels
   first pass said: A one-off screenshot action at 3440px; no screenshot record found in the repo to verify it was taken.
2. `7d70ca6363` [ai/sessions] Use Playwright to scroll the sessions data grid and check the gray rows
   first pass said: A one-off Playwright check of gray rows; an action, with no recorded result in the repo.
3. `d3e9f489a1` [ai/sessions] Answer where things stand on minion count, model, effort, and output.
   first pass said: A status question (minion count, model, effort, output) answered live from Servex, not a built thing to verify in the repo.
4. `c66b9e2ac2` [ai/sessions] Keep the AI session redesign from breaking data flow; robust data structures come before the UI.
   first pass said: A rule about how to work (data flow before UI), not a testable build item; no single artifact to check.
5. `0bd8ebb7de` [ai/sessions] Assess whether an in-memory database should filter session data for the UI.
   first pass said: An assessment question, not a build. The in-memory snapshot (data-architecture.md:62) is the current answer; no written verdict on an in-memory DB for filtering found.
6. `3611296288` [ai/sessions] Do not auto compact everything, because compaction loses deltas and the path to decisions.
   first pass said: A rule about how to work (no auto-compact). No auto-compaction exists: Server/Compact.mjs is DRY RUN ONLY (line 1), so the rule is met but not written as a check.
7. `e2f85cfcc5` [ai/tasks] Find out whether Haiku can do the reading and refinement, or whether it only recommends changes.
   first pass said: A research question with no recorded answer for images; the only Haiku accuracy figure found (handover.md:147, first Haiku pass 58% right) is for the task audit, not layout reading
8. `e74e1d5156` [ai/tasks] Decide who runs UI testing and whether to spawn a new agent or use existing ones.
   first pass said: A decision about who runs UI testing and whether to spawn new agents; no recorded decision found
9. `00edbf0b55` [ai/tasks] Decide whether the system is documented by AI or by Node.
   first pass said: A decision about whether AI or Node documents the system; no decision recorded in CLAUDE.md or organization.md
10. `3e6c180e5d` [ai/tasks] Look into whether the AI can work reliably as the mastermind's image judge over time, tracking outcomes to see what works.
   first pass said: An investigation ask (whether the image judge works over time); no outcome tracking found, so the answer is not yet known
11. `fad95371df` [core] Maybe extend item into a bindable item
   first pass said: A question answered on file: binding.md:105 decides "no BindableItem class"; Item stays unchanged and binds through its own change event (binding.md:123). Property.Of (core/Property/Property.js:137) is the bindable wrapper. Owner's call whether to revisit.
12. `40a55c7657` [core/Item] Treat the Item class as the existing data binding system
   first pass said: A direction for how to build, not a testable thing: Item already emits change/delta and Property.of mirrors its keys (core/Property/Property.js:166), so the framing is partly true, but 'treat as the binding system' is an opinion the owner must confirm.
13. `4b1009f354` [core/Page] Treat the page system as the go-to storage and streaming container
   first pass said: An opinion about the system's role. The module has storage.md ("where lines can be kept, today and later", readme.md:62) and streaming.md, but no decision that names it the go-to container.
14. `ec4b46e8f4` [core/Page] Should full load be restricted, e.g.
   first pass said: The ask is an incomplete question ("Should full load be restricted, e.g."). Current behaviour is in doc/server.md:6-7: it loads once and unloads after 5 minutes idle.
15. `f975fb1a85` [core/Page] Decide whether every layout should be auto-screenshotted at every lower breakpoint to check it does not break.
   first pass said: A decision question: whether to auto-shoot every layout at every lower breakpoint. Not a buildable fact; the current rule is in Shots.mjs:28-34 (widths below an optimal width).
16. `ffea522cb7` [core/Page] Decide how to handle very tall, narrow screenshots from full-page layouts at mobile widths.
   first pass said: A decision question on very tall narrow mobile shots; no recorded decision in ext/Shots/doc/architecture.md or core/Page/doc/refined-asks.md:27.
17. `0eedc38924` [core/Page] Decide how to rank templates.
   first pass said: A decision: how to rank templates. Not testable until the owner picks a rule; no ranking doc exists (core/Page/Template/readme.md has none).
18. `88638492b7` [core/Page] Do not create a new class for each slightly different layout; keep it flexible
   first pass said: An opinion about how to design layouts; not a checkable fact. Related: core/Page/doc/refined-asks.md:21 still ⬜.
