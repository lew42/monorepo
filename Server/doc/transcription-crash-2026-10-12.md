# Why dictation broke and the page would not reload (2026-10-12)

**Cause: every Servex restart killed `whisper-server`, and the model takes 2–14 s to load again.**
Servex ran Whisper as an attached child, so it died with Servex. Dictate posts to `/whisper/inference` every ~1.5 s, has no retry, and that call fails until Whisper is back. Agents restart Servex all day. The dev server was never the problem.

## Evidence

| What | Number |
|---|---|
| Servex restarts vs Whisper starts (`monorepo.jsonl` "adopted" lines vs `whisper.jsonl` "started" lines), 10-08 / 10-09 / 10-11 | 13 = 13, 11 = 11, 1 = 1 |
| 10-12 | 10 restarts, 21 Whisper starts (the other 11 are voice tests killing Whisper on purpose, `exited (code 1)` 05:10–06:03) |
| Model reload after a restart (`whisper.jsonl`): 12:30 / 12:56 / 12:58 | about 14 s (cold) / 2 s / 6 s |
| The dev server survives a restart (detached, adopted): pid 31488 ran 10-09 to 10-12 | 0 restarts, 0 crashes in Servex's `monorepo` log |
| Dictate + reload loop, private dev server + private Whisper, 10 min with a file written every 700 ms (`node Server/TranscribeLoop.mjs --minutes 10 --churn`) | **0 failures**: 340 dictations (p50 170 ms, p95 323 ms), 200 page reloads (p95 12 ms); dev server at most 5% CPU, 94 MB, 305 handles; Whisper at most 53% CPU, 456 MB |

So the loop that reproduces dictation and reload passes on the dev server. What fails is Whisper going away.

## The perf note's items ([`perf-2026-10-09.md`](./perf-2026-10-09.md)) are not the cause

- Dev-server processes: 41 then, 12 now. The loop above ran with 12 alive and a private server at 5% CPU.
- Directory rebuilds on 36% of requests: off since 2026-10-09 ([`directory-off.md`](./directory-off.md)).
- `monorepo.out` 36 MB then, 41 MB now (it grows about 1.5 MB a day, the per-message logging is gone): a reload still answers in 12 ms at p95.

## The fix

- **`Servex/Servex.js` `whisper()`: `detach: true`.** Whisper now outlives Servex the way the dev servers do, and `Process.Whisper.start()` (`Servex/Process.js`) adopts the running one instead of treating it as a stranger. Proof on a private port, with a real model: `node Servex/whisper-detach.test.mjs` (runner A starts it, A goes away, runner B adopts the same pid in 2 ms).
- Its output goes to `logs/whisper.out`/`.err` and is tailed into `whisper.jsonl` as before.
- The first restart that loads this code still reloads Whisper once (the old Servex owns it); every restart after that leaves it running.
- **`Server/plugins/HttpsLan.js`** (found while reproducing): the https twin listens on `PORT + 10000`, so a worktree dev server on a random port above 55535 threw `RangeError` and died right after "listening". It now skips https with a log line. This is not the owner's crash (the main site is on 3104), but it explains worktree and pool servers that "never answered".

## After

Same dictate + reload loop (`--against http://127.0.0.1:3104`, 2.5 min) run across a live `restart_servex` with the fix loaded:

| | Before (old code) | After |
|---|---|---|
| Whisper on a Servex restart | killed, started again (`whisper.jsonl`: "started" at 12:56:03 and 12:58:57, each a restart) | **kept**: pid 41348 started 13:03:19, "adopted" at 13:04:23 by the new Servex, no model reload |
| Dictations during the restart | fail until Whisper is back (2–14 s) | 85 sent, **0 failed** (p95 346 ms) |
| Page reloads during the restart | | 50, **0 failed** |

The before-side of this table comes from the logs, not the loop: two attempts to run the loop through a restart on the old code were killed with the restart itself (the loop was started from a shell Servex took down), and the 10-minute loop on the private servers is the dev-server control (0 failures).

The pid file is `procs/whisper.json` in the Servex home; `stop_server whisper` still kills it by pid.

## Reproduce

`node Server/TranscribeLoop.mjs --minutes 10 [--churn]` runs its own private dev server and Whisper on free ports, then writes `Server/logs/transcribe-loop-*.json` (every request, every CPU/RAM/handle sample). `--against <origin>` runs the same two loops against a site that is already up. Switches the private run needs: `WHISPER_PORT` (Whisper.js) and `NO_PAGEFILES` (PageFiles.js, so the run does not rewrite `files.jsonl`).
