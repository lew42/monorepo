# The AI system docs: /framework/ai/system/ explains how the whole thing works: requirements

The owner, 2026-10-02 (on mobile): "Do we have a page that documents our whole AI system? I remember asking for that, but I don't think it's there… link me to our system documentation that answers some of these questions." Earlier asks: /framework/ai is the AI docs home, and the System tab holds all the AI docs (2026-09-30).

**Today the System tab holds only `models/`.** Fill it.

## What it shows (level 1 is one screen; each topic is a child page one click down)
1. **The map:** the owner → the VS Code mastermind → Servex → masterminds → minions, plus the dev server and the site. It's a diagram of icon cards, each linking to its page (/framework/servex/ already has detail; link to it, don't copy it).
2. **How data is written (the owner's question):** every JSONL writer, and whether code enforces it. Source: the 2026-10-02 audit found 12 writers. Validated routes: `.claude/hooks/append.mjs`, Servex `append_log`, research `store.mjs`, `Server/decide.mjs`, and Servex `Cards.js`. Unvalidated: `ledger.mjs` hooks, `Server/plugins/SocketServer/Append.js` (the browser), `PageFiles.js`, and `Usage.js`. Guard: `jsonl-guard.mjs` covers shell redirects only (Write/Edit coverage is in progress with @mastermind-servex-9). Render it as a table: the writer, who triggers it (node, browser UI, AI tool, or AI running a script), and whether it's validated. Re-check each row against the code; don't trust this list blindly.
3. **How a page saves:** page.jsonl lines, `set(delta)`, Store, LiveList, and the dev socket's append and tail. Link to [page-item-design.md](../../2026-09-30/proposal-flow/page-item-design.md) and the converge notes in ext/Saver, ext/filesystem and dev/Socket.
4. **Skills, roles and the readme chain:** link the existing pages (/framework/ai/readmes/, the roles in Servex/agents).
5. **Tasks, cards and the asks ledger:** what a task folder holds, and where the owner sees it.

## Rules
- Shown, not told (CLAUDE.md Presentation). One screen per level. Every module name is a clickable link to its page.
- A Sonnet task mastermind with no minions. A pool worktree, `merge.mjs`, and the review skill at 400 and 1920.
- Before writing, check what exists (/framework/servex/, /framework/ai/readmes/, ai/system/models/) and link it. Never duplicate (law 6).
- Never wait on the owner.
