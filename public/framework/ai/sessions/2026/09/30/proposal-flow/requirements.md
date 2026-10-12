# Proposals become tasks: node-led, never waiting on the owner: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step.

**Queued for the 10 PM weekly reset (2026-09-30).** Foundational, so no cap. Plan first, with a picture, on a card.

## The rule behind it
**Nothing ever waits on the owner.** The mastermind makes the best decision and says what the alternative was. If usage limits block the work, it is queued, not parked "awaiting approval". When the owner is working interactively, a chooser or Decision UI is fine, but only as a nudge in context (an Inbox item), never as a gate.

## Asks
1. **A `Proposal` class:** a content widget that is also a process.
   1. Any minion can create one.
   2. The mastermind reviews it: asks questions, clarifies, does light research, and checks that the alternatives were weighed.
   3. It DECIDES.
   4. The accepted proposal turns into a **task with steps**.
2. **Reuse the proposer.** The agent that wrote the proposal usually builds it, because it has the context.
3. **The Inbox shows it live.** When a proposal is under review, the owner's Inbox gets an item. Clicking it shows the proposal and the review as it happens (a review agent spawning, questions, the verdict).
4. **Node-led, not memory-led.** Node, not the AI's memory, tracks the start and completion of every task and every step, and re-prompts the agent. It's a programmatic loop in Servex, rather than a skill the AI must remember to call.
5. **Decisions are weighted by impact.** A decision that steers the future of the system, and is hard to make, gets a high importance score and surfaces near the top of the Inbox. The work still never waits on it.
6. **Build the architect's accepted proposal** ([card](/framework/ai2/2026/09/30/proposal-budgets-merge-approval-template/); `ai/2026-09-30/servex-mastermind/merge-approval-proposal.md`), all four recommendations plus §7–§9:
   - `foundational: true` budgets report, never stop; reuse an agent before spawning;
   - merge rows on the task card with the diff, the review and shots. Foundational merges wait as an Inbox approval, but the WORK continues. Revert is a Servex tool;
   - template weights: imports plus a `use_template` node function;
   - one page.jsonl, with old log lines archived on an interval;
   - embedded items, promotion, and the session focus on the selected card.

## Owner
The Servex architect (mastermind-servex's next instance, from its checkpoint). It wrote the proposal, so it builds it with its minions.

## Added 2026-09-30 (16:10): see owner-words.md, last section
7. **A phased UI feedback loop.** When a builder thinks a UI is done, a first-pass look runs automatically: screenshots at 4 widths, a rough visual check, and recommendations. The builder improves it, and this repeats for a few phases. It's node-led, like item 4.
8. **A monitor on the MAIN site.** Agents may break their own worktrees and learn from it, but the main site stays healthy. `Server/health.mjs` already loads the affected pages after every file change and tells the editor. It misses:
   - a main-thread stall: `/framework/ai2/` blocks for about 13 s after load, and the owner's tab "crashed";
   - visual anomalies: the unread dot was stretched to 8×38.

   Add a stall check (long tasks over 2 s) and a cheap anomaly check. Also, two `health-supervisor.mjs` processes are running at once; make it a single instance.

## Added 2026-09-30 (16:30): see owner-words.md, last section. DO THESE FIRST in this task
9. **The main branch is production.** The owner browses it live, so it must never crash or throw. Worktrees are where agents smoke-test. A mastermind writes straight to main only when it is certain the change can't error.
10. **A monitor agent** (extend `Server/health.mjs`, don't start over): a Playwright browser pointed at the main branch.
    - On a TEMPLATE change (JS, CSS, HTML, page.js), and NOT on log appends (those are data, rendered by templates already tested):
      1. load the pages that changed;
      2. check the console for errors;
      3. take a screenshot;
      4. check for stalls over 2 s.
    - A quick layout scan comes later.
    - Report to the agent that made the edit (as today) AND to the dashboard.
11. **Validated writes only.** The guard hook `.claude/hooks/jsonl-guard.mjs` is written and tested but UNWIRED (the owner, 2026-09-30: "you don't want to block it… before we've figured out how to do it the other way"). Order: first make the validated route the easy default everywhere (skills, Servex tools, scripts), then wire the guard. Every log and JSONL write goes through a tool that validates it before writing: the Servex MCP `append_log`, or `.claude/hooks/append.mjs`, which re-parses the whole file and names any bad line. Never a bash `echo >>` or `printf >>`. Add a PreToolUse hook that refuses a shell append to `*.jsonl` with a pointer to the tool (like the git guard, `.claude/hooks/git-guard.mjs`). Malformed JSONL is a real crash source.
12. **Unknown verbs in the logs** (the owner saw them in the console on /framework/ai2/, 2026-09-30 16:30). Loading AI 2 prints `JSONL: unknown verb …` for lines that PARSE but don't fit the schema:
    - **Flat lines with no verb:** `{"at","task","msg"}` in `ai/2026-09-30/day.jsonl`, and `{"type":"launch",…}` / `{"type":"decision",…}` in `sheet-regression/task.jsonl`.
    - **Verbs the skills teach but the reader doesn't know:** `experiment` (the servex-mastermind skill says to log it) and `review` (page-audit, servex-mastermind, ai2-inbox-log-fix, sheet-regression).

    **Fix both ends:**
    - (a) The validator (`append.mjs` / `append_log`) checks each line against the file's schema (task.jsonl, day.jsonl, page.jsonl) and REFUSES an unknown verb or a flat line, naming the right shape.
    - (b) Register the legitimate new verbs in the reader (`ext/JSONL/JSONL.js`), so `experiment` and `review` render.

    Old lines stay (the logs are append-only), and the reader shows a flat line as a plain log line. A Playwright check on the monitor counts these warnings so they can't creep back.
