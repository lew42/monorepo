# Getting https on the LAN, so a phone's microphone works

**Nothing on this machine was installed to write this page.** This is a proposal — three
ways to do it, the recommended one first, with the exact commands for when the owner
decides to run one. All three need the owner's own choice before anything changes.

## Why this is needed at all

A browser only ever hands a page the microphone on a **secure context**. That means
either a real `https://` address, or one of a short, fixed list of addresses every
browser treats as secure even over plain `http://`: `localhost`, `127.0.0.1`, and any
name ending in `.localhost`. A phone opening this site by its LAN address — something
like `http://10.0.0.135:8137` — is on NONE of those, so the browser makes
`navigator.mediaDevices` simply not exist, silently. That is exactly what caused the
owner's bug: the "listening" sound played, but nothing was really listening, and no
error explained why (traced and fixed in `ai/2026-09-29/mobile-nav/` — see this
module's own `Dictate.js`, `insecure_context_message()`). Getting an address the phone's
browser will call secure is the only real fix; nothing in the app's own code can work
around a rule the browser enforces before any of this app's code even runs.

**One more thing worth knowing:** the `/whisper/inference` proxy this same-origin trick
relies on (`Server/plugins/Whisper.js`) is reachable by anyone on this Wi-Fi, with no
login and no check of who is asking — fine for a dev-only server nobody outside the
house can reach, but it does mean any device on the same network can use this
machine's GPU to transcribe audio through it, not only the phone this was set up for.

## Recommended: `mkcert` — a private certificate authority for this LAN

**What it is, in plain words.** A real `https://` certificate normally has to be signed
by an authority every browser already trusts (that's what costs money and needs a real
domain name). `mkcert` is a small, free, open-source tool that makes your OWN
computer into a trusted authority, just for your own devices — one command creates the
authority, one more command creates a certificate for this machine's LAN address, and
then you tell your phone to trust that authority too. After that one-time setup, this
address is `https://` for every device you trusted it on, for as long as this machine
keeps that same LAN address (which a home network almost always does).

**Why this one, over the other two below:** it is the only option that (a) needs no
re-setup when the dev server's PORT changes (a cert covers the whole address, any port),
(b) works in every browser on the phone, not just one, and (c) never depends on an
outside service being up. The one-time cost is trusting one certificate on the phone,
which takes about a minute.

**Exact steps:**

1. Install `mkcert` on this Windows machine — a global tool, not an npm package, so it
   does not touch this repo at all:
   ```
   winget install FiloSottile.mkcert
   ```
   (or `choco install mkcert` with Chocolatey, or download the `.exe` directly from
   <https://github.com/FiloSottile/mkcert/releases> if neither is set up.)

2. Create the local authority once, and a certificate for this machine's LAN address
   (replace `10.0.0.135` with whatever `ipconfig` shows for this machine's Wi-Fi
   adapter — it is usually stable on a home network):
   ```
   mkcert -install
   mkcert 10.0.0.135 localhost 127.0.0.1
   ```
   This writes two files, `10.0.0.135+2.pem` (the certificate) and
   `10.0.0.135+2-key.pem` (its private key), in the folder you ran it from.

3. Point the dev server at those two files so it serves `https://` instead of `http://`.
   This repo's `Server/` does not do this today — that is a separate, small change
   (reading an `HTTPS_CERT`/`HTTPS_KEY` env var and calling Node's `https.createServer`
   instead of `http.createServer` when they are set) left for whoever picks this up,
   since it touches `Server/` and this task's fence does not include it.

4. Trust the SAME authority on the phone. `mkcert -install` (step 2) printed where its
   root certificate file is (a `rootCA.pem`, under a folder `mkcert -CAROOT` prints) —
   send that one file to the phone (AirDrop, a USB cable, or a private link) and open
   it there; Android and iOS both ask "install this certificate?" and walk through it.
   This step is the only one that touches the phone at all, and it is a one-time thing
   per phone.

Once steps 3 and 4 are done, `https://10.0.0.135:<port>` opens on the phone with no
warning, and the microphone works exactly as it does on this machine.

## Alternative: a Chrome flag, zero setup, zero certificate

Chrome has a flag that tells it "treat this one address as secure even over plain
http" — perfect for a quick test, with no certificate and nothing to install:

1. On the PHONE, open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.
2. Type the exact address, including the port, e.g. `http://10.0.0.135:8137`
   (comma-separate more than one if several ports are used).
3. Set the flag to **Enabled**, then tap **Relaunch** at the bottom of the screen.

**Trade-offs against `mkcert`:** this only affects Chrome on that one phone (Safari,
Firefox, or a second phone would each need their own flag set); the exact address —
including the PORT — has to be re-typed every time the dev server's port changes, which
happens whenever this repo's tasks use a different private worktree port; and it is a
setting on that one phone's Chrome, easy to lose track of. Fastest to try RIGHT NOW,
worst to depend on for the long run.

## Alternative: a tunnel (Cloudflare Tunnel, ngrok, Tailscale)

A tunnel service gives this dev server a real public (or private-network-only, for
Tailscale) `https://` address with a certificate signed by an authority every browser
already trusts — no flag, no certificate to install on the phone at all. The trade-off
is a new account and a new tool to run (`cloudflared`, `ngrok`, or the Tailscale client),
and — for the fully public tunnels (Cloudflare, ngrok) — the dev server becomes reachable
from the whole internet, not just this LAN, while the tunnel is running. Tailscale avoids
that specific trade-off (its addresses only work between devices on the same private
"tailnet"), at the cost of installing the Tailscale client on both this machine and the
phone. Reach for this option only if testing from OUTSIDE the home LAN is ever needed;
for "my phone, my own Wi-Fi", it is more moving parts than `mkcert` for no real gain.

## What this page does NOT cover

Wiring the dev server itself to actually serve `https://` (step 3 above) — that is a
`Server/` change, outside `ux/Dictate`'s own fence for this task, and belongs to whoever
next works on `Server/`. This page is the research and the recommendation; the wiring is
the next, separate piece of work.
