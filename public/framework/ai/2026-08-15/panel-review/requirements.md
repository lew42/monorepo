# panel-review

## The ask

Continuation of Mike's 2026-08-15 autonomy grant ("keep improving!"). Seven tasks rebuilt ext/Panel today (~15 new or rewritten files); every minion verified its own work in the browser, but nothing has cross-reviewed the day's output as a unit, with fresh eyes, hunting for what self-verification structurally misses. This task is that review: three lenses in parallel, findings adversarially checked, confirmed defects fixed.

## Scope

- **Lens 1 — JS correctness**: `Panel/{workspace,toolbar,grip,properties,generate,random,templates,PanelDrag,Panel}.js` + the editor region changes. Event-listener leaks, capture-trap violations (factory calls after `await`), id-resolution races, WeakMap staleness, pointer-capture edge cases, teardown gaps.
- **Lens 2 — CSS cascade**: `Panel/{panel,toolbar,grip,templates}.css`. Layer discipline (full restatement, every rule layered), token-only color, selector fights (the 0-2-0 theme button rule precedent), `:has()` correctness, container-query safety.
- **Lens 3 — contracts**: code vs docs. The T deck shape, `PANELS` map vs vocabulary, `css:` comments vs reality, readme/doc-file claims vs source (each states measurable facts — spot-check them), fence seams (does `toolbar.js` really import nothing of ext/Panel; is focus really never serialized).
- Findings verified adversarially before any fix; confirmed defects fixed by a fixer minion; stylistic nits recorded, not fixed.

## Fences

- Reviewers: read-only. Fixer: only files a confirmed finding names; readme delta as text if a doc claim was wrong.
- Orchestrator: verify verdicts, dispatch fixer, merge, land.
