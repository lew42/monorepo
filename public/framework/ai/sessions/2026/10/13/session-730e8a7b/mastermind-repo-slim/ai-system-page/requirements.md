# The AI system, defined: its components for AI first, shown to the owner second; the directives that belong in its readme

Budget: $12. Load the `sub-mastermind`, `page` and `documentation` skills first. Your log is this dir's `task.jsonl`.

The owner's asks (raw words: `../requirements-5.md`, asks 5, 6, 10). Report each as `- [x]` with proof, or `- [ ]`:

- [ ] The AI system is defined in one place, `framework/ai`.
- [ ] Its components are documented for AI first, then shown to the owner.
- [ ] Directives that resonate go in `architecture.md` or the readme (never copy a file by reading and rewriting it; move or copy).
- [ ] Open questions are named: how many minions, which model, which effort, what they get done.
- [ ] The functional approach is recorded: node answers each finished step with the next, steps are pre-programmed once the mastermind approves, each step is logged with timestamps.
- [ ] Fresh sessions after a round of work.

CLAUDE.md rules that apply: readmes point, docs explain; the iceberg readme; show the class; link every mention; never destructive.

## What exists

- `public/framework/ai/readme.md` (the index; under 100 lines after the 10-12 audit), `ai/doc/` (`classes.md`, `organization.md`, `task-folders.md`, `repo-size.md`, `follow-up.md` today), `ai/SystemClasses.js`, `ext/System` (a generic System class with a class card, instances and a beat; `ReadmeSystem`, `NavigationSystem`), the Systems tab, `Servex/doc/architecture.md`, `Servex/doc/steps.md` + `Server/Steps.mjs` (the step runner: the automated loop the owner describes already exists in part), `Servex/TaskLoop.js`, `.claude/skills/*` (the skills are the AI system's contracts), the model-testing past work (`node Server/PastWork.mjs "model testing eval"`).

## Deliverable

1. **`public/framework/ai/doc/architecture.md`** (the AI system's conclusive decisions, in the shape the sibling `architecture-md` task is putting into the documentation skill: what the system is and its pattern; one entry per decision with why, the alternative and trade-off, and a link): the readme chain as the AI's memory; tasks as folders with JSONL logs; cards as the owner's surface; roles and tiers (assistant / mastermind / minion, Haiku / Sonnet / Opus) and when each is used; worktrees and the merge gate; the step runner as the loop (code reprompts, not memory); logs as persistence (no handoff files); fresh sessions after a round; token directives (never copy a file by reading and writing it, batch reads, scripts compute, Haiku under 100k). Under 100 lines. Where a decision is really open (how many minions, which effort, what they get done; the model-testing results), say so and link the past work instead of inventing an answer.
2. **The system shown**: a `System` instance for the AI system (`ext/System`, the class card + live instances) on the `/framework/ai/` page or the Systems tab: its components as cards (Servex, the dev server, MCP servers, models, sessions, cards, skills, the step runner, accounting, transcription, the page system), each one line and a link, computed from the readme's own index where possible. One screen; the `page` skill decides where it sits.
3. **Readme**: `ai/readme.md` gets the one-line overview + the `architecture.md` link at the top; the directives the owner named go there as one line each only if they are not already in CLAUDE.md (do not restate CLAUDE.md; link it).
4. Report on your card: the decision count, the component count, the links, a 1200 screenshot.

Fence: `public/framework/ai/doc/architecture.md`, `public/framework/ai/readme.md` (top lines), the AI system page/tab component (new file under `public/framework/ai/`), this task dir. Worktree, four widths, `merge.mjs`. Stay out of `ai/doc/repo-size.md`, `follow-up*.md`, `asks-outcomes*.md` (sibling tasks). Sonnet; a Haiku minion for the census.
