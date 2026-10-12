# Doc audit: jsonl.md, data-children.md, data.md

## jsonl.md: keep
- why: Core reference for page.jsonl format, agent tools (page_set, page_add, page_call, page_read, page_note), and streaming behavior. No duplicate; streaming.md covers the data flow, jsonl.md covers the line vocabulary and writer semantics.
- into: —
- linked from: readme.md (twice: storage section and Reference), more-features.md, streaming.md (table), navigation.md, architecture.md (via streaming.md reference)
- stale: none found (page.jsonl_url, PageLog, Log.js compat re-export all current)

## data-children.md: keep
- why: Design record (task ai/2026-09-17/core-data-children/) documenting the function-based children feature. Serves as both proposal history and implementation guide; no other doc covers this seam. It reads as proposal but correctly labels lines applied vs refuted. Three data-backed pages on the site depend on this pattern and method docs reference it.
- into: —
- linked from: data.md (at end, "More" section), more-features.md, navigation.md, decisions.md, method/child.md, method/load_all_children.md, method/source_children.md
- stale: none found (all referenced methods and classes current; seam 1 is implemented; seam 2 was correctly refuted)

## data.md: keep
- why: Unique documentation for the `data:` page feature (page.json as page source). Shows three forms (true, inline object, nothing), what core reads, how it merges with page.js, the three rungs of Page.load(), and directory listing behavior. No overlap with other docs.
- into: —
- linked from: readme.md (via more-features.md), method/property docs (read_data, take_data, data)
- stale: none found (page.json loading implemented, the three-rung Page.load() current, directory behavior correct)
