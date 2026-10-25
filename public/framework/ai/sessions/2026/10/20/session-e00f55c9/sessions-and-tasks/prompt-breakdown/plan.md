# Prompt breakdown: the plan (outcomes for every part, the tab's routine, the chat view)

For the brief [requirements.md](requirements.md). Picture of the chat view the owner is asked to look at: [chat-view-mockup.html](chat-view-mockup.html) (built from the real breakdown of prompt `76cbf230`, this session's last long dictation).

## 1. The wording (done)

`Server/PromptRecords.mjs` `PARTS_BRIEF` no longer says "1 to 3 main asks": it asks for every ask the prompt holds, never two merged into one, and the owner's own words quoted where a degree or qualifier matters. The splitter loads that file once per Servex process (`PromptTasks.js` imports it on first use), so **Servex needs a restart** before a new prompt is split with the new wording. Prompts already split keep their old breakdown.

## 2. An outcome for every part

### The finding that shrinks the job

The brief counts 1,849 open parts. Measured from every `prompts.jsonl`: about **1,694 of them (90%) are nested details** of a main part (an ask's own suggestions, numbers and sub-questions). `Prompt.js` completion already ignores them. About **195 top-level parts** are the real open work: 67 rules, 63 questions, 39 ideas, 26 asks. Resolving 195 is a morning's work; resolving 1,849 is not needed.

### The outcome each kind gets

| Kind | Outcome | `outcome.is` | `ref` |
|---|---|---|---|
| ask | an open task on the session (idle, never "waiting on the owner") | `task` | the task's folder |
| question | answered in the tab's reply, with the link to where | `answered` | the doc or page that answers it |
| rule | written into the doc it concerns (CLAUDE.md, a module readme, a role) | `documented` | that doc |
| idea | one line in its module's doc ("Ideas" or open-options), or dropped | `documented` or `no-action` | the doc |
| conversation | nothing | `no-action` | |
| nested detail | settles with its parent: computed from the parent, never stored | | |

### How the 195 get resolved

1. **Nested parts settle with their parent** (a change in `Prompt.js`, computed: no 1,694 writes).
2. **Run the existing `outcomes` step** (the `review` process in `PromptRecords.mjs`, Haiku, about $8.4 per tab-worth of prompts) over the top-level parts. The live process never runs it, which is why nothing is ever settled today.
3. **Rules and ideas the step finds no home for** go to a single report: a small `--open` listing for `Server/PromptRecords.mjs` (to build) shows them by module; one Sonnet minion per module writes the doc line and the `documented` outcome. Questions already answered in a reply are marked `answered` with the transcript line.
4. **Start with this session** (`e00f55c9`): about 50 top-level parts. Then the other sessions, newest first, as budget allows. Nothing stops the live pipeline meanwhile.

## 3. The tab's per-prompt routine

Written into [vscode-mastermind.md](/Servex/agents/roles/vscode-mastermind.md) ("Each owner prompt"). Short form: read the breakdown; fix titles with the item tool; take the splitter's asks (no tasks of its own); answer questions in the reply; mark each part's outcome.

## 4. The chat view

Look at [chat-view-mockup.html](chat-view-mockup.html) first.

- **Where:** the session page's existing `?tab=coverage` (`AISessionCoverage.js`, `records_view`). It already draws one row per prompt with each part, its outcome, `S` cites and the raw prompt. The chat view is that component re-dressed, not a second one (law 6).
- **A bubble per prompt:** the owner's words are the bubble; its heading is `subject`, the AI-written line the splitter already stores.
- **Context cards inside the bubble:** one per top-level part (task, question, rule, idea). The card wears the icon and name of the module or page it concerns (`part.module`, already in the brief; the icon from the module readme's `icon:`). Past work on "context cards" (2026-10-02 inspect and 2026-10-03 now-card sessions) names the same shape: a small card wrapped around its subject; the new piece is only the module wrapper.
- **Cites:** each card shows `S4, S7–18` (ranges collapsed); clicking shows those raw sentences in the bubble, highlighted (`show_raw` does this today).
- **Coverage score per prompt:** `Prompt.js` computes `uncovered`, so score = cited sentences ÷ all sentences. Shown in the bubble's corner.
- **Shared with the deputy:** the deputy owns the session page. Proposal sent to it: the Coverage tab becomes the chat view in this one class; no second renderer. Nothing is built until the owner has seen the picture.

## 5. Not for now

The voice-tab split is recorded as an open option in [role-process-skill-session.md](/framework/ai/doc/role-process-skill-session.md), no build.

## 6. Built (2026-10-25) and the tab's two review findings

- **Built:** the Coverage tab is the chat view (`AISessionCoverage.records_view`): a bubble per prompt with its coverage score, a card per top-level part wearing its module (a per-kind glyph and the module name; the module's own `icon:` is not looked up yet), the outcome tag, the cites (`S4, S7–9`) that show those raw sentences highlighted, and the nested details as a count. Seen headless on four real prompts of session e00f55c9.
- **Bare follow-ups** ("Make sure that's noted", "Look into it") attach to the part they refer to: a line in `PARTS_BRIEF`. It takes effect after a Servex restart, and only for prompts broken down from then on.
- **Questions, rules and ideas stay "open":** only the `review` process runs the outcomes step. Resolution order: nested parts settle with their parent (computed); run the outcomes step over the ~195 top-level open parts, not the 1,849 (about 90% are nested detail); list what is left per module and settle rules and ideas as notes in that module's doc. Start with session e00f55c9. Not built yet.
