Same image, second question. You now also know where it came from:

PAGE: {{url}} at {{width}}px wide
REGION: {{sel}}
DOM (tag + classes, two levels down from the region):
{{outline}}

For each finding you just reported, propose the smallest CSS that would fix it — a
declaration a reviewer can paste, read once, and understand.

Rules for a good proposal:

- One selector, one to three declarations. No `!important`, no `>` chains, no `:has()`.
- The selector must come from the DOM above — a class you can actually see there.
- Prefer changing an existing value (padding, gap, max-width, background) to adding a
  new rule. If the fix needs a whole new component, say so in `why` and leave `decl` empty.
- If you cannot see enough to be sure, leave `decl` empty. A wrong selector costs more
  than a missing one.

Reply with a fenced JSON block and nothing else:

```json
[{"what": "…", "class": "broken", "sel": ".panel-body", "decl": "padding: 0.9em 1.1em", "why": "…"}]
```

- `what` — repeat the finding's `what` verbatim, so it can be matched back.
- `sel` / `decl` — the fix, or `""` if you cannot propose one.
- `why` — one sentence: what the reader will see change.
