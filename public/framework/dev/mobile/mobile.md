# Open this site on your phone

| On the phone | Works? |
|---|---|
| Pages, nav, reading | ✅ |
| Whisper transcription (upload-based) | ✅ |
| Live reload while editing | ❌ silently retries |
| Microphone (live dictation) | ❌ browser refuses it |

Live reload fails because the dev socket only accepts connections from this machine itself (it
can run shell commands). The microphone fails because only `https://` or a `localhost` address
gets a real microphone — a phone's `http://<LAN-IP>:...` is neither.

## 1. Find the address
Run `ipconfig` on this PC and read the **IPv4 Address** under your Wi-Fi adapter (something like
`10.0.0.135`).

## 2. Open it on the phone
Find the site's own port — `node server.js` prints it when it starts, or ask Servex
(`list_servers`); it changes per worktree, so there's no one number to memorize. Type
`http://<address>:<port>/` on the phone, on the same Wi-Fi.

`monorepo.localhost` will **not** work on the phone. Only this machine answers `.localhost`
names (next section).

A worktree's server answers only this machine, except a worktree waiting for review whose task
asked for a preview: its link is on the merge card and in the task's log
([worktree-preview.md](/Servex/doc/worktree-preview.md)).

## 3. Fix the microphone
A browser will not hand out `navigator.mediaDevices` on a plain `http://` LAN address — the
browser's own rule, not a bug in this app. Full detail and exact commands:
[ux/Dictate/doc/https-lan.md](/framework/ux/Dictate/doc/https-lan.md). Short version:

1. **Recommended: `mkcert`.** Make this machine its own trusted certificate authority (one
   command), trust it once on the phone, and every port on this LAN address becomes `https://`
   for good. Needs a small `Server/` change (not yet made) to actually serve `https://`.
2. **Fastest right now: a Chrome flag.** On the phone, `chrome://flags/#unsafely-treat-insecure-origin-as-secure`,
   add the exact `http://<address>:<port>`, enable, relaunch. Only that phone's Chrome, and it
   has to be re-typed if the port changes.
3. **A tunnel** (Cloudflare Tunnel, ngrok, Tailscale) — more moving parts, only worth it to reach
   this site from outside the house.

## Why `.localhost` fails on the phone
Servex's own proxy (what `monorepo.localhost` and `servex.localhost` resolve to) binds **only**
`127.0.0.1` and `::1` — this machine talking to itself — on purpose. Nobody else on the Wi-Fi can
reach Servex's dashboard or its dangerous dev-socket commands that way.

The site's actual dev server (`Server/server.js`) binds every network interface (`0.0.0.0`) by
default. That's *why* the LAN address works at all: it's a different, plainer server, reached
directly, bypassing Servex.

## What's hard-coded to localhost
- `dev/Socket/Socket.js` refuses to connect off `localhost` on purpose (it carries shell-command
  RPCs) — a documented safety rule, not a bug: [doc/localhost.md](/framework/dev/Socket/doc/localhost.md).
- `ux/Dictate/Dictate.js`'s `whisper_base()` already resolves correctly for a phone: on
  `localhost` it calls `whisper-server` directly at `127.0.0.1:8178`; from anywhere else (a
  phone) it instead calls `location.origin + "/whisper"`, so the *site's own* address proxies the
  request through to whisper. This one was already correct — no fix needed.
- No other `http://localhost` or `127.0.0.1` string was found hard-coded into a page the browser
  loads; everything else resolves against `import.meta` or the page's own origin, as the house
  rule requires. Full grep results and tested Whisper latency: `ai/sessions/2026/10/08/mobile-voice-access/mobile-voice-access/findings.md` (this task's own folder — not a routed page).
