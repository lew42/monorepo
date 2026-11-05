# What defines a mastermind today?

Expected cost: under $1. Haiku. Follow [findings-method.md](../findings-method.md).

The owner's question: there should be one source of truth for the mastermind, and they don't know whether the skill is current or old.

1. List every place that tells a mastermind how to behave. Start with `Servex/agents/roles.js`, `Servex/agents/roles/mastermind.md`, `.claude/skills/mastermind/`, `servex-mastermind/`, `sub-mastermind/`, `CLAUDE.md`, [agent-rules.md](/framework/ai/doc/agent-rules.md), then search for more. For each: last commit date, line count.
2. Which of these does a spawned mastermind actually receive? Trace it in code (`spawn_agent` in Servex, `role: "mastermind"`) and quote the lines. Which does a VS Code tab receive?
3. Where do they contradict each other, or name something that no longer exists (a tool, a file, a retired role)? Check each named thing exists, by script.
4. The same for a minion, more briefly. The owner's distinction: a minion looks into something quickly and doesn't need to know how to spawn; a mastermind does.

End with a recommendation: which one file should be the source of truth, and which others become pointers or go.
