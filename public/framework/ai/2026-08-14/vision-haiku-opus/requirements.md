# vision-haiku-opus — requirements

Second leg of the vision-model comparison (see `../vision-sonnet/requirements.md`
for the verbatim ask): "spawn another new-task, and do the same with haiku and
opus, if possible."

## Scope

Haiku (`claude-haiku-4-5-20251001`) and Opus (`claude-opus-5`) each analyze the
**same 15 screenshots** already captured in `../vision-sonnet/shots/`, one image
per resumed CLI turn, identical prompt, per-turn usage recorded from the CLI
JSON output. Outputs: `layout-analysis-haiku.json` and
`layout-analysis-opus.json` here.

## Decisions

- **Screenshots are reused, not re-taken.** Re-shooting would confound the
  vision comparison (render/timing variance between captures) and waste
  tokens. Consequence: unlike Sonnet, these sessions carry no capture-phase
  context — their first analysis turn starts cold. Incremental per-image
  numbers stay comparable; baseline cache_read differs by design. The report
  must note this.
- Both models run concurrently — separate CLI sessions, no shared state.

## File ownership

- Worker sessions only Read the PNGs; all writes here are the orchestrator's
  (Fable, session f763acf1).
- Driver scripts and raw results live in the session scratchpad.
