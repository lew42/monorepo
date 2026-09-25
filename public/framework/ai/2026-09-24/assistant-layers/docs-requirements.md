# Minion brief: document the assistant layers in Servex/agents

Load the `minion` skill first, then `documentation`.

## The owner's words

"If Servex starts all three by default and we get a solid system where they communicate effectively, they need to use their own identifier when talking, so it's clear whether it's me or one of them, and who."

And the house rule (CLAUDE.md): a readme is the reader's index, mostly pointers; the detail lives in `doc/*.md`, one topic each. Plain, full sentences for a new coder; no jargon standing in for an explanation.

## Where you work

Worktree `C:/Code/lew42/worktrees/assistant-layers`, branch `worktree/assistant-layers`. Another minion is editing `Servex/Servex.js`, `Servex/agents/Layers.js`, `Assistant.js`, `roles.js` and `layers-proof.mjs` there right now: never touch those. Commit only your files (`git add <path>`), attribution `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

## Read first

`C:/Code/lew42/monorepo/public/framework/ai/2026-09-24/assistant-layers/doc/design.md` (the design), then in the worktree: `Servex/agents/readme.md`, `Layers.js`, `Global.js`, `policy.js`, `claims.js`, `brief.js`, `tiers.js`, `card-assistant.md`, `master-assistant.md`, `mastermind-servex.md`.

## Deliverables

1. **`Servex/agents/doc/layers.md`**: how the layers work, from the code, not from the design alone (where they differ, the code wins, and you name the difference in your report). Sections: the four agents and their ids; a card's life (first words, idle stop, resume, compact, recycle); who may message and spawn whom (the table, from `policy.rules()`); claims; the one-screen brief; tiers (the one place a tier becomes a model); memory (idle stop, reaper, admission check, the env vars and their defaults). A table of every env var the new files read.
2. **`Servex/agents/readme.md`**: replace the section "The fast assistant — the one agent that is always up" and add to "Files" so the readme points at the new layers: three to six lines saying each card has its own assistant and manager, a master assistant and mastermind-servex watch across cards, `send_to_agent`/`spawn_agent` check `policy.js`, and a link to `doc/layers.md`. Keep `assistant-fast` described in one line as the lobby for words spoken with no card. Do not rewrite other sections.

## Done means

Committed. Last words: the commit hash, and each place the code differs from the design. Length: layers.md under about 150 lines. Never write the owner's name.
