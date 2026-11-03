# Every page has an inbox: requirements

Budget: $8

The owner's words (2026-09-30, relayed by the VS Code tab): every page has an INBOX. Any agent, and the owner, can drop a message into any page's inbox: "leave a note here" for any path. The page shows its inbox; items get cleared.

## The convention (decided by the architect; build exactly this)
- **Where it lives:** `<page dir>/ai/log.jsonl`, the page's AI log that the drawer already reads (page-drawer, 2026-09-28; voice sessions write their started/ended lines there too). Never page.jsonl: that file is the page's content.
- **The line:** `{"inbox": {"id": "<short id>", "from": "<agent id or owner>", "text": "…", "at": "<ISO with local offset>"}}`. Cleared by `{"cleared": {"id": "<that id>", "by": "<who>", "at": "…"}}`; the latest line wins, nothing is rewritten.
- **The writer:** one MCP tool on Servex, `drop(path, text)` (`path` is a site path like `/framework/core/Page/` or a repo dir; `from` is the caller's agent id), plus `clear(path, id)`. Servex is the only writer, through `append_log`'s path, so two drops never tear a line. Also a route, `POST /api/inbox/drop`, so the owner's page can drop from a form.
- **The view:** the page's AI tab (the drawer, ext/drawer) shows its inbox at the top: one row per open item (from · text · age · a Clear button), newest first, nothing when empty. A count on the tab's label when items are open.
- **Docs:** one section in core/Page/ai/doc (or ext/drawer/doc, wherever the drawer's docs live) named "Inbox", and one line in the `page` skill's structured-content section sent to mastermind-servex-8 as a recommendation (do not edit skills).

## Deliverables
1. The two tools and the route, with `Servex/doc/inbox.md`.
2. The drawer view, proven headless on two pages (a drop, the row appears, clear, it goes) with screenshots at 400 and 1920 in the task folder.
3. The doc section and the skill recommendation.
4. One line to mastermind-servex-8 when merged (Servex restart follows; never restart yourself).

Fence: Servex/agents/ (the tool + route), ext/drawer/ (the view only; rail.js belongs to audio-consolidate until it lands: put the inbox in its own file and wire it with one line, and tell audio-consolidate which line), core/Page/ai/doc or ext/drawer/doc. Worktree required; commit early. MSYS_NO_PATHCONV=1 for merge.mjs from Bash.

## Clarified by the owner (2026-09-30, about 18:00): coordination, not chat
The inbox is NOT for agents chatting freely; never junk up a page. It is for coordination when it is necessary, e.g. when the owner asks one agent to talk to another. Work on one MODULE is coordinated by ONE mastermind: the one holding that module's worktree. So:
- **Who coordinates this module:** a task mastermind that takes a module claims it with Servex's existing `claim_topic` (topic = the module path, e.g. `core/Page`), and releases it at landing (`release_topic`). `list_claims` is the lookup. Write one line into the module's `ai/log.jsonl` when claimed: `{"coordinator": {"agent", "task", "topic", "at"}}`, and one when released.
- **`drop(path, text)` routes first:** if the path's module (or an ancestor) has a live claim, the drop goes to that coordinator by `send_to_agent` (and one `inbox` line lands in the module's ai/log.jsonl marked `routed_to`); only when nobody coordinates it does the drop sit in the page's inbox for whoever comes next. The drawer shows the coordinator's id at the top of the inbox when there is one.
- The doc section says this in two sentences: message the module's coordinator; the page inbox is the fallback, not a chat.
