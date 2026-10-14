# The picture archive: where old session screenshots live

**A session's pictures leave the working tree once its month is old; its records never do.** The archive frees the working disk: August and September went from 650.8 MB to 168.6 MB. The task logs, pages and docs of every month stay in the repo, so the [Sessions page](/framework/ai/sessions/), `SessionIndex`, `PastWork` and `FollowUp` read every month. Only the untracked screenshots (mostly `shots/` from reviews) move to the external drive. They were never in git, so this is where their one copy lives. A picture that a page shows when it opens stays here, so no page loses a picture.

| Month | Moved to the drive | Stayed (a page shows it) | Where the moved ones are |
|---|---|---|---|
| [2026/08](../2026/08/readme.md) | 1,124 pictures, 105.1 MB | 207, 23.3 MB | `E:/Projects/lew42/archive/sessions/2026/08/` |
| [2026/09](../2026/09/readme.md) | 3,124 pictures, 377.7 MB | 527, 73.0 MB | `E:/Projects/lew42/archive/sessions/2026/09/` |

⚠️ **The drive holds the only copy** of the moved pictures (they were never in git). A second copy on Cloudflare R2 is the open next step: [repo-size.md](../../doc/repo-size.md#phase-2--archive-old-sessions).

## Read one

The path below the month is the same: `public/framework/ai/sessions/2026/09/22/x/shots/a.png` is at `E:/Projects/lew42/archive/sessions/2026/09/22/x/shots/a.png`. Each month's `archive.jsonl` (in the month folder here and on the drive) lists every file with its bytes and sha1.

## Restore one

- **One picture**, from the repo root with the drive plugged in (Git Bash):
  `cp E:/Projects/lew42/archive/sessions/2026/09/22/x/shots/a.png public/framework/ai/sessions/2026/09/22/x/shots/`
- **A whole month:** `node Server/archive-sessions.mjs --undo --months 09`. It copies every file back and checks its sha1; the drive keeps its copy.

## Archive the next month

```sh
node Server/archive-sessions.mjs --plan  --months 10   # what would move, per day
node Server/archive-sessions.mjs --copy  --months 10   # copy + sha1; the count and bytes must agree
node Server/archive-sessions.mjs --apply --months 10   # re-verify, remove the C: copy except pictures a page shows, write the month's readme.md
```

"A page shows it" means some `page.js` in its folder or above names it, or a `task.jsonl`, `page.jsonl` or `.md` there embeds it as a picture (`![](…)`, `<img>`, a `shot` line). Anything else archived shows as a broken link at most, never on a page's first screen; `merge.mjs`'s smoke test stays clean.

The plan and why the records stay: [repo-size.md, phase 2](../../doc/repo-size.md#phase-2--archive-old-sessions). Open for later: a second copy on Cloudflare R2 that a server can read (needs the Cloudflare login).
