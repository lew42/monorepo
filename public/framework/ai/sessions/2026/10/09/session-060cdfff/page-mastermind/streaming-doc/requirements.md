Budget: $3

# core/Page: one clear overview of page storage and streaming

The owner (2026-10-09 18:15 and 18:25, relayed by vscode-mastermind-7efd07d5): "Document the page streaming system in core/Page very clearly: page.jsonl append → live() tail → render; what lives where, cross references, which tools write it (page_tools.js, Servex append_log), coordination; one overview a reader can follow." Also: "document clearly page.js vs page.jsonl vs files.jsonl (the per-folder index; directory.json is now off, see Server/doc/directory-off.md), and the other path-based per-directory systems; the page system is our storage + streaming container."

## Do
Write ONE file: `C:\Code\lew42\worktrees\page-mm\public\framework\core\Page\doc\streaming.md` (worktree `page-mm`, branch worktree/page-mm). Under ~120 lines. Plain sentences for a new coder (CLAUDE.md law 2), a diagram in a code block, then short sections:
1. **The files in a folder**: page.js, page.jsonl, files.jsonl, settings.jsonl, readme.md, doc/, directory.json (off) — one line each: what it is, who writes it, who reads it.
2. **One line's journey**: a writer appends → the dev server's watcher → `Server/plugins/SocketServer/Tail.js` → the socket → `ext/JSONL/live.js` → `Page.Reader` (core/Page/Page.class.js, extends `Item.Store` in core/Item/Store.js) → `page.set()` → the page redraws (`log_redraw`, `nav_redraw`, and the new `rerender()`). Name each file with its path. Say what a browser tab writes back (`Item.Store` → `Server/plugins/SocketServer/Append.js`).
3. **Who writes**: `Servex/agents/page_tools.js` (page_set is the page tool: path + delta, see doc/page-tool-architecture.md), Servex `append_log`, `.claude/hooks/append.mjs`, hand edits are blocked by `.claude/hooks/jsonl-guard.mjs`. One line each.
4. **Rules that keep it safe**: append only (never rewrite), one writer per line, validation (`.claude/hooks/jsonl-schema.mjs`), localhost-only streaming (production loads once).
5. **Path-based per-directory systems**: md/ and fs/ routes, the page inbox (core/Page/ext/Inbox), files.jsonl listing — one line each with a link (core/Page/ext/doc/path-extensions.md has the census).
Read the real code to verify every claim (Tail.js, live.js, Store.js, Append.js, Server/plugins/PageFiles.js, Page.class.js `Page.Reader`, doc/jsonl.md, doc/loading.md, Server/doc/directory-off.md). Link existing docs instead of repeating them. Write links as plain relative file paths (`jsonl.md`, `../../Item/Store.js`).

## Fence
Only that one file. Do not edit readmes or code (the mastermind links it). Commit it in the worktree: `git -C C:/Code/lew42/worktrees/page-mm add public/framework/core/Page/doc/streaming.md` then commit with a clear message ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Never `git add -A` (the worktree has generated noise). Then stop and reply in two sentences.
