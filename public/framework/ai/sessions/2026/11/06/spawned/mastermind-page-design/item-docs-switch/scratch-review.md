# Verification: each fixed shape run against the real item tool

Run from a scratch session (`public/scratchpad/item-docs-verify/session.jsonl`) and a scratch page
(`public/scratchpad/item-docs-verify/pageonly/page.jsonl`), through `run_item` imported directly
from `Servex/agents/page_tools.js`. Both deleted after (no trace left in `public/` or `scratchpad/`).

## The four refused shapes, confirmed refused

| Shape | Result |
|---|---|
| `call: "place"` | `{"ok":false,"why":"\"place\" is not a method on \"this item\". Known methods: get, lists, watch, …"}` |
| `call: "help"` (on a page) | `{"ok":false,"why":"\"help\" is not a method on \"this item\". Known methods: set, unset, remove, tab, place."}` |
| `call: "pages.add"` (on a **fresh** page, no existing subpage) | `{"ok":false,"why":"no such path: \"pages\". Nothing was written."}` — note: the same call *succeeds* on a page that already has a subpage (an earlier `pages.add` registers a real `pages` list in memory, which `call` can then walk into); a fresh page is the real-world case the brief's examples describe, and that's refused |
| `set: {messages: {"<id>": {...}}}` | `{"ok":false,"why":"\"messages\" names no method, field or child of Task"}` |

## The fixes, confirmed working

| Shape | Result |
|---|---|
| `delta: {place: {...}}` | `{"ok":true, "line": {"place": {...}}, ...}` |
| `delta: {help: {}}` (on a page) | `{"ok":true, "instructions": {"class":"Page", ...}}` |
| `delta: {pages: {add: {name}}}` (fresh page) | `{"ok":true, "pages":[{"added":"kid", "url": "…/kid/"}], ...}` |
| `set: {"messages.<id>.title": "…"}` | `{"ok":true, "line": {"messages": {"<id>": {"title": "…"}}}, ...}` |
| `delta: {summary: {}}` (kept, not `get`) | `{"ok":true, "answer": {"summary": {...}}}` — the full object, unlike `get` which caps near 4 KB |
| `get: "completion"` | `{"ok":true, "read": "completion", "value": {...}}` — confirms the answer shape now written into `core/Session/readme.md:150` |

All six match the fixed docs. Scratch files deleted; `git status` clean.
