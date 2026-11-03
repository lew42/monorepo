# prune-claude-md

## Ask (verbatim)

> spawn 3 opus minions, and ask them to analyze claude.md, .claude/instructions-audit.md, and give their feedback.  instruct them that less is more, and anything that's not absolutely necessary should be pruned.  they should rank their suggestions by priority, starting with the simplest and most important.
>
> after they answer, read the files yourself, and prune anything that's unnecessary.  we don't want more unnecessary instructions, so don't get carried away here.  we don't want to remove anything that's important.

## Scope

- Files in play: `CLAUDE.md`, `.claude/instructions-audit.md`. Nothing else changes.
- Reviewers are read-only; only the orchestrating session edits.
- Bias: conservative. Prune what's clearly unnecessary; keep everything load-bearing (constraints, traps, working agreements that earned their firmness).

## Steps

1. Spawn 3 independent opus reviewers (read-only, ranked prune lists)
2. Open task
3. Read both files myself
4. Collect reviewer findings
5. Decide the prune list — intersection of reviewer consensus and my own read
6. Apply edits
7. Verify + land
