# Phone load, before and after — the card page in `experiment-3-models-read-the-dictate-spa`

Same page both times: `/framework/ai2/2026/09/29/experiment-3-models-read-the-dictate-spa/`, on
the live site (`http://monorepo.localhost`), headless Chrome throttled with Chrome DevTools'
own official network presets. 3 runs each, median reported (raw runs are in `task.jsonl`).

| Throttle | When | ms to table | Bytes | `directory.json` fetched? | Requests |
|---|---|---|---|---|---|
| Fast 3G | Before | never in 90s (borderline ~75–95s across repeat tries — see below) | 1.54 MB | No | not tracked |
| Fast 3G | After | never in 90s, same as before | 1.55 MB | No | 422 |
| Fast 3G | **After, final** (request-storm fix + files.jsonl move) | never in 90s, still unchanged | 1.55 MB | No | 430 |
| Wi-Fi-like | Before | 1.7s | 9.6 MB | **Yes**, ~530 KB | not tracked |
| Wi-Fi-like | After | 1.4–1.7s (about the same) | 14.1–17.4 MB (**up**, not down) | **No** | 1,321–2,197 (very high, and swings a lot run to run) |
| Wi-Fi-like | **After, final** (request-storm fix + files.jsonl move) | 1.6s (about the same) | **4.8 MB — down from both earlier rows, best number yet** | No | **654 — cut from 1,300–2,200 down to about half, and now stable run to run** |

## The one-sentence read

The request-storm fix worked on Wi-Fi: bytes are down to 4.8 MB (the best of all three rows, and
lower than even the original 9.6 MB with `directory.json`) and requests are cut to a stable 654 —
but Fast 3G is unmoved, still 430 requests and never showing the table inside 90 seconds, so the
next place to look is why a slow connection still queues hundreds of small requests even after
this fix.

## Detail

- **Fast 3G really never shows the table by 90s — before or after.** A screenshot-every-15s
  check found it missing through 60s, appearing around 75–95s (it varies by run). The merge
  didn't change this.
- **Why:** at 90s, ~150 tiny requests are still queued — one `page.jsonl` per `ai/` task folder.
  Fast 3G's 562ms round-trip, times hundreds of small sequential requests sharing one origin's
  connection limit, costs more than the bytes suggest. (A stream connection also shows "pending"
  forever by design — that one's not the cause.)
- **The first AFTER run flagged a regression — the request-storm fix and files.jsonl move fixed
  it on Wi-Fi.** One `directory.json` fetch had briefly become 1,300–2,200 unstable requests and
  more bytes than before; after this second round of work, Wi-Fi is down to a stable 654 requests
  and 4.8 MB — better than the original `directory.json` number on both counts.
- **Fast 3G didn't move.** Still 430 requests, still never shows the table inside 90 seconds,
  before or after this latest fix. The goal was one folder's `page.jsonl` "for free," with deeper
  folders loaded on demand; on a slow connection something is still queuing hundreds of small
  requests. Worth a look — likely the ai2 card view's own request pattern, not the `page.jsonl`
  mechanism itself.
- BEFORE's request count wasn't recorded (that column was added after), and the site is already
  merged, so an exact BEFORE count can't be re-taken. The pre-merge diagnostic did already show
  the same shape — 150+ small pending requests at Fast 3G's 90s mark.

## Method

Probe: `pfl-measure.mjs` (Playwright + CDP `Network.emulateNetworkConditions`), in the session
scratchpad, not the repo. Presets used (Chrome DevTools' official values, since the earlier task
this reuses named "Fast 3G"/"Wi-Fi-like" but never actually ran or recorded numbers for them):

- Fast 3G: 1.6 Mbps down, 750 Kbps up, 562.5 ms round-trip latency
- Wi-Fi-like: 30 Mbps down, 15 Mbps up, 2 ms round-trip latency

"ms to table" = time from navigation start until a `<table>` with more than one row is visible.
Full raw numbers, the diagnostic screenshots, and the Wi-Fi top-5-bytes breakdown are logged in
this task's `task.jsonl`.

