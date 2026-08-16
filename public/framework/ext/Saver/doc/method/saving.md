`!!this.writing` — is a write in flight right now. One line, and the only status
check the base class offers; there is no "has unsaved changes" or "last save
failed" beyond it.

**Usage** — no current caller in `public/` (grep found none): every backend that
wants a read-only or "saving…" badge today reads a `write()`/`save()` return
value directly instead (`ext/editor` reads `FileSaver`'s `false`). This method
is the seam such a badge would use if one is added.
