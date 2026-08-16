Every entry `apply()` couldn't dispatch — a key not in `this.constructor.verbs` — held here rather than silently dropped, alongside a `console.warn`. The whole point: a typo'd verb, or a `TaskJSONL` verb forgotten from an override's `static verbs` list, stays *visible* in the assembled object instead of vanishing without a trace.

Nothing on this site reads `.skipped` back out today — it exists for a human or an AI checking a log by hand, not for a renderer.
