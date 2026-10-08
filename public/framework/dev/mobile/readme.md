# Mobile — How to open this site on a phone, why the microphone and the socket behave differently there, and what is hard-coded to localhost.

## Index
[mobile.md](./mobile.md) — the one-screen page: a works/doesn't-work table, how to find this
machine's address and open it on a phone, and the three ways to fix the microphone (`mkcert`
recommended).

## Use
Read [mobile.md](./mobile.md) on the page itself: `/framework/dev/mobile/`.

## Watch out
- The phone's microphone needs `https://`, which this dev server doesn't serve yet — the fix is
  one small `Server/` change (not made), waiting on the owner's HTTPS choice. Full detail:
  [`ux/Dictate/doc/https-lan.md`](/framework/ux/Dictate/doc/https-lan.md).
- `monorepo.localhost` never works on a phone — only this machine answers `.localhost` names.
  Use `http://<this machine's LAN IP>:<port>/` instead.

## More
- [Dev](/framework/dev/) — the parent tier this page belongs to
- Research behind this page: `ai/2026-10-08/mobile-voice-access/findings.md` (this task's own folder — not a routed page)
