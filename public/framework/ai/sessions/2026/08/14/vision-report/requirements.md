# vision-report — requirements

Final leg of the vision-model comparison (verbatim ask in
`../vision-sonnet/requirements.md`): "create another task dir to write a
report on the findings. how does screenshot analysis vary between models, in
terms of token cost, accuracy/quality of findings, etc?"

## Inputs

- `../vision-sonnet/layout-analysis.json` (claude-sonnet-5, session that also
  captured the shots)
- `../vision-haiku-opus/layout-analysis-haiku.json` (claude-haiku-4-5)
- `../vision-haiku-opus/layout-analysis-opus.json` (claude-opus-5)

## Deliverable

`report.md` here: cost per image and per run (with the four-way usage split —
a bare token sum misleads, cache reads cost ~0.1x input), quality/accuracy
comparison of the findings, and method caveats (Sonnet's session carried
capture-phase context; Haiku/Opus started cold; the judge has not seen the
images and triangulates from cross-model agreement plus knowledge of the
pages' code).

Written by the orchestrator (Fable) — synthesis over three JSON files, no
image reading.
