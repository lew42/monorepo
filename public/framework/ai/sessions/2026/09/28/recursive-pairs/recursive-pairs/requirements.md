# One recursive agent system: the same pair on every page

The design and the owner's words are on card 2026/09/25/one-recursive-agent-system-the-same-pair. It also folds in card 2026/09/25/fresh-sessions-instead-of-context-drift. Build it after quickfix-worktrees lands, because deliverable 5 uses its `take_worktree()`. Prove every change on a private Servex first, then restart the live one once.

## Deliverables (each ticked in your landing, in the owner's words, with its proof)

1. **One pair per page, recursive.** Layers.js keys by page path. A card is a page, and the root is "/". Each pair is `assistant-<page>` and `mastermind-<page>`. A child pair records its `parent`, the parent page's mastermind, and is spawned by it.
2. **One skill per role, scoped by directory.** The page assistant, including the root one, loads one skill (`every-prompt` merged with card-assistant.md). The page mastermind loads `sub-mastermind`. The scope, meaning the directory, is given in the first message. `roles.js` keeps `master-assistant`, `manager` and `card-assistant` as aliases.
3. **Each agent hears only its role** (see the card's table). Remove the every-card feed from Global.js: the root assistant hears the owner's page-less prompts, plus the landings and blocks of its direct children. Everything else it reads on demand.
4. **Parent and child talk both ways.** policy.js already allows parent ↔ child. Prove it with one child mastermind messaging its parent and the reverse. Also let `mastermind-servex-N` ids count as the mastermind: today they are refused as workers.
5. **Assistants make safe quick edits** in a pooled worktree (`take_worktree()` from quickfix-worktrees), with a smoke test before merging, only for files inside their own directory that no claim covers (`list_claims`). They never edit michael/dev directly.
6. **Fresh, not compacted.** Past each role's threshold (the card's table), Servex asks for one checkpoint line, then restarts the same id fresh from it. Nothing is compacted.
7. **The root assistant runs on Opus** (the owner's words).
8. **A VS Code tab is an agent you can message** (from servex-mastermind-opus, 2026-09-25). The owner expected the tab that made a card to see what they said into it. The master assistant answered that the tab "isn't in the list of agents I can message", and the tab's workaround, a Monitor tailing page.jsonl, expires every 30 minutes. Build three things:
   - [ ] **Register.** `register_session({id, session_id})` from a tab. Servex lists it as `kind: "external"` with an inbox at `logs/inbox/<id>.jsonl`.
   - [ ] **Deliver.** `send_to_agent` to an external id appends one line to its inbox. `create_card` records `by`, so what the owner says into a card goes to its creator's inbox. That creator is the card's mastermind (the root pair's for a card made from a tab).
   - [ ] **Watch.** A few lines in the `servex-mastermind` and `every-prompt` skills: a tab runs one `Monitor` on its inbox with no expiry, re-armed at the start of each turn. Prove it: a message sent into a card reaches the tab's inbox within 2 seconds.

## Added 2026-09-28: the fast-assistant lifecycle (mastermind-servex-3)

The owner (verbatim: `.claude/prompts/2026-09-28.jsonl`, the prompt containing "fast assistance for every new kind of context"): every context (a card, a page, a session) gets its own fast assistant, created only when dictate or chat is used there, cheap when idle, and fresh when recycled.

**Measured 2026-09-28, about 13:30.** Every live Servex agent holds its own claude.exe, idle or not: 13 processes, 3,849 MB in total, 209 to 644 MB each (about 300 MB typical). An idle agent spends no tokens; its cost is memory. Seven idle task masterminds were holding about 2 GB between them.

**The rule to build:**
1. **Created on first use.** The first dictate or chat on a context spawns `assistant-<context>`. Opening a page spawns nothing.
2. **Stopped after 5 idle minutes.** Stopping ends the process (0 MB); the session id stays in the registry. At most 4 fast assistants are live; past that, the least recently used one is stopped.
3. **Resumed or fresh, on the next use.** Resume by session id when its context is under 30k tokens and it was last used within the hour. Otherwise start fresh, from the card's own log. Keeping a process alive doesn't keep the prompt cache warm (the cache runs on time, not on the process), so a resume costs the same as keeping it alive, except for the few seconds a process takes to start. Measure that start time and put it in the doc.
4. **The same reaper for idle task masterminds**, after 15 minutes. Wake on message already exists.

**Proof:** the process count and MB before and after, with 3 contexts dictated to and then left idle for 6 minutes; the start time of a resume and of a fresh start; one recycled assistant whose context begins under 10k.

## Added 2026-09-28: a pair for any page, not only a card (step B of [the design](/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md))

`Layers.record(card)` mints `assistant-<base>` and `manager-<base>` from a card id. Generalize it to any page path, keyed the same way, so the drawer's AI tab on any page talks to that page's own pair. The lifecycle rule above applies to every pair.
