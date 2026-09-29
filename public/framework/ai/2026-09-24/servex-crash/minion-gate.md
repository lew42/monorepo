# Minion brief — the port-80 gate

Load the `minion` skill first.

**The owner's goal (verbatim from the brief):** "the owner reloaded /framework/ai/ and got an error page. The goal is that the owner never sees one." … "A restart or a crash should not show an error page."

**Why it happens.** Servex (`Servex/Servex.js`) owns port 80 through `Servex/ReverseProxy.js`. When Servex dies (a crash, or `node Servex/sustain.mjs --restart`), port 80 has no listener for ~1–2 s and Chrome draws its own "connection refused" page. The monorepo dev server is Servex's child and dies with it too (libuv's job object), so after Servex returns, the first request finds port 3104 refused and gets the "Starting monorepo…" page.

**Your fence:** the worktree `C:/Code/lew42/worktrees/servex-crash` only — files `Servex/gate.mjs` (new), `Servex/ReverseProxy.js`, `Servex/Servex.js`, `Servex/sustain.mjs`, `Servex/readme.md`, and a proof script in the session scratchpad named `servex-crash-*.mjs`. Never touch the main tree `C:/Code/lew42/monorepo`, never run `sustain.mjs` (no --restart, --stop, or keeper), never kill any process you did not start, never bind port 80, 8090, 8079, or 3104 in a test. Commit on branch `worktree/servex-crash` when done (message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).

## Deliverables

1. **`Servex/gate.mjs`** — the smallest thing that works, ~60 lines, house comment style (a block comment saying what and why, like sustain.mjs). `node Servex/gate.mjs [listen=80] [target=8079]`:
   - listens on `127.0.0.1` and `::1` (ignore an `::1` bind failure; see ReverseProxy.js for why both);
   - for each client socket: connect to `127.0.0.1:<target>`; on refusal retry every 200 ms until 20 s have passed, then destroy the client; once connected, pipe both ways; either side closing/erroring destroys the other; bytes the client sends while waiting must not be lost (pause, then pipe);
   - on `EADDRINUSE` for 127.0.0.1, exit 0 quietly (another gate already has it — this makes launching idempotent);
   - once listening, write `{pid, listen, target, started}` to `place("gate.pid.json")` (import `place` from `./home.js`); log one line per start to stdout.
   - plus a `launch()` export (or a `--launch` mode) that starts a gate **so it survives Servex dying and survives `taskkill /pid <servex> /t /f`**: `/t` walks parent pids, so a detached child alone is not enough — use the double-spawn orphan trick (spawn `gate.mjs --orphan` detached, which spawns the real gate detached + `windowsHide: true`, stdio appended to `place("logs","gate.log")`, `unref()`, and exits at once). Verify it with `wmic`/`Get-CimInstance Win32_Process` that the gate's parent pid is dead.
2. **`Servex/Servex.js`**: the proxy binds `this.proxy_internal ??= Number(process.env.SERVEX_PROXY_INTERNAL) || 8079` (add it to PortRegistry `reserved`), and Servex launches the gate for `this.proxy_port → this.proxy_internal` at boot, and re-launches it every 30 s if a TCP connect to 127.0.0.1:`proxy_port` is refused. `SERVEX_NO_GATE=1` = old behaviour (proxy binds proxy_port directly). Also at boot: `process.report.directory = place("logs","reports"); process.report.reportOnFatalError = true; process.report.reportOnUncaughtException = true;` with a two-line comment naming the 0xC0000409 crashes (2026-09-23 ×2, 2026-09-24) that left no trace. Update the "Servex up" line / console lines so they still say the public proxy port.
3. **`Servex/ReverseProxy.js` `failed()`**: when `missing(name)` returns true and the request is GET or HEAD, don't answer at once — poll a TCP connect to the target port every 250 ms for up to 15 s and, when it answers, `this.proxy.web(req, res, {target})` again; only if it never answers serve `starting_page` as today. Guard against double-handling (`res.headersSent`, a closed client).
4. **`Servex/sustain.mjs`**: `--stop` also kills the gate (read `gate.pid.json`); `--status` shows it. Add `--report-on-fatalerror --report-directory=<logs/reports>` to the keeper's spawn of index.js as well (for when the keeper itself is next restarted). Do not change anything else about the keeper.
5. **`Servex/readme.md`**: one or two plain sentences on the gate, and where crash reports land. Short.
6. **The proof** — `servex-crash-proof.mjs` in the scratchpad `C:/Users/mike/AppData/Local/Temp/claude/C--Code-lew42-monorepo/32acb0a6-b886-4e7d-93da-da80c1c64a8c/scratchpad/`. It must NOT start a real Servex (that would spawn real Claude agents). Instead:
   - a "fake Servex" child script that imports the worktree's `ReverseProxy.js` on internal port 18079 with `ports: {monorepo: 13104}` and a `missing()` that spawns the worktree's dev server (`node server.js` in the worktree root, env `PORT=13104 HOST=127.0.0.1 NO_WHISPER=1 NO_SUPERVISE=1`) as ITS child — so killing the fake Servex tree kills the dev server too, exactly like the real thing; it also starts the dev server at boot;
   - a gate on 18080 → 18079 (launched with the same orphan launcher);
   - a mini keeper loop in the proof that restarts the fake Servex 1 s after it exits;
   - headless Chromium (`import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js"`) loading `http://monorepo.localhost:18080/framework/ai/` in a loop (goto, wait for load, short pause) for ~90 s, while the proof kills the fake Servex tree with `taskkill /pid <pid> /t /f` every ~12 s (at least 6 kills).
   - Count error pages: a goto that throws, a non-2xx status, a response carrying `x-servex-starting`, or a page whose title is empty/"Starting…". Print loads, kills, errors, and the worst load time. **Pass = zero error pages.** Run the same proof once with the gate disabled (proxy straight on 18080, no retry in failed()) to show the old behaviour fails — that number is the before.
   - Also, while it runs, watch whether the fake Servex ever exits with 3221226505 on its own (a reproduction of the crash) and report it.
   - Clean up every process you started at the end.

Report back: the before/after numbers, the worst load time, whether any 0xC0000409 happened, the commit hash, and anything that did not work. Plain sentences.
