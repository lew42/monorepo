# /live/archive: the old /live cards, kept

Open [/live/archive/](/live/archive/). It is the same page as [/live/](/live/) (class `LiveArchive extends Live`) reading its own copy of the log, so every old card opens as it was, at `/live/archive/<id>/`.

- **How it got here:** `ArchiveMove.mjs` copied `/live`'s `page.jsonl` to `archive/page.jsonl` byte for byte, wrote `manifest.json` (line count, sha256, card ids), then appended a `clear` and the three new cards to `/live`. Nothing was deleted or rewritten.
- **Look first:** `node public/live/archive/ArchiveMove.mjs --plan` lists what would move; `--apply` moves it (refuses if the archive exists); `--undo` appends the archived cards back to `/live`.
- **Why:** the owner wanted a blank slate. A card holding text an agent typed goes stale; a pointer or a view does not ([notes](../doc/notes.md), "Every card that was on /live").
