Empty by default — the one method that exists purely to be overridden. Runs
between `checklist()` and `figures()`, so a task's own content sits above the
spend tables and the session log rather than pushed below everything.

Every task with a genuinely custom detail page — [`panel`](/framework/ai/2026-08-13/panel/),
[`sessions`](/framework/ai/2026-08-13/sessions/),
[`editor-panel-review`](/framework/ai/2026-08-14/editor-panel-review/) —
fills only this one method and inherits the rest of `report()` unchanged.
