# Six Servex problems found on day one

| # | Problem | Status |
|---|---|---|
| 1 | Finished agents kept running and filled the memory | 68 stopped; auto-stop proposed |
| 2 | Nobody hears when a page breaks | proposed |
| 3 | A session id is saved only after the first turn | sent to assistant-layers |
| 4 | A restart checks that code parses, not that it boots | proposed |
| 5 | Two managers built the same chat feature | proposed |
| 6 | Three managers edited one page at once | one owner named; rule proposed |

## 1. Finished agents kept running and filled the memory
- **Seen:** 1.5 GB free of 32 GB; 136 claude processes used 27 GB, mostly finished minions.
- **Why:** an idle agent's process stays alive in case someone asks again, and nothing stops it.
- **Done:** 68 stopped (ids kept, so each can resume); free memory back to 9.9 GB; `sub-mastermind` now says to stop each minion after reading its result.
- **Fix:** in `spawn_agent`, stop an idle minion minutes after its parent has the result, and start a new agent only with 4 GB free and under 30 live. Goes live at the next restart.

## 2. Nobody hears when a page breaks
- **Seen:** no `ai/health/2026-09-24.jsonl`, so the health watcher is not running.
- **Fix:** Servex keeps the watcher alive, like it does dev servers. Until then, load your page once when you land a task.

## 3. A session id is saved only after the first turn
- **Seen:** eight working agents had no session id, so a restart in turn one cannot resume them.
- **Fix:** record it at spawn.

## 4. A restart checks parsing, not booting
- **Seen:** four tasks' Servex changes go live together; `sustain.mjs --restart` only runs `node --check`. I booted them by hand on a private port and they worked.
- **Fix:** `--restart` boots the new code privately first, waits for `/mcp` to answer, and kills nothing if it doesn't.

## 5. Two managers built the same chat feature
- **Seen:** role labels and markdown were built twice, in `ai2/chat.js`, `live.js`, `page.js`.
- **Why:** nobody used `claim_topic`; managers can't message each other.
- **Fix:** claim before you spawn a minion; a refused claim names the owner.

## 6. Three managers edited one page
- **Seen:** the chat jumped between the right column and the bottom, leaving three scroll areas and a white void.
- **Done:** manager-new-card owns the card page and chat; the other two stopped.
- **Fix:** a small table of shared files and their owners, which `claim_topic` reads.

## Noted, not built
Dictation that keeps running across pages needs one global assistant holding the microphone. Written up after Dictate lands.
