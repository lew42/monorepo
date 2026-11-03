# One question about 18 asks (work)

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files you need. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/02-work/results.json` and stop.

A first pass could not tell whether each ask below is done. For each ask answer ONE question:

> Is this a work item at all? Answer work: "yes" if finishing it would change a file, page or setting in this repo (build, fix, write, check-and-record). Answer work: "no" if it is an opinion, a question, a request for a chat answer or report, a rule about how to work, or a decision only the owner can make; then say in one line what it is.

Be strict: "done" needs a file you opened; a related thing is not the thing. The site serves `public/` as `/`; modules live in `public/framework/<module>/`. Rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`. Use Grep/Glob first; `git log` always with `-n 5` and a path.

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/02-work/results.json`

A JSON array, one object per ask, same ids, nothing else in the file:

```json
[{"id":"abc1234567","work":"yes|no","reason":"one line: what it is, or what file it would change"}]
```

## The 18 asks

1. `38aa2fe214` [ai/sessions] Decide how to properly handle the session data.
   first pass said: A decision on how to handle session data; same as 7, no testable deliverable.
2. `610571a5ea` [ai/sessions] Report where the session data work currently stands.
   first pass said: A request for a status report, same as 8.
3. `83b2c033e1` [ai/sessions] Consider one name for the sessions tab used consistently in the VS Code sidebar and on the phone
   first pass said: A naming decision (one name for the sessions tab in sidebar and phone); no single agreed name is recorded in the readme or doc/ui/views.md.
4. `66c9f1efbe` [ai/sessions] Should the sessions list update live as sessions change, or hold still while the owner reads it?
   first pass said: A question (live or hold still); the built answer is live: public/framework/ai/sessions/doc/live/realtime.md says the grid updates within a second, but no hold-still choice exists.
5. `ab949615c7` [ai/sessions] Treat AI sessions as dev-side only; do not design for production
   first pass said: A design rule (dev-side only); the readme says the realtime index runs on the main dev server only, but this is a rule, not a build.
6. `29beb2654d` [ai/sessions] Investigate whether updates can be buffered so the browser paints once.
   first pass said: An investigation (can updates be buffered so the browser paints once); AISessionFollow.js:64-65 already batches new log lines per read, but no paint-once scheduling was found.
7. `50895c9f4a` [ai/sessions] Consider making the right sidebar scroll independently.
   first pass said: A consider-item, not a build: no independent sidebar scroll rule found. sessions.css:47 only makes a clipping box the sticky header scroller; no right-sidebar scroll rule.
8. `d41d9ea683` [ai/sessions] Stop responding with long chat-style walls of text; responses should be refined.
   first pass said: A behaviour rule for the assistant's replies, not a testable repo thing. The repo CLAUDE.md has no reply-length rule; the global memory rule ("Chat is the headline") lives outside the repo.
9. `57433b31d9` [ai/sessions] Explain how chat bubbles are stored, and whether they all go into session.jsonl.
   first pass said: A question to explain, not a build. Partial answer: AISession/doc/accounting-decision.md:19 says session.jsonl rename is "Not done" and 588 folders already hold session.jsonl digest tags.
10. `afdc30ec2b` [ai/sessions] Check the chat bubble link to refine haiku live; it may be malformed or still point to the old style.
   first pass said: Needs a live browser to click the bubble link and see whether the Haiku refine link is malformed; not testable by reading the repo. Related: AISessionDetail.js:145 voice flow.
11. `91797d8544` [ai/sessions] Decide whether session tab names are worth keeping, since they are not all needed but could help
   first pass said: Opinion: whether tab names are worth keeping is a judgment call, not testable.
12. `fffc8104c7` [ai/sessions] Check how sessions are indexed and whether indexing is correct
   first pass said: Asks for a check of indexing correctness; an audit judgment, not a fact the repo answers by existing.
13. `a9e07c29e8` [ai/sessions] Check whether the sessions cost breakdown is current and accurate.
   first pass said: Asks for an accuracy check of the cost breakdown; a measurement, not an existing feature to point at.
14. `c0e403144f` [ai/sessions] Do not add a database for this problem.
   first pass said: A constraint on how to build (no database), not a testable feature.
15. `2002d0e09b` [ai/sessions] Question whether the footer is needed at all, and explain what 'one below' means.
   first pass said: A question (is the footer needed) plus a request to explain 'one below'; the footer is now a one-line status line (sessions.css:323-324), but no answer is written.
16. `f34fd2237d` [ai/sessions] Check whether the footer refreshes live and why tasks show as stalled when some are no longer stalled.
   first pass said: Question. The stalled flag is 'working and quiet for 5 minutes' (public/framework/ai/AISession/AISessionFlags.js:19,46); whether the footer refreshes live and why old stalled tasks persist is not answered in the repo.
17. `490dcdffcb` [ai/sessions] Find and talk to the other Opus mastermind session
   first pass said: An action (find and talk to another Opus session), not a built thing; nothing in the repo records it.
18. `36de0de1d6` [ai/sessions] Fix the cluttered sessions tab so it has visual hierarchy and text is positioned properly
   first pass said: Visual hierarchy is a judgment call; no test or spec defines it. Relevant styling exists in sessions.css (e.g. lines 186-189 and 297).
