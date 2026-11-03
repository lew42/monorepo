# The record shapes

Every record is one JSON line in a log (a `page.jsonl`, a card's `page.jsonl`, or a `task.jsonl`).

```
question  {"question": {"id": "q-…", "ask": "…", "hint": "…"?}}
answer    {"answer":   {"question": "q-…", "text": "…", "at": ISO, "by": "owner"|agent id}}
decision  {"decision": {"id": "d-…", "ask": "…", "options": [{"say": "…", "caveat": "…"}], "why": "…"?}}
chose     {"chose":    {"decision": "d-…", "option": "<say>", "at": ISO, "by": "…"}}
prompt    {"prompt":   {"id": "p-…", "at": ISO, "by": "owner", "raw": "…", "text": "…", "via": "whisper"|"typed", "on": "<card id>", "url": "<page path>"}}
```

- **The latest `answer` / `chose` for an id wins;** earlier lines stay as history.
- **A `prompt` line with the same id merges field by field** — a cleaned `text` arriving later fills in over the raw one.
- **Old task.jsonl decisions** (`{id|title, chose, over|alternative, why}`) are normalized by `Decision.normalize()`: options are `chose` plus `over`, `chose` is pre-selected, `why` sits under it.
