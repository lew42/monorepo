# Phone mic: https on the LAN, decided

**Why:** the owner's top voice need is dictating from the phone, and a phone browser hides the mic on plain `http://10.0.0.135:...` ([https-lan.md](/framework/ux/Dictate/md/doc/https-lan/)). That doc waits on "the owner's choice of certificate method". The mastermind decided (2026-10-12): **a self-signed certificate made with the `openssl` already in Git Bash** (nothing installed), served on an extra https port by the dev server. The owner taps "Advanced → Proceed" once on the phone. **Alternative, recorded:** `mkcert` with its root CA installed on the phone (no warning screen, but it needs an install on the PC and a profile on the phone); it stays in `https-lan.md` as the upgrade.

## Done when
- [ ] A node script (`Server/https-cert.mjs`) makes the key and cert for the LAN IP and `localhost` into `%LOCALAPPDATA%/lew42/` (never the repo), idempotent.
- [ ] The dev server also listens on https on a fixed port when the cert exists (same handlers, same Whisper proxy); http keeps working. Proven on a private port first; one restart through Servex (`restart_server`).
- [ ] Proof: headless Chromium with `ignoreHTTPSErrors` at 400 px at `https://10.0.0.135:<port>/...`: `isSecureContext` true, `navigator.mediaDevices` exists, the try-it walk passes.
- [ ] `try-it.md` step 1 uses the https address and says the one tap; `https-lan.md` records the decision and the alternative. One `owner_note` (kind `needs-you`): "on the phone, open <url>, tap Advanced → Proceed once, then dictate".
- [ ] Note in `STATE.md` the Whisper proxy is open to the LAN (as the doc says); don't widen it.

Sonnet 5.5, medium. Worktree for Server/ code; commit each step; merge. `STATE.md`; land with `finish-task`.
