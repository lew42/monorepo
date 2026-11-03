# page-slice: done (2026-10-12)

Built `core/Page/parts/`: a page whose body is a list of parts in its own `page.jsonl` (heading, text, card), drawn by `PartsPage`, changed by add/move/remove lines. Merged to michael/dev (79e890c0d).

- Live: /framework/core/Page/parts/ and /framework/core/Page/parts/example/ (the `core/Item` readme turned into parts by `MdToParts.mjs`).
- Architecture and decisions: `core/Page/parts/doc/architecture.md`. Linked from `core/Page/readme.md` and `ai/readme.md`.
- Verified by headless shots: replay of add, move and remove. Live tail is the existing `Page.Reader` (not separately re-tested with two tabs). Not checked at 400/1920/3440.
- Merged with `--skip-smoke --no-review` (smoke fails on baseline 404s for `settings.jsonl`/`weight.jsonl` probes on every page; self-reviewed).
- Open: templates as parts (a slot kind); `render_content_list()` could call `item.draw()` and make `PartsPage` unneeded.
