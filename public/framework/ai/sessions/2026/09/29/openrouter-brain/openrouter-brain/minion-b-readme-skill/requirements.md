# Minion B — readme.md (the iceberg), the skill, decisions/ stub

Task dir (read the whole conversation there, not just this file):
`public/framework/ai/2026-09-29/openrouter-brain/`

Load the `minion` skill first, and the `content` skill before writing any of the prose below —
this readme is read by both a fresh AI mastermind and the owner, and it must fit one screen.

## Why

We're building `Servex/ext/openrouter/`, a folder a fresh "openrouter" mastermind reads to
become the expert on our OpenRouter/harness system. You own its front door (`readme.md`), the
skill that points to it, and a stub for the not-yet-built decisions log.

Read first, for the content:
- `public/framework/ai/2026-09-28/harness-research/plan.md` (the build order, six steps)
- `public/framework/ai/2026-09-28/harness-research/architect-review.md` (the corrections)
- `public/framework/research/harness/research.jsonl` lines 1–8 (the eight original questions) and
  the last three `{"verdict"...}`/`{"assign":{"status":"closed",...}}` lines (the closing summary
  — read the end of the file, not just the start)

A sibling minion is building `Servex/ext/openrouter/snapshot.md` (the condensed, cited
conclusions) at the same time — your readme.md links to it, it does not repeat it.

## 1. `Servex/ext/openrouter/readme.md` — the iceberg

Shape, in this order:

1. **5–7 core concepts**, each named simply as a short noun phrase (the brief's own examples:
   *Proxy route*, *Provider field*, *Proxied cost*, *Restart env*, *Own loop* — use these or
   better ones you find in the research, but keep them this concrete and this short). Each one
   gets exactly one plain sentence plus a link down (to `snapshot.md`, to a specific research
   node id, or to the relevant file in the repo — e.g. `Servex/agents/tiers.js`). Suggested
   concepts from the research: the **proxy route** (Claude Agent SDK against OpenRouter via
   `ANTHROPIC_BASE_URL`), the **provider field** (`tiers.js`'s unused per-tier provider), **cost
   arrives free** (OpenRouter's `usage.cost` vs. the SDK's wrong Anthropic-priced guess), the
   **subscription boundary** (Claude stays on the subscription; per-token Claude elsewhere could
   cost far more), the **fence gap** (fences are prose today; a PreToolUse hook is the fix), and
   **cross-family review** (a different model family reviews, before fleets).
2. **"What's here"** — one line per subfolder: `snapshot.md`, `sources/`, `decisions/`.
3. **"Open questions"**, ranked — pull these from the research's `unknown`-credence nodes (e.g.
   does a non-Claude model finish a real brief through the proxy at merge quality; does opencode's
   compaction actually fit; does mixed-family review catch more real defects on OUR tasks).

One screen. This is Level 1 (see CLAUDE.md's Presentation law): show the shape, not the essay —
each concept is a sentence, not a paragraph.

## 2. `.claude/skills/openrouter/SKILL.md`

A few lines only:

```
---
name: openrouter
description: <one line: when to load this — starting the OpenRouter/harness work, a question about proxying models, the provider field, cross-family review, or the model switcher>
---

You are the OpenRouter mastermind. Read Servex/ext/openrouter/readme.md, then only the readme
below it that your question needs.
```

Match this repo's actual skill frontmatter shape — look at an existing short skill (e.g.
`.claude/skills/fans/SKILL.md` or `.claude/skills/check-claude-usage/SKILL.md`) for the exact
format before you write this one.

## 3. `Servex/ext/openrouter/decisions/readme.md`

Empty for now (the brief: "the decide-tool task writes it later"). One short readme: what this
folder will hold (decisions made while building the harness — model, log format TBD by that
task) and that it's empty on purpose. A sentence or two, not a spec.

## Log as you go

Append to the task's `task.jsonl` as you finish each piece. Don't run `finish-task` — the
mastermind lands this task as a whole.

## Fence

Only: `Servex/ext/openrouter/readme.md`, `Servex/ext/openrouter/decisions/readme.md`,
`.claude/skills/openrouter/SKILL.md`. Main tree, no worktree. Model: Sonnet, medium effort.

