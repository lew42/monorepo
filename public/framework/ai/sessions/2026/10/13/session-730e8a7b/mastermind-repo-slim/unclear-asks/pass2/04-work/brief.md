# One question about 18 asks (work)

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files you need. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/04-work/results.json` and stop.

A first pass could not tell whether each ask below is done. For each ask answer ONE question:

> Is this a work item at all? Answer work: "yes" if finishing it would change a file, page or setting in this repo (build, fix, write, check-and-record). Answer work: "no" if it is an opinion, a question, a request for a chat answer or report, a rule about how to work, or a decision only the owner can make; then say in one line what it is.

Be strict: "done" needs a file you opened; a related thing is not the thing. The site serves `public/` as `/`; modules live in `public/framework/<module>/`. Rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`. Use Grep/Glob first; `git log` always with `-n 5` and a path.

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/04-work/results.json`

A JSON array, one object per ask, same ids, nothing else in the file:

```json
[{"id":"abc1234567","work":"yes|no","reason":"one line: what it is, or what file it would change"}]
```

## The 18 asks

1. `26cf134291` [core/Page] Use the Page class as the organizer; maybe extend Page for specific patterns or modes, designed so it works and makes sense
   first pass said: A design opinion on extending Page for modes. Partly built: Page.use(Inbox) and ext/ (core/Page/ext/readme.md) show the extension pattern, but whether it fits this ask is a judgment call.
2. `ef710ac885` [core/Page] Make page data structure the go-to wrapper for cards and templates
   first pass said: Intent (page data as the wrapper for cards and templates) is a design direction, not a testable thing; Template extends Page at core/Page/Template/Template.js:6 is related but not the stated wrapper rule.
3. `29082f25d1` [core/Page] Question whether pages really need multiple renders
   first pass said: A question about whether pages need multiple renders; it asks for a decision, not a build. Template's multi-view design (Template.js:8,32) is the current answer.
4. `6471b08f1c` [core/Page] Solve the page-boundary problem through different page layouts.
   first pass said: A design question (solve the page-boundary problem through layouts); core/Page/doc/layout.md has open questions (line 68) but no decided answer to test.
5. `7246c112ac` [core/Page] Prioritise above-the-fold content at the top of each page, as in web design
   first pass said: A web-design principle, not a build step; the layout rule for above-the-fold content lives in the styles layout skill, and core/Page/doc/layout.md:17 only says content sits above the rail.
6. `ebbf6ef00e` [core/Page] Work out how pages are instantiated and how agents read live updates without it getting tricky
   first pass said: An open design question (how pages are instantiated and how agents read live updates); the answer is in core/Page/doc/server-instance.md, which is a proposal, not a decision.
7. `1c72f44b5a` [design] Do not turn these suggestions into rigid laws that cause breakage.
   first pass said: A rule about how to write guidance, not a feature; the docs already follow it: public/framework/design/layout/doc/space.md:3 - "Suggestions, not laws." and layout/doc/rules.md:12 - "strong defaults, not laws".
8. `a2d01a32d6` [ext/ai] Review the ext/AI task system
   first pass said: A review is an opinion, not a testable build: the AI task system now lives in ai/AITask (moved from ext/AITask, commit 337e4b683), and ext/ai holds only log.jsonl, inbox.jsonl and doc/refined-asks.md.
9. `191147b4eb` [ext/ai] Find out when and why the AI task tree was built
   first pass said: A question about history, answered in the doc: views.md:3 says the tree, lanes, outline and flow views were built on 2026-09-29 by the nested-tasks and minion-view sessions, to be checked against the owner's ask; the git log shows only the 2026-10 move commit 337e4b683 (no build commit found by -S search).
10. `a6611b4914` [ext/Figma] Explain the gist of the Figma MCP
   first pass said: A request to explain; the answer exists at public/framework/ext/Figma/doc/mcp-servers.md:1-10 (two Figma MCP servers, desktop read vs remote write). Not a testable build ask.
11. `d026c28da6` [ext/Figma] Analyse the edit that clobbered the mobile Figma page's color scheme.
   first pass said: An analysis of one past edit; no code or doc records a clobber analysis for the mobile page (searched scheme.md and figma-to-framework.md for mobile/clobber: no match).
12. `464e59974c` [ext/Figma] Decide whether to lean into primary-background color schemes yet
   first pass said: A decision (lean into primary-background schemes or not); the owner has not decided. Recorded open in doc/refined-asks.md and the handover.
13. `bfba1f6579` [ext/Figma] Clarify naming for light and dark, text versus background
   first pass said: A naming rule, not a testable build. The owner wants a decision on light/dark naming; no name rule is written in the module.
14. `17e250d259` [ext/Figma] Keep the default color scheme simple and use upgraded schemes sparingly
   first pass said: An opinion about how to use schemes (keep default simple). Not testable; the Figma design approach is in doc/figma-browser-loop.md and doc/scheme.md.
15. `382da051a0` [ext/Figma] Make design-system suggestions.
   first pass said: Opinion/advice request with no testable output; design suggestions are scattered across doc/use-figma.md and design/ docs.
16. `f95bd6d0f6` [ext/Figma] Use the Figma MCP for a collaborative planning phase: rough draft of scenes, graphics and animation before editing
   first pass said: A working-method rule, not a testable build: the readme sets the process as design, approve, then code (public/framework/ext/Figma/readme.md:53 "design in Figma with the tokens and kit, click through it, approve it, then code it").
17. `d8817a194b` [ext/Figma] Use Figma as the approach for fixing layouts.
   first pass said: A way-of-working rule (Figma as the approach); the process is stated in readme.md ("The process" bullet) but is not a testable deliverable.
18. `84219fd737` [ext/Figma] Use Figma as the way to work on layout.
   first pass said: A way-of-working rule (use Figma to work on layout); readme.md:53 states the process but it is a method, not a checkable output.
