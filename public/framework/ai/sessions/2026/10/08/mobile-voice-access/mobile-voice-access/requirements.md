# Mobile access + web transcription — find what is broken, document the setup

Owner (2026-10-08, dictated): the owner will not read chat; keep replies minimal. Wants the **web-based transcription working again** (it was better, but had many microphone errors: it would not connect; sometimes it seemed to be the Whisper part, sometimes microphone access). On the **phone** the site is reached by **IP + port** (not `monorepo.localhost`), and the owner does not know how that is set up (any special network/bypass settings?). Being able to open the site locally on the phone matters. Asks for a **page describing the mobile setup** ("maybe pretty basic"). Suspects it may be a bigger problem than they know: each domain is its own origin, so on a different IP:port are URLs mangled or misaligned — e.g. something hard-coded to `localhost`?

Budget $4, Sonnet, medium effort. Batch reads; grep for the lists, read shortlists.

## Questions to answer with evidence (verify in code and by running, not from docs)
1. **How does the phone reach the site today?** Servex proxy on port 80 / `Server/` on 8137 / the LAN IP `10.0.0.135:8137` — what binds to 0.0.0.0 vs loopback, what Windows firewall rule exists, what the phone must be on. Read `Servex/doc`, `Server/doc`, memory-style notes in `public/framework/ai/handover.md`.
2. **Hard-coded hosts:** grep `public/` and `Server/`, `Servex/` for `localhost`, `127.0.0.1`, `:80`, `:8090`, `monorepo.localhost`, absolute `http://` URLs, `ws://`. For each: does it break when the page is loaded from `http://<LAN-IP>:<port>/`? (Resolve URLs against `import.meta`, not the document, is a house rule — find violations.) Servex calls from the browser (`:8090` etc.) must use the page's own hostname.
3. **Microphone:** `getUserMedia` only works in a *secure context* — `https://` or `localhost`/`127.0.0.1`. On `http://10.0.0.135:8137` the browser blocks the mic outright; this is the likely main cause of "microphone errors" on the phone. Confirm how Dictate (`ext/...Dictate`) requests the mic, what error it shows, and whether a fix exists: HTTPS on the LAN (mkcert / a local CA, or `tailscale cert`, or a Cloudflare tunnel — the owner has Cloudflare login pending), or Chrome's per-device flag `unsafely-treat-insecure-origin-as-secure`. Recommend ONE default and name the alternative.
4. **Whisper:** how transcription is wired (local `whisper-server` via Servex, the web speech API, other). Does it fail separately from the mic? Test the server end with a short wav if feasible; report latency and failure modes.

## Deliverables (numbered)
1. A page `public/framework/dev/mobile/` (or the right parent per its readme chain; a parent's `children:` must name it; use the `create_page` tool + `new-page` skill): *Mobile setup* — one screen: how to open the site on the phone, what to check when it fails, what is hard-coded. Show, don't tell.
2. `findings.md` in the task dir: answers 1–4, each with evidence, and a ranked fix list.
3. Fix what is small and safe (a hard-coded host → page-relative) in a worktree through the merge gate; list the rest.
4. Anything contingent on the owner (HTTPS choice, firewall prompt that needs admin) → a `Note:` card on the AI board AND one line in findings.md.

## Rules
One-sentence chat replies. Commit your own work with attribution; no loose files. Land with `finish-task`.
