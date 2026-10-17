# One question about 18 asks (concrete)

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files you need. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/08-concrete/results.json` and stop.

A first pass could not tell whether each ask below is done. For each ask answer ONE question:

> The first pass found the ask too vague to test. Say in one sentence what a finished version would be and name the one file or page where it would show. Open that place. Is it there? done (path:line and quote), undone (what is missing), or unclear (it still cannot be tested: say what is missing from the ask).

Be strict: "done" needs a file you opened; a related thing is not the thing. The site serves `public/` as `/`; modules live in `public/framework/<module>/`. Rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`. Use Grep/Glob first; `git log` always with `-n 5` and a path.

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/08-concrete/results.json`

A JSON array, one object per ask, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command"],"owner_question":"only when unclear: one short yes/no question the owner can answer by voice"}]
```

## The 18 asks

1. `2bb4e4c01c` [ai] Clarify whether this page is the AI inbox or the AI log
   first pass said: A question about page naming (inbox vs log); no testable outcome. The readme (ai/readme.md:63) lists "Dashboard, Log, Inbox" as one line and does not answer it
2. `c429eeb08d` [ai/sessions] Bind data held by sessions, tasks, messages and pages, whether in their own file or embedded in page.jsonl, to templates
   first pass said: Too vague to test: no single binding spec named. Related work exists (core/Page/Template, readme.md top list), but whether it binds sessions, tasks and pages to templates is not stated.
3. `ff81c3fefe` [ai/sessions] Surface stored session information that is not shown in the table, without redoing the task and session audits
   first pass said: Vague ask (surface stored info not in the table) with no testable target.
4. `48a22399cb` [ai/sessions] Fix the page load error that appears after refresh.
   first pass said: Too vague to test: no error text or page named in the ask, and no matching fix found in the sessions module.
5. `309613f33c` [ai/sessions] Make all sessions items visible and clickable.
   first pass said: Too vague to test: 'all items visible and clickable' names no list or item, so no check can pass or fail.
6. `95b02c7b13` [ai/sessions] Fix the layout problems: areas with coloured backgrounds and no padding, wasted space, and broken elements such as the sessions page data grid.
   first pass said: Broad layout sweep with no single testable outcome; padding and wasted-space fixes exist in sessions.css (lines 46, 189), but no check covers the whole site.
7. `725a20941d` [ai/sessions] Work out how to make use of the contents of thousands of sessions
   first pass said: Too vague to test: 'make use of the contents of thousands of sessions' names no output. Related: sessions/doc/refined-asks.md and AskTally.mjs tally prompts.
8. `50697317c6` [ai/tasks] Build a named system that defines its own requirements and keeps a log of everything it does.
   first pass said: Too vague to test: no named system is defined; Steps (Server/Steps.mjs) has a log but no own requirements record
9. `0a7367fd1e` [core/Item] Decide later how to prioritise data binding work
   first pass said: A deferred decision ('decide later how to prioritise'); there is no concrete outcome to test. Its inbox entry is at core/Item/inbox.jsonl:4.
10. `58d91620ab` [core/Page] Check where the shrunken page class work stands
   first pass said: Asks for a status check on a 'shrunken page class' that no doc names; the only mention is the module's refined-asks.md:34 index line. Too vague to test.
11. `6cab9e0155` [core/Page] Page settings must persist properly
   first pass said: "Persist properly" is too vague to test; a settings file exists at core/Page/settings/settings.js:1-11 (settings.jsonl sibling of page.js), but what 'properly' means is not stated.
12. `f0506cbf0e` [core/Property] Build rock solid data structures that give real-time updates and prevent stale data
   first pass said: Vague goal ("rock solid", "real-time", "no stale data"), not testable as written. Partly served by architecture.md:21 "Emit only on actual change" (Property.js:set, line ~29) and the Item change event, but no stated test defines done.
13. `12a5b52ed0` [ext/Figma] Make results evident in the design files themselves
   first pass said: Too vague to test: "make results evident in the design files themselves" names no specific output. Related: the readme's Figma-first process (public/framework/ext/Figma/readme.md:53).
14. `cc5a01b0a9` [ext/Figma] Stop creating unique, non-reusable designs
   first pass said: A rule about how to design (stop unique designs); no single testable output. Partly served by the component/slot pages (use-figma.md:85-96).
15. `cd0f220be1` [ext/Figma] Look through other pages, such as page seven's breakdown of designs, for design data.
   first pass said: Too vague to test: 'look through other pages for design data' names no page, field or output; no record of what was looked for.
16. `637b56292b` [ext/Refine] Decide how base updates propagate to extensions
   first pass said: A design question about how base updates reach extensions; no single testable outcome named.
17. `b9ec96eb3a` [ext/Refine] Test these ideas.
   first pass said: 'Test these ideas' is too vague to test. The concrete tests are the separate asks 14 and 21's items; see 9d33de5fb3.
18. `8309c41534` [ui] UI: /framework/ui/ overhaul (later)
   first pass said: The ask is only "/framework/ui/ overhaul (later)", with no testable outcome; ui/readme.md:1 describes the current tier but names no overhaul target.
