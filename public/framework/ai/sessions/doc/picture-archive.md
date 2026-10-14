# The picture archive: where old session screenshots live

**A session's pictures leave the working tree once its month is old; its records never do.** The task logs, pages and docs of every month stay in the repo, so the [Sessions page](/framework/ai/sessions/), `SessionIndex`, `PastWork` and `FollowUp` read every month. Only the untracked screenshots (mostly `shots/` from reviews) move to the external drive. They were never in git, so this is where their one copy lives.

| Month | Pictures | Size | Where they are now |
|---|---|---|---|
| [2026/08](../2026/08/readme.md) | 1,331 | 122.5 MB | `E:/Projects/lew42/archive/sessions/2026/08/` |
| [2026/09](../2026/09/readme.md) | 3,651 | 429.9 MB | `E:/Projects/lew42/archive/sessions/2026/09/` |

## Read one

Same path below the month: `public/framework/ai/sessions/2026/09/22/x/shots/a.png` is at `E:/Projects/lew42/archive/sessions/2026/09/22/x/shots/a.png`. Each month's `archive.jsonl` (in the month folder here and on the drive) lists every file with its bytes and sha1. On the site, an archived picture shows as a broken image; the record beside it is still there.

## Restore one

- A whole month, with the drive plugged in: `node Server/archive-sessions.mjs --undo --months 09`. It copies every file back and checks its sha1; the drive keeps its copy.
- One picture or folder: copy it back by hand, as the path is the same.

## Archive the next month

```sh
node Server/archive-sessions.mjs --plan  --months 10   # what would move, per day
node Server/archive-sessions.mjs --copy  --months 10   # copy + sha1; the count and bytes must agree
node Server/archive-sessions.mjs --apply --months 10   # re-verify, then remove the C: copy and write the month's readme.md
```

The plan, the choice of what moves and why the records stay: [repo-size.md, phase 2](../../doc/repo-size.md#phase-2--archive-old-sessions). Open for later: a second copy on Cloudflare R2 that a server can read (needs the Cloudflare login).
