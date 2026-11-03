# Plan: retire public/framework/ai2/ (scripted, nothing deleted)

Written 2026-11-01 from [audit.md](./audit.md). It is a plan only: the audit moved, deleted and rewrote nothing. One script, `retire-ai2.mjs` (to be written by the task that carries this out, next to this file), runs the steps below. **By default it is a dry run**: it prints every step and every manifest row and changes nothing. With `--apply` it runs the steps in order, writes `manifest.json` (every old path to its new path, with a sha1) *before* touching a file, and commits after each step. `--verify` re-runs `audit-ai2.mjs` and fails on any line still missing. Git is the undo.

## In one paragraph

Of 18 record files in `ai2/`, 0 are identical in the store, 13 are pointers to it and 5 need a few lines copied. The old dated folders `ai/2026/10/...` hold 283 lines that exist nowhere in the store; those are the one real risk. Moving `ai2/` aside is safe only after (1) those lines are copied, and (2) 531 store cards that import `/framework/ai2/card.js` are given an alias. 794 session ids stored twice are a separate clean-up (step 6).

## Order of work (each step is one commit; smoke-test between)

### Step 1. Copy what is missing into the store (append only)

Rule: append, never rewrite (`>>`); skip a line that is already in the destination (exact match), so a second run adds nothing. 295 lines, de-duplicated across the sources (the archive logs repeat part of the `ai2/` logs):

| Destination | Lines | Exists now | Comes from | Why there |
| --- | --- | --- | --- | --- |
| `public/framework/ai/sessions/2026/09/30/cards/now/ai/log.jsonl` | 8 | yes (append) | `ai2/ai/log.jsonl`<br>`ai/archive/ai2/ai/log.jsonl`<br>`ai2/overview/ai/log.jsonl`<br>`ai/archive/ai2/overview/ai/log.jsonl` | the card folder named in the line's own file field |
| `public/framework/ai/ai/log.jsonl` | 1 | yes (append) | `ai2/ai/log.jsonl` | the ai module's own ai log |
| `public/framework/ai/sessions/2026/10/03/retire-ai2/page.jsonl` | 1 | yes (append) | `ai2/page.jsonl` | the store folder of the retire-ai2 task this note was about |
| `public/framework/ai/sessions/2026/09/30/7a3b3d84-aba3-48dc-9497-28c268a6646b/ai2-inbox-read/minion-ai2-inbox/task.jsonl` | 1 | yes (append) | `ai2/tasks/minion-ai2-inbox/task.jsonl` | the real task's own record |
| `public/framework/ai/sessions/2026/10/03/retire-ai2/weight.jsonl` | 1 | no (create) | `ai2/weight.jsonl` | same folder; a cost figure from 2026-10-03 |
| `public/framework/ai/sessions/2026/10/12/cards/session-f155ecbd/page.jsonl` | 33 | yes (append) | `ai/2026/10/12/session-f155ecbd/page.jsonl` | the card's own log (CardDir.rel) |
| `public/framework/ai/sessions/2026/10/13/cards/session-730e8a7b/page.jsonl` | 240 | yes (append) | `ai/2026/10/13/session-730e8a7b/page.jsonl` | the card's own log (CardDir.rel) |
| `public/framework/ai/sessions/2026/10/20/cards/note-the-servex-connector-in-the-claude/page.jsonl` | 3 | yes (append) | `ai/2026/10/20/note-the-servex-connector-in-the-claude/page.jsonl` | the card's own log (CardDir.rel) |
| `public/framework/ai/sessions/2026/10/23/cards/session-d88339a2/page.jsonl` | 2 | no (create) | `ai/2026/10/23/session-d88339a2/page.jsonl` | the card's own log (CardDir.rel) |
| `public/framework/ai/sessions/2026/10/25/cards/session-70f4fedc/page.jsonl` | 1 | no (create) | `ai/2026/10/25/session-70f4fedc/page.jsonl` | the card's own log (CardDir.rel) |
| `public/framework/ai/sessions/2026/10/25/cards/session-a363acbd/page.jsonl` | 1 | no (create) | `ai/2026/10/25/session-a363acbd/page.jsonl` | the card's own log (CardDir.rel) |
| `public/framework/ai/sessions/2026/10/25/cards/session-bcc7b4e3/page.jsonl` | 1 | no (create) | `ai/2026/10/25/session-bcc7b4e3/page.jsonl` | the card's own log (CardDir.rel) |
| `public/framework/ai/sessions/2026/10/25/cards/session-da588d46/page.jsonl` | 1 | no (create) | `ai/2026/10/25/session-da588d46/page.jsonl` | the card's own log (CardDir.rel) |
| `public/framework/ai/sessions/2026/10/25/cards/session-e47111fb/page.jsonl` | 1 | no (create) | `ai/2026/10/25/session-e47111fb/page.jsonl` | the card's own log (CardDir.rel) |

The full text of each line is in [audit.md](./audit.md) (section "in full"). Lines whose proper home is a module's own log that already holds them (3 line(s)) stay where they are.

### Step 2. Mark what is already there

The script writes one row per record file into `manifest.json`: old path, status, the store path(s) that hold it, line counts, date checked. No old file is edited. Rows:

| Old path | Status | Store path(s) holding it |
| --- | --- | --- |
| `ai2/ai/log.jsonl` | partly there | `2026/10/01/cards/remote-access-install-tailscale-on-pc-an/ai/log.jsonl`<br>`public/framework/ux/Dictate/ai/log.jsonl` (a module log, outside the store) |
| `ai2/overview/ai/log.jsonl` | partly there | `2026/09/28/recursive-pairs/recursive-pairs/ai/log.jsonl`<br>`2026/10/01/cards/accidental-rm-rf-of-601-untracked-paths/ai/log.jsonl` |
| `ai2/page.jsonl` | missing | after step 1 |
| `ai2/tasks/ai2-hang/task.jsonl` | pointer | `sessions/2026/09/30/inbox-ext/ai2-hang/` |
| `ai2/tasks/ai2-live-card/task.jsonl` | pointer | `sessions/2026/10/09/session-7eb632b1/ai2-live-card/` |
| `ai2/tasks/ai2-master-detail/task.jsonl` | pointer | `sessions/2026/09/22/session-a578212b/ai2-master-detail/` |
| `ai2/tasks/ai2-rail-rhythm/task.jsonl` | pointer | `sessions/2026/09/29/ai2-rail-rhythm/ai2-rail-rhythm/` |
| `ai2/tasks/card-body/task.jsonl` | pointer | `sessions/2026/09/30/inbox-ext/card-body/` |
| `ai2/tasks/inbox-model/task.jsonl` | pointer | `sessions/2026/09/22/fe4807e9-7c68-4307-b27c-c79c2f09362a/inbox-model/` |
| `ai2/tasks/layout-unify/task.jsonl` | pointer | `sessions/2026/09/25/layout-unify/layout-unify/` |
| `ai2/tasks/minion-ai2-inbox/task.jsonl` | partly there | `sessions/2026/09/30/7a3b3d84-aba3-48dc-9497-28c268a6646b/ai2-inbox-read/minion-ai2-inbox/` |
| `ai2/tasks/now-card-tabs/task.jsonl` | pointer | `sessions/2026/09/25/94f151cf-dd45-4892-b1a0-d5a85f3987c4/now-card-tabs/` |
| `ai2/tasks/open-mic/task.jsonl` | pointer | `sessions/2026/10/09/session-81c5e98b/open-mic/` |
| `ai2/tasks/overview-fix/task.jsonl` | pointer | `sessions/2026/09/25/overview-fix/overview-fix/` |
| `ai2/tasks/tabbed-card/task.jsonl` | pointer | `sessions/2026/09/25/c7cd5485-dd91-434c-9461-beb845fc799e/tabbed-card/` |
| `ai2/tasks/task.jsonl` | pointer | a pointer file: it lists the stub folders, nothing to copy |
| `ai2/tasks/voice-wait-for-pause/task.jsonl` | pointer | `sessions/2026/09/25/voice-wait-for-pause/voice-wait-for-pause/` |
| `ai2/weight.jsonl` | partly there | `2026/09/24/1c09793f-74b6-4218-82e5-53e5cd88b659/servex-mastermind/weight.jsonl`<br>`2026/09/24/assistant-layers/assistant-layers/weight.jsonl` |
| `ai/2026/10/12/session-f155ecbd/page.jsonl` | only in the old place | after step 1: `sessions/2026/10/12/cards/session-f155ecbd/page.jsonl` |
| `ai/2026/10/13/session-730e8a7b/page.jsonl` | only in the old place | after step 1: `sessions/2026/10/13/cards/session-730e8a7b/page.jsonl` |
| `ai/2026/10/20/note-the-servex-connector-in-the-claude/page.jsonl` | only in the old place | after step 1: `sessions/2026/10/20/cards/note-the-servex-connector-in-the-claude/page.jsonl` |
| `ai/2026/10/23/session-d88339a2/page.jsonl` | only in the old place | after step 1: `sessions/2026/10/23/cards/session-d88339a2/page.jsonl` |
| `ai/2026/10/25/session-70f4fedc/page.jsonl` | partly in the store | after step 1: `sessions/2026/10/25/cards/session-70f4fedc/page.jsonl` |
| `ai/2026/10/25/session-a363acbd/page.jsonl` | partly in the store | after step 1: `sessions/2026/10/25/cards/session-a363acbd/page.jsonl` |
| `ai/2026/10/25/session-bcc7b4e3/page.jsonl` | partly in the store | after step 1: `sessions/2026/10/25/cards/session-bcc7b4e3/page.jsonl` |
| `ai/2026/10/25/session-da588d46/page.jsonl` | partly in the store | after step 1: `sessions/2026/10/25/cards/session-da588d46/page.jsonl` |
| `ai/2026/10/25/session-e47111fb/page.jsonl` | partly in the store | after step 1: `sessions/2026/10/25/cards/session-e47111fb/page.jsonl` |
| `ai/archive/ai2/ai/log.jsonl` | partly there | `2026/10/01/cards/remote-access-install-tailscale-on-pc-an/ai/log.jsonl`<br>`public/framework/ux/Dictate/ai/log.jsonl` |
| `ai/archive/ai2/overview/ai/log.jsonl` | partly there | `2026/09/28/recursive-pairs/recursive-pairs/ai/log.jsonl`<br>`2026/10/01/cards/accidental-rm-rf-of-601-untracked-paths/ai/log.jsonl` |

### Step 3. Repoint every reader (before anything moves)

**3a. The 531 store cards.** Their first line says `"class": "/framework/ai2/card.js"` and `core/Page/Jsonl.js` imports it (`log_class()`). Do **not** rewrite 531 history records. Instead add a small alias table to `log_class()`: `{ "/framework/ai2/card.js": "/framework/ai/cards/card.js" }` (one entry per shim path that appears as a class value; today only `card.js` does). The alternative, a byte-exact text replace of that one field in each file, works but edits records, so it is not the default.

**3b. Live code.** Rule: `ai2` becomes `ai`. Cards are already served at `/framework/ai/<yyyy>/<mm>/<dd>/<card>/` (`ai/page.js`, `AIRail.handles()`), so `/framework/ai2/<card>/` becomes `/framework/ai/<card>/`; a shim import becomes the file its re-export line names (table in audit.md, section 4). One caveat the dry run must check link by link: `ai/page.js` claims only dated card ids, `p-N`, `ask:...`, `topic-...` and uuid ids, while `ai2/page.js` claimed every unknown name as a card, so each rewritten link target is resolved through `ai/page.js` first and listed if it would 404.

**Imports of an ai2 shim** (1 files)

| File | Hits | First hit |
| --- | --- | --- |
| `public/framework/dev/DevBar/chat.js` | 1 | line 3: `import { AgentTalk } from "../../ai2/live.js";` |

**Links and URLs built from /framework/ai2/** (29 files)

| File | Hits | First hit |
| --- | --- | --- |
| `public/framework/ai/AIOverview.js` | 1 | line 185: `{ name: "Dashboard", icon: "dashboard", gist: "Talk to the assistants, see tasks and cost.", href: "/framework/ai2/" },` |
| `public/framework/ai/cards/card.js` | 1 | line 236: `else a.c("ai2-back page-link").href(shell?.url ?? "/framework/ai2/").text("← all cards");` |
| `public/framework/ai/cards/Tasks.js` | 1 | line 148: `a.c("ui-row ai2-toc-row page-link").href("/framework/ai2/" + m.id + "/").append(() => {` |
| `public/framework/ai/cards/workspace.js` | 1 | line 14: `const ROOT = "/framework/ai2/";` |
| `public/framework/ai/dashboard/page.js` | 2 | line 50: `const href = t.card ? "/framework/ai2/" + t.card + "/" : t.dir ? "/framework/ai/" + t.dir.replace(/^public\/framework\/ai\//, "") + "/" : nu...` |
| `public/framework/ai/local/page.js` | 1 | line 13: `const REPORT_URL = "/framework/ai2/2026-10-01/local-ai/";` |
| `public/framework/ai/rail/inbox.js` | 1 | line 570: `ask.card ? { url: "/framework/ai2/" + ask.card + "/", label: "its card" } : null,` |
| `public/framework/ai/rail/Log.js` | 1 | line 58: `const base = '/framework/ai2/${m.date}/${m.slug}/';` |
| `public/framework/ai/rail/Needs.js` | 3 | line 85: `url: ask.card ? "/framework/ai2/" + ask.card + "/" : "/framework/ai/asks/?status=stalled",` |
| `public/framework/core/Page/ai/work.js` | 1 | line 132: `draw: () => row_line(c.type === "note" ? "sticky_note_2" : "task_alt", c.title, "/framework/ai2/" + c.id + "/") })),` |
| `public/framework/core/Page/audit/data.js` | 4 | line 71: `"url": "/framework/ai2/",` |
| `public/framework/core/Page/audit/design/data.js` | 1 | line 127: `"url": "/framework/ai2/",` |
| `public/framework/core/Page/ext/paths.js` | 1 | line 15: `{ adds: "a card's own folder", on: "/framework/ai2/<y>/<m>/<d>/<card>/", saves: "that folder's page.jsonl", built: true, href: "/framework/a...` |
| `public/framework/core/Page/make/page.js` | 1 | line 99: `md("'route()''s biggest job: a page whose child is a *name*, read straight off disk instead of declared. This is the pattern behind 'ai2/''s...` |
| `public/framework/core/Sidebar/variants/walkthrough/page.js` | 1 | line 28: `{ title: "AI 2 uses the same layout", pic: "ai2-system-design-floating.png", open: "/framework/ai2/2026/09/24/system-design/?view=workspace"...` |
| `public/framework/ui/scale/page.js` | 1 | line 38: `md("Built for the Figma \"Sept 2026\" recreations, where a 856px-wide design had to fit a ~400px card column without reflowing what the Figm...` |
| `public/framework/ux/Card/page.js` | 3 | line 13: `description: "The look of an AI card's own page — its head, its outline, a Live-card row — the same CSS whether the card opens under /framew...` |
| `public/framework/ux/Dictate/page.js` | 1 | line 39: `tile("Where it goes", "a card, a composer, the prompt log", "/framework/ai2/");` |
| `public/framework/ux/Dictate/v1/page.js` | 1 | line 33: `tile("Where it goes", "a card, a composer, the prompt log", "/framework/ai2/");` |
| `Server/Ai2Overview.mjs` | 1 | line 55: `{ id: "ai2", name: "AI 2", icon: "dashboard", url: "/framework/ai2/",` |
| `Server/clarity.mjs` | 2 | line 90: `if (/framework\/ai2\//.test(lines)) pages.unshift("/framework/ai2/");` |
| `Server/Crawl.mjs` | 1 | line 80: `routes.add('/framework/ai2/${cardSub}/');` |
| `Server/review.mjs` | 1 | line 133: `if (card) return '/framework/ai2/${card[1]}/${card[2]}/${card[3]}/${card[4]}/';` |
| `Server/smoke.mjs` | 1 | line 105: `const canaries = ["/framework/", "/framework/ai2/"];` |
| `Server/UndoneAsks.mjs` | 1 | line 165: `status: a.status, done, source: this.words_url(a.words), card_url: a.card ? "/framework/ai2/" + a.card + "/" : null };` |
| `Servex/agents/Layers.js` | 1 | line 523: `const path = '/framework/ai2/${id}/';` |
| `Servex/agents/layers.test.mjs` | 1 | line 274: `assert.equal(sent.path, '/framework/ai2/${CARD_OWNER}/');` |
| `Servex/agents/page-assistant-proof.mjs` | 1 | line 32: `"/framework/ai2/2026/09/25/an-assistant-on-every-page/"` |
| `Servex/cards/test.mjs` | 1 | line 114: `const p = await cards.append(b.id, { prompt: { raw: "um make the sidebar wider", via: "whisper", url: "/framework/ai2/" } });` |

**Code that reads the folder by name** (3 files)

| File | Hits | First hit |
| --- | --- | --- |
| `Server/Council.mjs` | 1 | line 187: `...walk(path.join(root, "public/framework/ai2"))` |
| `Servex/agents/Assistant.js` | 1 | line 373: `try { page(path.join(this.root, "ai2"), "/framework/ai2/"); } catch {}` |
| `Servex/processes.test.mjs` | 1 | line 91: `ok(!n(" M", "Server/layout-check.mjs") && !n("??", "undefined/a.png") && !n(" M", "public/framework/ai2/ai2.css"), "code is never noise");` |

**3c. Docs and comments.** 123 docs and 41 code files mention an ai2 path; update the live ones (readmes, module docs) in the same commit, and leave dated history alone. Also move the `/framework/ai2/` canaries in `Server/smoke.mjs` and `Server/Crawl.mjs` to `/framework/ai/`, then run `node Server/smoke.mjs` and the crawl.

### Step 4. Move ai2/ aside (not delete)

`git mv public/framework/ai2 public/framework/ai/archive/ai2-module`. One command; the dry run prints it first. Result: `/framework/ai2/` stops existing and no record is lost; the old folder is one `git mv` from coming back. **Decision:** no redirect page is kept at the old address, because the owner said the directory "should probably just disappear". The alternative, a five-line `ai2/page.js` that redirects to `/framework/ai/` for old bookmarks, is cheap and can be added later if a link turns up. `Servex/agents/Assistant.js` registers `ai2` inside a try/catch, so a missing folder is harmless there.

Manifest rows for this step (64 files, old path to new path):

| Old path | New path | Kind |
| --- | --- | --- |
| `ai2/activity.js` | `ai/archive/ai2-module/activity.js` | shim |
| `ai2/agents.js` | `ai/archive/ai2-module/agents.js` | shim |
| `ai2/ai/files.jsonl` | `ai/archive/ai2-module/ai/files.jsonl` | listing |
| `ai2/ai/log.jsonl` | `ai/archive/ai2-module/ai/log.jsonl` | record |
| `ai2/ai2.css` | `ai/archive/ai2-module/ai2.css` | code or doc |
| `ai2/card.js` | `ai/archive/ai2-module/card.js` | shim |
| `ai2/chat.js` | `ai/archive/ai2-module/chat.js` | shim |
| `ai2/compose.js` | `ai/archive/ai2-module/compose.js` | shim |
| `ai2/doc/files.jsonl` | `ai/archive/ai2-module/doc/files.jsonl` | listing |
| `ai2/doc/img/files.jsonl` | `ai/archive/ai2-module/doc/img/files.jsonl` | listing |
| `ai2/faces.js` | `ai/archive/ai2-module/faces.js` | shim |
| `ai2/files.jsonl` | `ai/archive/ai2-module/files.jsonl` | listing |
| `ai2/floating.js` | `ai/archive/ai2-module/floating.js` | shim |
| `ai2/fold.js` | `ai/archive/ai2-module/fold.js` | shim |
| `ai2/groups.js` | `ai/archive/ai2-module/groups.js` | shim |
| `ai2/inbox.js` | `ai/archive/ai2-module/inbox.js` | shim |
| `ai2/live.js` | `ai/archive/ai2-module/live.js` | shim |
| `ai2/meter.js` | `ai/archive/ai2-module/meter.js` | shim |
| `ai2/outline.js` | `ai/archive/ai2-module/outline.js` | shim |
| `ai2/overview/ai/files.jsonl` | `ai/archive/ai2-module/overview/ai/files.jsonl` | listing |
| `ai2/overview/ai/log.jsonl` | `ai/archive/ai2-module/overview/ai/log.jsonl` | record |
| `ai2/overview/files.jsonl` | `ai/archive/ai2-module/overview/files.jsonl` | listing |
| `ai2/page.js` | `ai/archive/ai2-module/page.js` | code or doc |
| `ai2/page.jsonl` | `ai/archive/ai2-module/page.jsonl` | record |
| `ai2/rail.js` | `ai/archive/ai2-module/rail.js` | shim |
| `ai2/readme.md` | `ai/archive/ai2-module/readme.md` | code or doc |
| `ai2/real.js` | `ai/archive/ai2-module/real.js` | shim |
| `ai2/rules.js` | `ai/archive/ai2-module/rules.js` | shim |
| `ai2/tasks.js` | `ai/archive/ai2-module/tasks.js` | shim |
| `ai2/tasks/ai2-hang/files.jsonl` | `ai/archive/ai2-module/tasks/ai2-hang/files.jsonl` | listing |
| `ai2/tasks/ai2-hang/page.js` | `ai/archive/ai2-module/tasks/ai2-hang/page.js` | code or doc |
| `ai2/tasks/ai2-hang/task.jsonl` | `ai/archive/ai2-module/tasks/ai2-hang/task.jsonl` | record |
| `ai2/tasks/ai2-live-card/page.js` | `ai/archive/ai2-module/tasks/ai2-live-card/page.js` | code or doc |
| `ai2/tasks/ai2-live-card/task.jsonl` | `ai/archive/ai2-module/tasks/ai2-live-card/task.jsonl` | record |
| `ai2/tasks/ai2-master-detail/page.js` | `ai/archive/ai2-module/tasks/ai2-master-detail/page.js` | code or doc |
| `ai2/tasks/ai2-master-detail/task.jsonl` | `ai/archive/ai2-module/tasks/ai2-master-detail/task.jsonl` | record |
| `ai2/tasks/ai2-rail-rhythm/page.js` | `ai/archive/ai2-module/tasks/ai2-rail-rhythm/page.js` | code or doc |
| `ai2/tasks/ai2-rail-rhythm/task.jsonl` | `ai/archive/ai2-module/tasks/ai2-rail-rhythm/task.jsonl` | record |
| `ai2/tasks/card-body/page.js` | `ai/archive/ai2-module/tasks/card-body/page.js` | code or doc |
| `ai2/tasks/card-body/task.jsonl` | `ai/archive/ai2-module/tasks/card-body/task.jsonl` | record |
| `ai2/tasks/files.jsonl` | `ai/archive/ai2-module/tasks/files.jsonl` | listing |
| `ai2/tasks/inbox-model/page.js` | `ai/archive/ai2-module/tasks/inbox-model/page.js` | code or doc |
| `ai2/tasks/inbox-model/task.jsonl` | `ai/archive/ai2-module/tasks/inbox-model/task.jsonl` | record |
| `ai2/tasks/layout-unify/files.jsonl` | `ai/archive/ai2-module/tasks/layout-unify/files.jsonl` | listing |
| `ai2/tasks/layout-unify/page.js` | `ai/archive/ai2-module/tasks/layout-unify/page.js` | code or doc |
| `ai2/tasks/layout-unify/task.jsonl` | `ai/archive/ai2-module/tasks/layout-unify/task.jsonl` | record |
| `ai2/tasks/minion-ai2-inbox/page.js` | `ai/archive/ai2-module/tasks/minion-ai2-inbox/page.js` | code or doc |
| `ai2/tasks/minion-ai2-inbox/task.jsonl` | `ai/archive/ai2-module/tasks/minion-ai2-inbox/task.jsonl` | record |
| `ai2/tasks/now-card-tabs/page.js` | `ai/archive/ai2-module/tasks/now-card-tabs/page.js` | code or doc |
| `ai2/tasks/now-card-tabs/task.jsonl` | `ai/archive/ai2-module/tasks/now-card-tabs/task.jsonl` | record |
| `ai2/tasks/open-mic/page.js` | `ai/archive/ai2-module/tasks/open-mic/page.js` | code or doc |
| `ai2/tasks/open-mic/task.jsonl` | `ai/archive/ai2-module/tasks/open-mic/task.jsonl` | record |
| `ai2/tasks/overview-fix/files.jsonl` | `ai/archive/ai2-module/tasks/overview-fix/files.jsonl` | listing |
| `ai2/tasks/overview-fix/page.js` | `ai/archive/ai2-module/tasks/overview-fix/page.js` | code or doc |
| `ai2/tasks/overview-fix/task.jsonl` | `ai/archive/ai2-module/tasks/overview-fix/task.jsonl` | record |
| `ai2/tasks/tabbed-card/files.jsonl` | `ai/archive/ai2-module/tasks/tabbed-card/files.jsonl` | listing |
| `ai2/tasks/tabbed-card/page.js` | `ai/archive/ai2-module/tasks/tabbed-card/page.js` | code or doc |
| `ai2/tasks/tabbed-card/task.jsonl` | `ai/archive/ai2-module/tasks/tabbed-card/task.jsonl` | record |
| `ai2/tasks/task.jsonl` | `ai/archive/ai2-module/tasks/task.jsonl` | record |
| `ai2/tasks/voice-wait-for-pause/files.jsonl` | `ai/archive/ai2-module/tasks/voice-wait-for-pause/files.jsonl` | listing |
| `ai2/tasks/voice-wait-for-pause/page.js` | `ai/archive/ai2-module/tasks/voice-wait-for-pause/page.js` | code or doc |
| `ai2/tasks/voice-wait-for-pause/task.jsonl` | `ai/archive/ai2-module/tasks/voice-wait-for-pause/task.jsonl` | record |
| `ai2/weight.jsonl` | `ai/archive/ai2-module/weight.jsonl` | record |
| `ai2/workspace.js` | `ai/archive/ai2-module/workspace.js` | shim |

`ai/archive/ai2/` already is the aside copy of the old page logs and stays; its two non-empty logs are rows in step 2.

### Step 5. Retire the old dated folders

Only after `--verify` shows every line of every old page log in the store: `git mv public/framework/ai/2026 public/framework/ai/archive/old-dated/2026` and the same for `public/framework/ai/2026-10-13`, after pointing `CardDir.pick()`'s fallback away from the old place. Until then they stay: the route falls back to them when a card exists only there (0 cards today).

### Step 6. Clean up the duplicate session folders (a separate task, not ai2)

794 session ids sit in 1588 folders (appendix of [audit.md](./audit.md)). Proposed rule, same pattern as above (dry run, manifest, `git mv`): per id keep the kept folder named in the appendix. For each extra folder: if it is a *twin* (734 folders), move it to `public/framework/ai/archive/duplicate-sessions/<same relative path>`. If it holds paths the kept folder lacks (60 folders), first copy those paths into the kept folder (never overwrite a file that exists), then move the extra folder aside. Afterwards rebuild the day, month and year `index.json` / `index.jsonl` so a walk of the index files and the month totals agree.

## Commands

```
node retire-ai2.mjs               # dry run: prints every step and the manifest rows, changes nothing
node retire-ai2.mjs --apply       # steps 1 to 4 in order; manifest.json first; one commit per step
node retire-ai2.mjs --verify      # re-runs audit-ai2.mjs; non-zero exit if any line is still missing
```

Manifest row shape: `{ "step": 4, "old": "public/framework/ai2/card.js", "new": "public/framework/ai/archive/ai2-module/card.js", "kind": "shim", "sha1": "..." }`. A step 1 row also carries the destination file and the line numbers appended.

