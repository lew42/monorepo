# Checkup: the AI sheet (one AI surface for phone and desktop) and its gated steps

Budget: $15. Opus: the route decision shapes every page's URL. Read `../checkup-common.md` first: it is the job description for every checkup; this file holds only what is specific. `V` is the path named there.

## The task

**`V/sheet/`** (agent `mastermind-sheet`, Opus, dormant, $6 spent; cards "Sheet audit" and "Sheet proposal"). Landed: step 1, `rail.js` → `class Sheet extends View` (41c9607e7). `audit.md` has the facts, `proposal.md` the ten steps (class architecture: `Sheet`, `AIPage`, `AIFeed`; the route `<path>/ai/` replacing `?drawer=` and `?sheet=`; the five control-layout variants in `variants/`, its pick "A's head with E's feed"). The owner's words: `ext/drawer/doc/owner-2026-10-16-sheet.md`. Steps 2 to 10 are each "waits for the owner's yes". The one open decision: is `<path>/ai/` routing approved, with the rule that a real `ai` child wins?

1. **Decide the route.** The alternatives: (a) `<path>/ai/` as proposed (every page gets an AI sub-route; a real `ai` child of a page wins; old `?drawer=`/`?sheet=` rewritten once); (b) keep the query form; (c) a reserved segment that can never collide (`<path>/~ai/`). Weigh against CLAUDE.md ("Route everything", "data lives with its page", the owner's 2026-09-30 back-button ask) and the navigation model at `/framework/core/Page/navigation/model/`. Pick, write the `decision` line, and write it into `ext/drawer/doc/owner-2026-10-16-sheet.md` as a decision record with the alternatives.
2. **Then build, one step at a time:** hand mastermind-sheet the go for step 2 (`send_to_agent`, `revive: true`, saying: the route is decided, do step 2, commit, report to you, then step 3 without asking; the owner never gates), or take the steps over with Sonnet minions if the agent does not answer in 20 minutes. Each step is one commit through a worktree and `merge.mjs`, checked at 400 and 1200 (the phone sheet is the point). Land as many steps as the budget allows; the rest are briefs in child dirs, queued, with an estimate each.
3. **Check the layout pick** against the owner's own words (short head, live feed) and the variants' shots; if the pick stands, say so in one line; if not, say which and why.

Fence: `ext/drawer/**`, `core/Page/ai/**` (new), `ux/Dictate` only where the proposal names it, the sheet dir's records (closing lines only), this task dir.
