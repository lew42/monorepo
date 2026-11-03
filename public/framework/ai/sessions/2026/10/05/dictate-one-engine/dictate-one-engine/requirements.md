# Dictate: exactly one engine per tab

## Why (vscode-mastermind, measured 2026-10-04 23:45)
A headless load of http://127.0.0.1:3104/framework/ux/Dictate/ logs "[dictate] socket: connected", "[dictate] whisper: checking…" and "[dictate] whisper: answering" SIX times each: six Dictate engines on one page. The owner, on the phone, gets the mic stuck at "connecting…", a mic AbortError, and the same words 4× in one bubble. Six engines grabbing one mic and appending the same transcript explains all three.

## Do (small; nothing else)
1. Find every place that constructs a Dictate engine (`new Dictate(` / `dictate(` / `chat(` mounts, `ux/Dictate/chat.js`, `Widget.js`, `push-to-talk.js`, the surfaces). Make the engine a per-tab singleton (`Dictate.engine()` or the one `chat.js` controller owns it); every surface is a view of that one engine.
2. Prove with check_page / Server/browser.mjs: the three "[dictate]" lines appear ONCE on load of /framework/ux/Dictate/, once after a reload, and once on /framework/ with the AI rail opened. Add that count to the page's smoke expectation (Server/smoke.mjs or the console allow-list) so a second engine fails the merge.
3. Worktree off michael/dev (fresh), check_page, `node Server/merge.mjs`. Don't rename files (a case rename collided in the main tree tonight).

Budget: $3 (a guide; it's a small fix)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
