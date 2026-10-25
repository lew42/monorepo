# Prompt breakdown: every sentence cited, every part resolved, a chat view to click through

For `ai-system-mastermind`, after session-is-a-task items 18–19. Plan first, with a picture for the owner, then build. The owner's words are in the prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl` (2026-10-24, the prompt starting "Okay, so the automatic hook…"). It's broken down in this session's `prompts.jsonl` (prompt `76cbf230…`).

## Where it stands (measured by the tab from `prompts.jsonl`)

The pipeline already does most of what the owner described:
- The hook (`prompt-relay.mjs`) saves each prompt raw.
- The prompt is cleaned into an array of numbered sentences.
- One Haiku call splits it into parts (`a1`, `a2`, …). Each part has a kind (ask, question, rule, idea, conversation), its own text, nested sub-parts, and `cites`: the sentence numbers it covers.
- **Sentence coverage is 100% on every one of the last 12 prompts.**
- **The gap is in what happens to the parts.** Across all prompts, 1,849 parts have no outcome (`open`). Only asks become tasks (174), so questions, rules and ideas never land anywhere.

## The owner's ask

1. **Loosen the brief.** `Server/PromptRecords.mjs:50` says "a long prompt usually has 1 to 3 MAIN asks", which squeezes out detail.
   - New wording: as many asks as the prompt really holds, and never two asks merged into one.
   - Where the owner's exact words carry a degree or a qualifier, or are unclear, quote them as the owner's words, so later agents can go back to the source.
   - "Better safe than sorry: include everything."
   - Say whether the change needs a Servex restart.
2. **Every part gets an outcome:**
   - an ask becomes a task (open work for the session, never "waiting on owner");
   - a question is answered, with a link to where;
   - a rule is written into the doc it concerns, with a link;
   - an idea is noted in its module's doc;
   - conversation needs no action.
   Propose how the 1,849 open parts get resolved, starting with this session's.
3. **The tab's routine** (write it in `Servex/agents/roles/vscode-mastermind.md`). After each owner prompt, the tab:
   - reads Haiku's breakdown and fixes titles or wording with the item tool;
   - takes the asks: starts the splitter's task and hands it off;
   - answers the questions in its reply;
   - marks each part's outcome.
   No duplicate tasks (one writer: the session-closeout agent is changing the splitter).
4. **A chat view on the session page.**
   - One bubble per prompt, under a heading the AI writes.
   - Inside each bubble, that prompt's tasks, questions and notes as **context cards**: the icon and name of the module or page each one concerns, wrapped around it. Run past-work on "context cards" first; there is prior work.
   - Each card cites its sentences (S4, S7–18), and clicking it shows those sentences of the raw prompt.
   - Each prompt shows its coverage score, computed from the cites.
   - The session page may already have a coverage tab (`?tab=coverage`). Extend what exists, and agree one component with the deputy, who owns the session page.
5. **Note only, no build: the owner is weighing a split.** The VS Code tab would become a lighter voice agent that forwards each prompt to an SDK mastermind.
   - For it: all agents on one system, local tools, and dictation from the phone.
   - Against it: two contexts, and the work of coordinating the roles.
   - Record it as an open option in `ai/doc/role-process-skill-session.md`.

## Done when

- [ ] The brief wording is loosened (and Servex restarted if needed, said in the outcome).
- [ ] The outcome rules and the tab's routine are written.
- [ ] The chat-view plan has a picture, and the owner has seen it.
- [ ] The task is completed with its outcome and links.
