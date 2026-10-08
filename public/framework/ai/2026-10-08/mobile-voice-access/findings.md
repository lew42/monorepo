# Findings — mobile access + web transcription

New page: [`/framework/dev/mobile/`](/framework/dev/mobile/) — the one-screen version of this.

## 1. How the phone reaches the site today
- The dev server (`Server/server.js`) binds `0.0.0.0` by default (`listen(port, host = process.env.HOST || '0.0.0.0')`), so any device on the same Wi-Fi can reach it directly by this machine's LAN IP and that server's own port — confirmed live: `netstat` shows the main site listening on `0.0.0.0:3104`.
- Servex's own reverse proxy (what `monorepo.localhost` / `servex.localhost` resolve to, port 80) and its dashboard (port 8090) bind **only** `127.0.0.1`/`::1`, on purpose (`Servex/ReverseProxy.js` line 44 comment: "the old Servex listened on every interface" — changed for security, since it can run shell commands). This is *why* `.localhost` names never work on the phone: nothing but this machine can reach that proxy at all.
- A Windows Firewall inbound rule named "Node.js JavaScript Runtime" already exists and allows this (checked with `netsh advfirewall firewall show rule name=all dir=in`) — nothing to set up there.
- Verdict: the phone reaching the site by `IP:port` isn't a workaround, it's the only path that was ever going to work, given the loopback-only proxy. No code change needed here.

## 2. Hard-coded hosts — grepped `public/`, `Server/`, `Servex/` for `localhost`, `127.0.0.1`, absolute `http://`/`ws://`
Already fixed, on a prior task (`ai/2026-09-29/mobile-nav/`):
- `ux/Dictate/Dictate.js` `whisper_base()` and `audio/Transcriber/Whisper.js` / `WhisperSegments.js`: resolve to `127.0.0.1:8178` directly only when already on `localhost`; otherwise use `location.origin + "/whisper"` so the *phone's own address* proxies through (`Server/plugins/Whisper.js` routes `/whisper/*`).
- `core/Page/ext/Inbox/servex.js` `servex_base()`: same pattern, via `dev/servex_url.js` (`<origin>/servex`, proxied by `Server/plugins/ServexProxy.js`), not a bare `127.0.0.1:8090`.
- The only *literal* hard-coded `http://127.0.0.1:8178` / `:8090` left in `public/framework/ux/Dictate/variants/v1/Dictate.js` is an explicitly **frozen snapshot** (its own header comment says so) that nothing imports — not live code, not a bug.
- `dev/Socket/Socket.js` (live reload + shell RPC) refuses to connect off `localhost` on purpose, documented at `dev/Socket/doc/localhost.md` — a deliberate safety rule, not something to "fix".
- Nothing else hard-codes a host the browser would load off this machine. (Sandbox/demo files under `imagine/`, `layouts/labs/`, `core/new/1/` reference `localhost` only in comments or their own standalone throwaway servers — out of scope, not site code.)

**On the port numbers used above:** `8137` (the owner's own example, and `https-lan.md`'s) is this
*worktree's* private dev-server port (`Servex/keep.json`) — every worktree gets a different one.
The main site itself is currently on `3104` (`netstat` confirms `0.0.0.0:3104 LISTENING` right
now). Both numbers are correct for their own server, and both change over time, which is why the
page tells the reader to find the live number rather than naming one.

## 3. Microphone — the real cause of "it would not connect"
`getUserMedia` only exists on a secure context: `https://`, or the browser's special-cased `localhost`/`127.0.0.1`/`*.localhost`. A phone on `http://10.0.0.135:<port>` is none of those, so `navigator.mediaDevices` is simply `undefined` — silently, with no error from the browser. This was already diagnosed and fixed for messaging (not for the underlying cause, which only HTTPS fixes): `Dictate.js`'s `insecure_context_message()` now catches it with one line *before* anything else runs, so the UI shows "The mic needs https or localhost…" instead of a dead "listening" state with no sound ever really captured.
- Full write-up and three ranked options already exist: [`ux/Dictate/doc/https-lan.md`](/framework/ux/Dictate/doc/https-lan.md) (written 2026-09-29, still accurate — re-verified today).
- **Recommended: `mkcert`** (a private certificate authority, trusted once on the phone, covers every port forever). Needs one small, still-unmade `Server/` change: read `HTTPS_CERT`/`HTTPS_KEY` env vars and call `https.createServer` instead of `http.createServer` when set. Confirmed today: `Server/server.js` has no such branch yet — this is the one real gap.
- **Fastest right now, zero setup:** the Chrome flag `unsafely-treat-insecure-origin-as-secure` on the phone, scoped to that one address — good for "does it work at all", loses its setting if the port changes.
- Alternative (skip for now): a tunnel (Cloudflare/ngrok/Tailscale) — more moving parts, only worth it to reach the site from outside the house.

## 4. Whisper — wired, and separate from the mic problem
- `whisper-server` (whisper.cpp) is spawned by `Server/plugins/Whisper.js` only on the owner-facing server (no `PORT`, or `PORT=80`), restarted up to 3 times on crash, never managed if something else is already answering the port.
- `/whisper/inference` is a plain HTTP POST (no secure-context requirement) and is reachable from the phone today over LAN, per `Server/doc/mobile-lan.md`'s `lan()` guard — this already works, and is why audio UPLOAD-based transcription (not live mic capture) works on the phone right now.
- Tested live this run with a real 7-second clip (`ai/2026-09-22/whisper-servex/clip.wav`), no phone needed: a direct POST to `whisper-server` (`http://127.0.0.1:8178/inference`) transcribed it correctly in **0.77s**; the same clip through the same-origin proxy a phone would actually use (`http://127.0.0.1:3104/whisper/inference`) came back correct in **0.48s**. Both succeeded with no failure mode observed — the server side is working and fast; every reported "microphone error" traces to the browser-side secure-context block in §3, not to Whisper.
- `Server/doc/mobile-lan.md` and `ux/Dictate/doc/https-lan.md` already document the one real caveat: `/whisper/inference` has no login check, so anyone on the same Wi-Fi can use this machine's GPU through it — fine for a home network, worth knowing.

## Ranked fix list
1. **Wire `Server/` to serve HTTPS** when `HTTPS_CERT`/`HTTPS_KEY` are set (unblocks the mic on the phone for good, once the owner runs `mkcert`) — a `Server/` change, deliberately left for a task that owns `Server/` (this task's fence is docs + the small safe fixes only).
2. Nothing else needed — the hard-coded-host hunt (deliverable 3) found zero *live* bugs to fix; everything flagged in the brief was already fixed by `ai/2026-09-29/mobile-nav/` and verified true today.

## Deliverable 3 — "fix what is small and safe"
No small, safe, unfixed hard-coded-host bug was found (see §2). Nothing to merge through the gate for this deliverable; it is a clean verdict, not a skipped step.

## Deliverable 4 — contingent on the owner
- **HTTPS choice** (deliverable 4): the owner has to decide whether to run `mkcert -install` (recommended) or just flip the Chrome flag on the phone for now, and whoever does item 1 above needs that decision before writing the `Server/` change. Posted as a `Note:` card: [2026/10/08/mobile-mic-needs-an-https-choice-mkcert](/framework/ai/2026/10/08/mobile-mic-needs-an-https-choice-mkcert/).
