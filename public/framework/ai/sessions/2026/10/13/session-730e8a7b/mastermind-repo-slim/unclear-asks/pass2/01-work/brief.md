# One question about 18 asks (work)

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files you need. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/01-work/results.json` and stop.

A first pass could not tell whether each ask below is done. For each ask answer ONE question:

> Is this a work item at all? Answer work: "yes" if finishing it would change a file, page or setting in this repo (build, fix, write, check-and-record). Answer work: "no" if it is an opinion, a question, a request for a chat answer or report, a rule about how to work, or a decision only the owner can make; then say in one line what it is.

Be strict: "done" needs a file you opened; a related thing is not the thing. The site serves `public/` as `/`; modules live in `public/framework/<module>/`. Rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`. Use Grep/Glob first; `git log` always with `-n 5` and a path.

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/01-work/results.json`

A JSON array, one object per ask, same ids, nothing else in the file:

```json
[{"id":"abc1234567","work":"yes|no","reason":"one line: what it is, or what file it would change"}]
```

## The 18 asks

1. `1efa25fdc9` [ai] Masterminds decide the remaining design, and use minions where appropriate once decisions are made; do not wrap up the design yet
   first pass said: A working rule about how masterminds decide and use minions; not testable as a file change.
2. `f930aeb2be` [ai] Decide how many rule systems there should be and what they are called
   first pass said: A decision question (how many rule systems and their names); no file can settle it on its own. CLAUDE.md names the rule set but no decision record was found.
3. `4f41c7afdc` [ai] Check whether relying on the AI to choose skills is reliable enough
   first pass said: A question about whether choosing skills by the AI is reliable; it needs a judgment, not a file check.
4. `303c9a27d0` [ai] Report where node tool work stands and how the SDK defines tools
   first pass said: A report request. The tool definitions are in Servex/doc/sdk.md and Servex/agents/tools.js (grep hit for tool( and createSdkMcpServer), but I did not open them, so I cannot state where node tool work stands.
5. `1978b57ea0` [ai] Keep working with minions while usage stays under pace.
   first pass said: An operating instruction to keep minions going while under pace, not a checkable artifact.
6. `097747c2a6` [ai] Find and talk to the other Opus mastermind session; the owner has forgotten its session ID.
   first pass said: A request to find a session ID; it is a lookup on the session record, not a repo file check. Not searched in this batch.
7. `3053aa934b` [ai] Check whether the fast assistant is doing anything at all right now.
   first pass said: A live status question about what the fast assistant is doing now; the answer changes by the minute, so it cannot be checked from repo files.
8. `b1122ab68c` [ai] Report the status of the AI model testing system.
   first pass said: a request for a status report, not a buildable thing; the report is not a repo artifact to test
9. `f335443cb4` [ai] Maybe the smart assistant ranks options, possibly with a mastermind.
   first pass said: 'maybe' opinion about whether ranking needs a mastermind; not a testable requirement
10. `db74429be4` [ai] Keep the smart assistant quick and light, relaying with minimal work.
   first pass said: opinion ('keep quick and light'); no measurable rule in the repo
11. `dd0fc759af` [ai] Decide which AI-using things (e.g.
   first pass said: The ask text is cut off after "Decide which AI-using things (e.g."; no complete decision to test
12. `81d1ab9ef2` [ai] Possibly make the smart assistant a variant of the fast one that monitors the pipeline and suggests fixes, while staying hands off on decisions and launches
   first pass said: Phrased as "Possibly" (a suggestion, not a deliverable); no single test for "monitors and suggests fixes"
13. `c6f67dbda6` [ai] Possibly choose the right model per task to improve token efficiency
   first pass said: Phrased as "Possibly" (an idea to weigh, not a test); a model-per-task choice exists only in ai/doc/refined-asks.md as a note
14. `c6adcf7143` [ai] Find out where the assistant transcription and refinement pipeline stands and get it working
   first pass said: A status question ("find out where ... stands"); the answer is a report, not a deliverable. No todo.md item tracks it as landed
15. `cc8bce2fc0` [ai/models] Verify that the systems are tuned and working as asked, and answer the questions about minion count, model, effort and output.
   first pass said: A request to verify tuning and answer questions about minion count, model, effort and output; it is a check and a question, not a single testable build. Minion model is Haiku per public/framework/ai/handover.md:135; effort lives in Servex/agents/tiers.js:2 and the other facts need a live run.
16. `0fe11f89bb` [ai/sessions] Decide whether sessions should be merged, case by case or in bulk
   first pass said: A decision (case by case or in bulk); no merge policy recorded. Nearest is Server/session-migrate.mjs:137 merge_into, which moves folders by path only.
17. `e7b39cc2ef` [ai/sessions] Decide how session data should be properly handled, since it is not yet confirmed to be handled correctly
   first pass said: A request to decide how session data should be handled; it is a decision, not a testable build.
18. `be8399c861` [ai/sessions] Report where the session data work currently stands
   first pass said: A request for a status report; the status is in doc/data/layout.md and doc/data/findings.md, but the ask is a report, not a build.
