The maintainer's document: why fifteen checks are one file, which ones don't
earn their place yet stay anyway, and the caller table from the audit.

It is served twice — cited by a maintainer reading the directory, and
collapsed at the bottom of the Overview tab via `md.details(import.meta,
"readme.md")`.

## Improvements

1. **The caller table needs re-running periodically.** It is a snapshot from
   one grep, not a live count — `files:` and the API tab go stale the same
   way, and nothing crawls any of them. *(simple, useful)*
