# servex-hardening — the five small things today's minions named and could not touch

Minion: Sonnet, effort high. Session id `a1178deb-0bc4-428c-94ca-16803f91b6ac`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `code`. Private
port **8097**. Servex is RUNNING (`node Servex/sustain.mjs --status`; keeper 41708, servex
34312); the fast assistant lives inside it now (`Servex/agents/Assistant.js`).

Each item: the finding, where it was logged, what to do, how to prove it. Fix all five, in
one held batch per tree (Servex/, then v/3), and restart Servex once at the end (`node
Servex/sustain.mjs --stop`, then the hidden launch `powershell -NoProfile -Command
"Start-Process -FilePath node -ArgumentList 'Servex/sustain.mjs' -WorkingDirectory
'C:\Code\lew42\monorepo' -WindowStyle Hidden"`; confirm 8090 and that `assistant-fast` is back
in `GET /agents`; log the PIDs). Never `cmd /c start`.

1. **Servex's loopback guard misses `/api/stream`** (`board-from-events` log). Every route
   refuses a non-loopback caller; this one does not. Apply the same middleware; prove with a
   request whose remote address is not loopback refused (bind test: `curl` against the LAN IP
   from `ipconfig` returns 403 or connection refused, and `127.0.0.1` still streams).
2. **A locked id should refuse a plain `name` or `dispute`, not only a `rename`**
   (`naming-checks` landing; `log-model/events.md` "checks the appender runs"). Add the two
   checks to `Log.append`; extend `Servex/proof-naming.mjs` with two more scenes; 8/8 PASS.
3. **`Servex/readme.md` does not name the assistant** (`prompt-lifecycle` landing). Four lines
   under "The four parts" (it is a fifth): what it is, what it appends, the Prompts view link.
   Also add the `POST/DELETE /api/projects` route (`servex-routes`) to the readme's route list
   if it is missing.
4. **The v/3 deep link double-mounts** (`board-from-events` log line 18: `/framework/ai/v/3/`
   renders `.v3` twice — the ai catalog draws v3 as its default-child preview AND as the
   explicit leaf; `/framework/ai/` draws it once). Find the smallest fix in
   `public/framework/ai/page.js` or `v/3/page.js` (read `ai/2026-09-21/ai-front/` for how V3
   became the front door) so both URLs mount once; prove `document.querySelectorAll('.v3').length`
   is 1 on both, headless on 8097, and that the Days default, the Agents strip and the Prompts
   view still work (three screenshots into `shots/`). Behind the reload hold.
5. **The stray `proof-poster.mjs`/`proof.mjs`/`proof-naming.mjs` at `Servex/` root** — move
   them into `Servex/proof/` with the readme's commands updated; all three still pass from the
   new place (run them; log the three results).

## Fence

`Servex/Servex.js`, `Servex/Log.js`, `Servex/Stream.js`, `Servex/readme.md`, `Servex/proof*.mjs`
→ `Servex/proof/`, `public/framework/ai/page.js`, `public/framework/ai/v/3/page.js` (Edit only),
your task dir. Append-only to `.jsonl`. Not `Servex/agents/`, not `Server/`.

## Length

Landing report: six sentences, one per fix, each with its proof.
