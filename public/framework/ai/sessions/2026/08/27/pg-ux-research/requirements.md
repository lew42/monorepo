# pg-ux-research — ui-test refinement + the compaction/insertion proposal

**The three laws:** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** proposal ≤ 2 screens, report ≤ half a screen. Working notes go in YOUR `task.jsonl` as `log` lines.

## The ask (owner, condensed — full text in `../playground-mastermind/requirements.md`)

> spawn some researchers to use the ui-test skill, and try to refine it, until we get some usable feedback. figure out how to compact this ext/Playground, to make it simpler, more intuitive. let's focus on exploring layout — any layout, in as few clicks as possible. … for these edge resizers, make them clickable, and have a small + icon button appear. this way, for any edge, we can click it, and then add an item. we want to be able to add anything (a row, column, child, sibling, section, whatever), where ever we want, simply by hovering. … i don't feel like this helps me learn flex or grid.

You are the researcher. A sibling agent (`pg-interactions`) is EDITING `canvas.js`/`playground.css`/`Playground.js` right now — so:
**do step 1 immediately, before anything else** (baseline, while the tree is still pre-edit), then work from code-reading and your own fixtures, not from re-measuring the module mid-edit.

## Deliverables, in priority order

1. **Baseline jank sweep — run this first, within minutes of starting.** Generalize the mastermind's probe (`<scratchpad>/pgmm-jank-probe.json`, output beside it — hovering root grew `.pg-viewport` +74px): a drive.mjs plan that hovers EVERY `.pg-node` in a 3-level doc and diffs every rect. Park the numbers + plan in your task dir. This is the before-picture wave 3 will re-run.
2. **Click-count audit.** For five canonical layouts — holy grail; header/content/footer; sidebar + content; 3-across card row; 2×3 card grid — count the gestures the CURRENT ui needs (from code: `toolbar.js` `+` = Box, Shift-click = Flex, Grid = add then sidebar type toggle — 2 gestures, `readme.md:24` admits it; direction/wrap/justify = sidebar segs, `properties.js`). A table: layout → gesture list → count. Then the same table under your proposed model.
3. **The proposal** (`proposal.md` in your task dir): the compacted interaction model. Must cover:
   - **Edge inserters**: the owner's sketch — hover an edge (selected+hover), a small `+` icon appears, click → insert there. Where can what be inserted (child / sibling-before / sibling-after / wrap-into-row / wrap-into-column / section)? What does each edge mean (top/bottom/left/right × inside/outside)? Keep the answer SMALL — the owner wants fewer concepts, not more chrome. If two edge meanings can collapse into one, collapse them.
   - **Fewer clicks to any layout**: e.g. should `+` on a row-context edge mint a sibling directly? Should the first child added to a Box auto-suggest direction? Should Grid be one gesture? Justify each against the click table.
   - **Learnability** ("this doesn't help me learn flex or grid"): the smallest change that makes the tool TEACH — e.g. the readout naming the property a drag just changed, or direction/justify flipped inline on the canvas. One or two ideas max, sketched concretely.
   - What to DELETE. The tool has 11 toolbar buttons, a tree, and a 7+-field sidebar. The owner asked to "compact". Name what goes.
4. **ui-test skill refinement.** You will lean on `hover`, coordinate moves, and rect-diffing. Where the skill or `drive.mjs` fights you (e.g. does `watch` track ALL matches of a selector or the first? is there a one-liner for "diff all rects across a step"?), append concrete evidence lines to `.claude/skills/ui-test/improvements.md` via the `skill-improvement` skill. You may NOT edit `drive.mjs` itself — a wanted feature is an improvements.md line with the use-case.

## Method

- ui-test skill (`drive.mjs`), headless only. **Own document discipline**: first step —
  `eval import('/framework/ext/Playground/page.js').then(m => (window.pg = m.default.tool).swap('pgmm-ux').then(() => window.pg.slug))`
  (verified recipe; one console 404 on first swap is by-design). Build fixtures via `eval` on `window.pg` (`add_to`/`convert`/`selected_item().set(...)`). NEVER gesture on `untitled` or any owner doc; end plans with `eval window.pg.delete_current()`.
- Known traps (skill's own list): ancestor-`:hover`-revealed elements refuse `click` — hover ancestor then coordinate `move/down/up`, aim leaf-shallow; quote selectors containing spaces; hidden tabs don't lay out (irrelevant headless — drive.mjs tabs are visible to themselves).
- Fence: READ-ONLY on `public/framework/ext/Playground/` and everything else under `public/` except your own task dir `public/framework/ai/2026-08-27/pg-ux-research/`. Writable: that dir, `.claude/skills/ui-test/improvements.md`, scratchpad (prefix `pgux-`).
- Never kill or restart the dev server; never drive the owner's live tabs; never `git stash`; never commit.
- Task dir exists with this brief — open `task.jsonl` per the `new-task` skill (skip dir creation; `group: "web-ui"`).
- Ask for two numbers that must agree: your click table's "current" column re-counted by actually DRIVING one of the five layouts end-to-end (screenshot the finished layout) — the driven count must equal the counted count, or the table is wrong.
- Land with `finish-task`. Blocked twice on one item → park it with a log line.
