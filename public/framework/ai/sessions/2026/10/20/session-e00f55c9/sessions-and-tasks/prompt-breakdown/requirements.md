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

## Part 2 (the owner, 2026-10-24, the prompt after "Prompt extends Task")

6. **A map of every prompt-refinement mechanism** (`ai/doc/prompt-refinement-map.md`, linked from the ai readme). There are several. List each one:
   - what it is and when it runs (the VS Code hook, live; Whisper dictation; the voice agent; the retroactive backfill; `refine.mjs` briefs);
   - its model, and where it writes.
   Make each one's role and how it differs from the others unmistakable, and flag any overlap to merge.
7. **Pick the model by the job.**
   - Live refinement of the owner's prompts in this tab could use Sonnet, for a better breakdown.
   - Retroactive passes over days of logs stay on Haiku.
   - Compare Sonnet and Haiku on the same 5–10 real prompts (coverage, missed asks, merged asks) and recommend one with the numbers.
8. **Keep the hook.** It's the one writer (decided with the owner). Its output becomes Prompt instances in `session.tasks` (session-is-a-task, item 21, the deputy's). Write that flow into the map.

9. **(the owner, 2026-10-24) The vscode-mastermind role readme must teach a new sidebar tab the hook.**
   - The hook exists, and this is how it works.
   - Follow (`follow`) the session's `prompts.jsonl`.
   - After each prompt, compare the raw sentences with the tasks Haiku made; fix names, add what it missed, and embellish where the detail matters.
   - The refined tasks render at once on the session detail page.

10. **(the owner, 2026-10-24) Refinement groups its tasks.** 241 flat tasks from one session is unusable. When a prompt's asks belong together, refinement makes one parent task (the outcome) with the asks nested as its subtasks, or files them under an existing open task they belong to. Measure the root-level task count before and after on e00f55c9.

11. **(the owner, 2026-10-24) Refinement is a small set of guiding principles.** Who runs it (Haiku, Sonnet, the tab) matters less than doing it properly.
    - Each prompt becomes tasks, questions, rules and observations.
    - The cleaned sentences also get light formatting. A spoken "Claude exe" becomes `claude.exe`, and spoken references are upgraded to real names and links where they're clear.
    - Write the principles as one short doc that `PARTS_BRIEF` is built from.
    - Today it's one Agent SDK call per prompt (`PromptRecords.ask`), never resumed, with no context of earlier prompts and no tools. Say whether the previous prompt's breakdown should be passed in as context.
12. **Let the tab see the breakdown the moment it lands.** Today the tab only reads `prompts.jsonl` when it checks, so it doesn't review in real time. Try it small: the `UserPromptSubmit` hook (or the next prompt's hook) adds the latest finished breakdown to the tab's context, so the tab can fix it with the item tool straight away. The hook's 15 s limit may be too short for the current prompt, so the previous one is fine. Measure how often it arrives in time.

13. **(the owner, 2026-10-24)**
    - **Context:** a refiner with no memory of the earlier prompts may be a mistake. Test passing the session's recent breakdowns in.
    - **One agent may beat a hook plus Haiku.** The owner leans toward one agent doing the refinement and the managing, if the coordination keeps failing. Weigh it in the refinement map.
    - **`follow` skips your own writes.** A follower shouldn't get echoes of lines it wrote itself (match on `by`), only other agents' lines. Do it in Servex's follow.
    - **A VS Code tab can't receive follow messages,** so for the tab use the hook route (item 12).
