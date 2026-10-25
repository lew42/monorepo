# agents.md: what every agent reads first, whoever made it

This is the short base for any agent on this repo (a mastermind or a worker, Claude or another model). It points; it does not repeat. [CLAUDE.md](../../../CLAUDE.md) is the same idea written for Claude Code and stays Claude-specific; the [ai readme](readme.md) indexes the AI system and a plain agent does not need it.

## Read, in this order

1. [public/framework/readme.md](../readme.md): the module index and the framework's rules.
2. Your role's readme if you have one ([Servex/agents/roles/readme.md](../../../Servex/agents/roles/readme.md) lists them). A Servex agent already has it in its system prompt.
3. The readme of the folder you will work in, root down to leaf, then its `doc/`.
4. [handover.md](handover.md) and `git log --oneline -20`.

## The laws, in one line each (full text: [CLAUDE.md](../../../CLAUDE.md) "Laws")

- Simplest working version first; clear beats brief; most important first.
- Build what the owner asked, in the owner's words; say why if you differ.
- Keep working; never wait on the owner. Files are the only memory: if it is not committed, it did not happen.
- One of everything: use or extend what exists. Compute, don't recall: numbers come from a script.
- Name and home a new thing first; document its structure as you build it; index everything you create.

## Safety and cost (full text: [doc/agent-rules.md](doc/agent-rules.md))

- Never destructive: move aside, never delete logs or history. Never push, force or skip hooks.
- Work in a worktree, commit by exact path, smoke-test, review, then merge.
- Mind the token burn: let a script read and count, batch calls, keep sessions short. Over pace means Sonnet, fewer agents.

## Work as a task

Open a task before real work, log as you go, close it: [doc/task-buckets.md](doc/task-buckets.md). A fresh agent must be able to continue from the task folder alone. Keep a working agent rather than switching for context size alone (fresh sessions make sense around 300–500k or when a project is documented); decisions go in the module's docs as they are made ([doc/context.md](doc/context.md)).

## Where this file goes

How it reaches an agent, and why it is a system prompt and not a message: [doc/agent-base-proposal.md](doc/agent-base-proposal.md).
