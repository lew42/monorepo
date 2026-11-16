# Live board in Figma (brief)

Owner request relayed by voice-app, 2026-11-16. Budget: $12. Do the job yourself (no sub-agents). Never wait on anyone; decide, note the alternative. Don't write the owner's name into any file or the Figma file.

## What

A **"Live" page** in the file **Claude November 2026** (`woCZQDoXKJW3GcJPZukW7f`) that turns the owner's dictation into a visual summary while we talk. Later updates must be short `use_figma` calls (add a card, add a note, mark a decision), not regenerations.

1. **Look first** for an earlier Live page / approach (the Nov 12-13 work): read `public/framework/ai/sessions/2026/11/12/spawned/mastermind-figma-live-page/session.jsonl` and the `mastermind-figma-live` task under `2026/11/10/spawned/`, then `public/framework/ext/Figma/readme.md` (page layout, modes, component strategy). Look in the Claude November file for an existing page named like "Live" (read-only listing). Reuse what exists; extend rather than rebuild. Say in your log what you found.
2. **Shell:** one **2600-wide** root frame (auto layout), the three-column shell from `Explore – 2600 layouts` in Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`, node `34:475`, section 3 and 6; read-only: look at how its sidebars and centre card are built, with `get_metadata`/one screenshot, then rebuild the same shape in the Claude file; you can't import across files unless it is a library, so recreate):
   - **Left sidebar:** the list of topics (one row per topic, the current one highlighted).
   - **Centre:** the current topic's main ideas as **headed cards with short bullets**.
   - **Right sidebar:** side notes and details, tucked away.
   - Mark **decisions vs open questions visibly** (a clear different look and an icon or word, never colour alone).
3. **Reusable components** (real components, a component set where there are variants, masters at the root of the Live page, left of the board): **Topic card**, **Note**, **Decision**, **Question**, plus a **Topic row** for the left list. Text fields as component text properties where possible so an update just sets the text. Auto layout everywhere, Latest layout version if the API lets you set it, Inter, short and long text test. Use the Claude November file's own variables/styles if it has any (read-only check); otherwise hardcode colours and say so.
4. **Seed it with today's session** (topics, each with a few cards/bullets, decisions vs open questions; keep every bullet short and plain):
   - the Scale rethink (seven modes multiply every edit; layouts should work 0.5x to 2x; modes as a stand-in for container-query units; maybe fewer modes; undecided)
   - color permutations (nested schemes, WCAG: white on Prime is 2.59 and fails; button text passes only on Prime)
   - fixed / hug / fill and the CSS equivalent
   - Latest layout version (use Latest everywhere; matches CSS border-box; equal splits: grid flow + fr)
   - layer naming (sizing in parentheses, trial on one page)
   - layout components (lean: a minimal set of building blocks, not pre-built 2/3/4-column permutations; open)
   - the rules: masters at the page root; no duplicate content between a page's preview and its content; every page self-documenting
   - structure idea: one page per space (Layout, Text, Scale, Color, Navigation), a 1920 auto-height preview each, gathered on the root DS page
   - this Live board itself
   Source for the wording: `public/framework/ext/Figma/doc/design-system-notes.md` (read it; its thoughts are open thinking, mark them as open questions, not decisions).
5. **Don't mirror it into markdown.** The only file you write is a short `public/framework/ext/Figma/doc/live-board.md` (what the page is, the component names and node ids, and the recipe for the update calls: a copy-paste `use_figma` snippet to add a topic, a card, a note, a decision, a question), linked from `public/framework/ext/Figma/readme.md` (one Docs line). Commit by exact path; never push. Another agent also edits that readme: re-read it right before your edit and change only your line.

## Hard rules

`create_session` for the file first and reuse the sessionId; skills `figma-use` + `figma-generate-design` in `skillNames`; own page "Live" only; don't touch other pages or the Lew42 v2/Big Sloppy files (read-only); ~8 screenshots max (shared account budget); return node ids; never destructive.

## Report (final message to `mastermind-figma`, one screen)

Page link (`https://www.figma.com/design/woCZQDoXKJW3GcJPZukW7f?node-id=<id with - >`), what you reused from the earlier Live page, the component names with ids, the update recipe in 3 lines, what you could not do, est. cost.
