# Brief: flag stale VS Code conversations, and close games only when the PC is idle and RAM is tight

You are a Sonnet minion of **task-mastermind-dormant-idle**, for the task [process-monitor](../requirements.md). Read its last section first, "the RAM squeeze, measured": asks 3 and 4 are yours.

**Work in:** `C:/Code/lew42/worktrees/pm-idle` (branch `worktree/pm-idle`, already made from michael/dev). Never edit the main checkout. Commit early, by exact path. It has no node_modules (never link them); `node Servex/processes.test.mjs` runs without them.

**Your files (the fence):**
- `Servex/Processes.js`
- `Servex/Games.js` (new)
- `Servex/Servex.js` (only to start `Games`, the way `Processes` is started)
- `Servex/processes.test.mjs` (add checks; another minion also adds checks at the end, so add yours in their own block)
- `Servex/doc/processes.md` (one short section each)
- `public/framework/ai2/processes.js` and `ai2.css` (prefix `ai2-proc-`), to show the flag on the Live card

Another minion owns `Worktrees.js` and `agents/Global.js`; don't edit them.

## 3. Stale VS Code conversations

`Processes.js` already groups a claude.exe that Servex did not start as **session** ("Claude Code session (pid N)"). Flag one as **stale** when it has used no CPU for 2 hours (`SERVEX_STALE_SESSION_H`). Use the `idle_since` the monitor already keeps per process, and count its children's CPU too.
- Add `stale: true` and `idle_h` to that group in `/api/processes`.
- Add `sessions: {n, stale, stale_mb}` at the top level.
- Add one clause to `line()`.
- **Never kill a session.** The owner closes them.
- On the Live card's Processes section, a stale session row gets a visible "stale · idle 5 h" badge. Add a line under the totals: "3 VS Code conversations idle over 2 h (1.2 GB): close them in VS Code".

## 4. Games: close one only when the PC is idle AND RAM is tight

The owner's exact rule: close StarCraft (and similar) ONLY when the PC has been idle (no keyboard or mouse, read with `GetLastInputInfo`) for more than 30 minutes AND RAM is tight. Never while they are playing. Log every close.

- **`Servex/Games.js`:** a list of game process names. Start with `StarCraft.exe`, `SC2.exe`, `SC2_x64.exe`, `Battle.net.exe` (the launcher counts), overridable by `SERVEX_GAMES` (comma list).
- **Every minute:** read idle time through the hidden PowerShell the monitor already runs, or one short hidden call. It is `GetLastInputInfo` via `Add-Type`.
  - ⚠ Servex runs as the owner's own user in session 1, so the call sees the real console input. Check this: print the idle seconds once and confirm it resets when the mouse moves (it will, since the owner is working).
- **Close** only when ALL of these hold:
  - idle > 30 min (`SERVEX_GAME_IDLE_MIN`);
  - free RAM < 6 GB (`SERVEX_TIGHT_MB`, from `servex.processes.now.free_mb`);
  - a listed game is running.
- **Closing:** close gracefully first (`CloseMainWindow` via PowerShell). Only if it is still alive 60 s later, end it with `taskkill /PID`. Close only the pid you just read; never by name.
- **Logging:** each close is one line in the `processes` log (`type: "game-closed"`: name, pid, idle_min, free_mb, graceful) and goes under `games_closed` in `/api/processes`.
- `SERVEX_CLOSE_GAMES=0` only logs what it would do. The default is ON, because the owner allowed it. Keep the decision a pure function you can test.

## 5. Commit charge (added 16:20)

Add the machine's commit charge to `/api/processes` (`commit_mb`, `commit_limit_mb`, from the same hidden PowerShell read: `Win32_OperatingSystem` TotalVirtualMemorySize minus FreeVirtualMemory). The pagefile is the overflow, so this shows pressure that free RAM hides. Show it on the Live card's Processes totals as "commit 41 / 48 GB".

## Proof

- Add checks to `Servex/processes.test.mjs`:
  - a session idle 3 h is stale, and one idle 1 h is not;
  - the game rule closes only with idle > 30 AND tight RAM;
  - it never closes at idle 29, at 8 GB free, or with no game running.
- `node Servex/processes.test.mjs` passes.
- **The Live card:** a headless Playwright shot at 1920 against a sample with a stale session. Intercept `**/api/processes*`, and start from the real `http://localhost/api/processes` saved to the scratchpad, edited. Use Playwright through `Server/browser.mjs` (`import { browser, close }`).

When done, commit and write `pm-idle-report.md` in `public/framework/ai/2026-09-30/process-monitor/idle/` (MAIN checkout: report and shot only). Say what was built, show the shot, and say what was left. Reply to your parent in one line. Never write the owner's name anywhere. Every spawned process uses `windowsHide: true`. Never drive the owner's open browser tabs.
