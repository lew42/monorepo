# jsonl — the ask (verbatim, 2026-08-14)

> here's what i'm thinking: i want each framework/ai/<date>/ directory to have
> its own day.jsonl, where the ai can blindly write new data. and i think each
> <date>/<task>/session.json should rename to task.jsonl.
>
> i think we'll lean into jsonl, so let's create an ext/JSONL class that has a
> reasonable default mode for assembling logs back into object state. maybe
> { assign: {...}, log: {...}, action: {...} }?. we might need to extend the
> class, in order to customize that behavior, to make a TaskJSONL class for
> handling task logs, DayJSONL, maybe even a PageJSONL? Also, I've thought in
> the past, that a dual `json + jsonl` system might be useful: you condense the
> `jsonl` into a `json` snapshot, but have the heavier log file if you want to
> see all the data. skip the dual mode for now, just get jsonl working.
>
> we want claude code to utilize these log files for most of their actions.
> instead of responding here in the session window, you write to the proper
> .jsonl files, creating a browsable log of everything you do.
>
> from there, we'll work on the AISession page. create a new task for the JSONL
> part.

## Scope

- `ext/JSONL` — the class (JSONL + TaskJSONL), readme, page, ext registry line.
- `task.jsonl` / `day.jsonl` conventions, dogfooded by this task itself.
- Minimal wiring so the existing dashboard/AISession viewer reads `task.jsonl`
  (falling back to `session.json`) — full AISession redesign is a LATER task.
- Skipped by request: the dual json+jsonl snapshot mode. Deferred: DayJSONL /
  PageJSONL subclasses until a renderer needs them.
