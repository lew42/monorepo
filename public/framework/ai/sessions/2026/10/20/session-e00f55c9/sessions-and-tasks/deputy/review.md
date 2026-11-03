verdict: fix
1. [fix] The doc that describes the processes still lists the old steps: `public/framework/core/Task/doc/process.md:5` and `:69` say build is "… execute → review → merge", and `:70` says design is "… code → review → merge". Neither mentions the new `index` step. Add it to all three lines in this branch, because Law 9 says the doc must match the code.
2. [note] This diff completes none of the numbered items in requirements.md. It adds an `index` step to both process templates (`BuildProcess.js`, `DesignProcess.js`) and a "show the look first" sentence to the build plan step. At most it is part of item 4 ("a builder that builds a whole system documents it"). Item 4's real deliverables are still to do: the unified docs rule, written into the documentation skill, `ai/doc/readme-system.md` and the mastermind role readme. Don't count this diff as item 4 done.
3. [note] `index` is a safe step id. Nothing named `index` exists on Task, Process or Item (I checked Task.js, Process.js and Item.js), so it won't call a verb by accident, which is what the warning at `BuildProcess.js:2` is about.
4. [note] The test covers only the build template: `Servex/ProcessRunner.test.mjs:55,133` now expect 8 steps, and line 80 completes `index`. Nothing tests the design template's new step. A one-line check that `design` has `index` between `code` and `review` would catch a template that drifts later.
5. [note] Is there a simpler way? Not really. A separate step written into each template is the plainest way to do it. The same `do` text appears in both templates (`BuildProcess.js` index step, `DesignProcess.js` index step), so if it changes often, one shared constant would avoid two copies drifting apart. That is optional.

## Requirements
- How to work, "Build things the owner can see" — yes, in part: the plan step now asks for a Figma frame or a screenshot before anything more is built (`BuildProcess.js`, plan `do`)
- 0 "Finish the merge in flight" — n/a, not in this diff
- 1 "The owner's review page" — n/a, not in this diff
- 2 "The 230 proposed tasks" — n/a, not in this diff
- 3 "Process names: decided … phase→step rename" — n/a; the diff already says "step" throughout and adds no "phase"
- 4 "A builder that builds a whole system documents it" — partly: the new `index` step makes the builder add readme lines and parent links. The rule itself is not yet written into the skill, `readme-system.md` or the role readme
- 5 "Leaks" — n/a, not in this diff
- 6 "priority.md" — n/a, not in this diff
## Words
- The `index` step's `do` text is plain and checkable: it says what to add, where, and how to prove it ("Load the parent page and click through") — yes
- The step's title, "Index it", matches the owner's sense of making something findable — yes
- `process.md` still describes the old step lists — no (finding 1)
