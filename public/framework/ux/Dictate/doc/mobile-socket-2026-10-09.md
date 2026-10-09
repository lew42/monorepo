# Mobile: why the phone said "socket connecting" (2026-10-09)

**Short answer.** Whisper is not a socket and it works from a phone. The "socket" in the old status line was the dev site's live-reload socket, which the server refuses off the PC on purpose. The real thing that stops dictation on a phone is that the browser hides the microphone on an `http://` LAN address.

**Measured** (headless Chromium, "Pixel 7" profile, page opened as `http://10.0.0.135:<port>/framework/ext/Refine/`, the PC's LAN address):

| Check | Result |
|---|---|
| `isSecureContext`, `navigator.mediaDevices` | `false`, `false` (so no mic) |
| Whisper | `connected, 0.1 s` through the same-origin `/whisper` proxy |
| Mic after pressing it | `error: this address is not https or localhost, so the browser hides the mic` |
| Dev socket | refused by `Server/` on purpose (`loopback()` guard, [`Server/doc/mobile-lan.md`](/Server/doc/mobile-lan.md)) |

**What changed.** The status line no longer prints the socket (phase 1), so nothing says "waiting" for a thing dictation never needed. A refused mic now reads as a sentence with the reason. **What is not fixed:** a phone can only dictate over `https` or `localhost`; the how is [`https-lan.md`](https-lan.md), and it needs the owner's choice of certificate method.
