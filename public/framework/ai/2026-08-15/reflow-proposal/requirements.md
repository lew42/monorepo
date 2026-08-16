# reflow-proposal

## The ask

Continuation of Mike's 2026-08-15 autonomy grant. The generated-panels task recorded (Panel readme, Open): *"A translated layout does not reflow. A spec row wraps at 390px; a split does not, at any width — so a `rails` tree at 700px keeps its three columns and the bands inside them squeeze. Faithful at desktop widths only."* The panel system aims to evolve into a robust web editor; how splits behave below desktop widths is a real design decision — this task produces the proposal, not the code.

## Scope

A doc weighing the candidate mechanisms for responsive splits (container-query direction flip and its grip-axis problem; wrap-enabled `.panel-items`; per-breakpoint `dir` data; translator-level choices; or the do-nothing verdict "reflow is the page's job, panels are arranging chrome"), their costs to CSS simplicity, grip/axis code, persistence semantics, and `--panel-hug`. One recommendation with earned weight; open questions for Mike.

## Fences

- **Minion F** (doc-only): writes EXACTLY `public/framework/ai/2026-08-15/reflow-proposal/doc/reflow.md`. No code, no Panel edits, no readme.
- **Orchestrator**: links the doc from the Panel readme's no-reflow Open bullet; landing.
