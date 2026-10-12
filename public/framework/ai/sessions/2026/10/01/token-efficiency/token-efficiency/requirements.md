# Tokens: where this week's usage went, and how to spend less: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md).

**The problem:** the new week burned 11% in its first 3.5 hours, about 5× too fast (target: weekly used% ≤ elapsed%). The owner wants the same progress for far fewer tokens.

## Asks (analysis first, cheap; NO building in this task)
1. **Where the tokens went.** For the last 7 days, rank the spend by agent, role, model and task. Sources: every task's `spend.json` and `task.jsonl` `cost` lines, the Servex registry and session logs. Find the top 10 sinks. Name the patterns, for example:
   - Opus doing Sonnet-sized work;
   - Fable (the architect) on long turns;
   - minions re-reading the same big files;
   - masterminds reviving with full contexts;
   - review rounds;
   - fan-outs;
   - agents sitting at about 190k context;
   - briefs pasted into prompts instead of passed as paths.
2. **The ten cheapest wins,** ranked by tokens saved per change. Each one names the exact file or skill to change. Examples to check:
   - the default model per role (Sonnet for minions, Haiku for scans);
   - a context cap with recycle-from-checkpoint before 150k;
   - spawning by `task: {dir, brief}` with a one-line prompt;
   - prompt caching;
   - smaller readme chains;
   - fewer review rounds on small changes;
   - batching heartbeats.
3. **A weekly pace that holds:** a concrete rule Servex can enforce. For example, a daily token budget per role, with spawns queued when the week is over pace. That builds on the working cap of 5 and the dormant system.

## Rules
- Read-only analysis. Write one report, `report.md`, one screen, as a ranked table, then stop. @vscode-mastermind turns the winners into changes through the architect.
- Model: Sonnet, low effort, no minions. Budget: small. This task must not itself be a token sink.

