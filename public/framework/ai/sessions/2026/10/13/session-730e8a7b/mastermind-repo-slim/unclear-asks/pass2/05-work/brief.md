# One question about 18 asks (work)

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files you need. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/05-work/results.json` and stop.

A first pass could not tell whether each ask below is done. For each ask answer ONE question:

> Is this a work item at all? Answer work: "yes" if finishing it would change a file, page or setting in this repo (build, fix, write, check-and-record). Answer work: "no" if it is an opinion, a question, a request for a chat answer or report, a rule about how to work, or a decision only the owner can make; then say in one line what it is.

Be strict: "done" needs a file you opened; a related thing is not the thing. The site serves `public/` as `/`; modules live in `public/framework/<module>/`. Rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`. Use Grep/Glob first; `git log` always with `-n 5` and a path.

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/05-work/results.json`

A JSON array, one object per ask, same ids, nothing else in the file:

```json
[{"id":"abc1234567","work":"yes|no","reason":"one line: what it is, or what file it would change"}]
```

## The 18 asks

1. `f40949f956` [ext/Figma] Spawn Sonnet minions to go through the website and build a component system in this Figma file
   first pass said: An instruction to spawn Sonnet minions (a process step), not a built output; the component work it asks for is covered elsewhere (use-figma.md:111-130).
2. `ff2a721ea7` [ext/Figma] Work in ext/figma: read the READMEs and study the systems in mastermind mode.
   first pass said: A working-mode instruction (read READMEs, study systems as mastermind), not a testable deliverable; the readme chain it names exists at public/framework/ext/Figma/readme.md.
3. `6892e9283b` [ext/Figma] Read what is already documented in the Figma MCP folder before starting.
   first pass said: A read-first instruction, not a deliverable; the folder it names exists (public/framework/ext/Figma/doc/mcp-servers.md, doc/observations.md).
4. `fd5d25ba1e` [ext/Figma] Document what is learned as we go.
   first pass said: A working rule (document as you go), not a single deliverable; the place it names exists: public/framework/ext/Figma/doc/observations.md ("keep it current", readme.md:75).
5. `b994cb4cf7` [ext/Figma] Read the README in EXT/Figma and study the systems in the ext/figma directory in mastermind mode.
   first pass said: A working-mode instruction (read the README, study systems as mastermind), not a testable deliverable; public/framework/ext/Figma/readme.md exists.
6. `474fbb95ce` [ext/Figma] Consider a Figma MCP skill that can do anything in Figma.
   first pass said: An open 'consider' with no defined outcome; no skill that does anything in Figma exists in the folder (the MCP tools are listed in doc/mcp-servers.md).
7. `c2c6b98de3` [ext/Figma] Review what is already documented in the Figma MCP folder before pulling anything new.
   first pass said: A read-first instruction, not a deliverable; the folder it names exists: public/framework/ext/Figma/doc/ (mcp-servers.md, observations.md, use-figma.md).
8. `84f4503641` [ext/Figma] Document what is learned as work proceeds.
   first pass said: A working rule (document as work proceeds), not a deliverable; doc/observations.md exists and is linked from readme.md:75.
9. `1ff76d4742` [ext/Figma] Keep the current growth behaviour of the layout, which the owner likes.
   first pass said: A preference ('the owner likes') with no testable definition of the current growth behaviour; the nearest rules are figma-layout.md:5 (FILL/HUG) and :15, which state rules, not what the owner liked.
10. `8deadbfe09` [ext/Figma] Is a page template the right approach for these layouts?
   first pass said: A question ("Is a page template the right approach"); no doc answers it yet. inbox.jsonl:47.
11. `f4bae9450f` [ext/Figma] Are the current layouts correct, and is the light gray background right?
   first pass said: A question ("Are the current layouts correct, and is the light gray background right?"), asking for a judgment, not a build. inbox.jsonl:48.
12. `b0b6e0f747` [ext/Figma] Consider building the entire UI kit from these color permutations.
   first pass said: Phrased as "Consider building", an opinion, not a testable build. The Colour · Permutations page (doc/file-map.md:22) and kit pages exist, but the entire UI kit is not claimed built.
13. `32eccca1d5` [ext/Figma] Clarify what "Path" refers to, then check why the "other agents" option points at mcp.figma.com/mcp.
   first pass said: A question about what the owner meant by "Path" in a menu; no repo file can answer which option it was. refined-asks.md:133 still open
14. `9b5b62c3c9` [ext/Figma] Is the 'Claude Code (Figma), Figma MCP in Claude' entry one item or two?
   first pass said: A question about how one sidebar entry is counted in the owner's menu; the repo cannot settle it, and the owner checks the menu directly
15. `f2e46a694c` [ext/Figma] Verify the answer with sources and do not hallucinate; the owner will check the menus himself.
   first pass said: An instruction about how to answer, not a thing to build; it is met by citing sources in the answer, and no repo file tests it
16. `edd2b6e042` [ext/Figma] Tell the owner whether the agent can see which Figma page they are currently on.
   first pass said: Question, not built: mcp-servers.md:5 says the desktop server sees the selection but says nothing about the current page; the answer needs a live check of the desktop server.
17. `d5012b0af2` [ext/Figma] Consider using the Figma workflow for layout work
   first pass said: Opinion/decision about which workflow to use; the repo already uses the Figma workflow for layout (doc/figma-layout.md:1-11, doc/use-figma.md:19-20 'Compose: createAutoLayout'), so the question is whether to keep it.
18. `8bb1e87196` [ext/Figma] Decide whether reviewing is the right approach for the Figma files.
   first pass said: Opinion about whether reviewing fits Figma files; no decision recorded. Question for the owner's judgment, not a build item.
