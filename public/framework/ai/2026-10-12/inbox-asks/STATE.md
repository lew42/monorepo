# inbox-dashboard-cards: state (2026-10-12)

Each open point checked against the code (no code changed tonight).

- ✅ **Importance 90+ filter** — done: `Rail.FLOOR = 90`, `?min=` and a number input (`core/Page/ext/Inbox/Rail.js`, `ai/rail/needs-rule.js` `importance()`).
- ✅ **Search** — done: `Rail.search()` filters by title/text, archived included.
- ✅ **Unread** — done by design: `ai/rail/inbox.js` marks cards always unread (stalled rows track read); an explicit read/unread control is deliberately deferred there.
- ✅ **Child cards via directories** — done: `create_card({parent})` in `ai/rail/inbox.js`.
- ⬜ **Plain blocking / review / fyi categories** — scores and kinds exist (`needs-rule.js`: blocked, fyi, owner_note) but no rail chip or label says the three plain words. Smallest next step: map `kind` to one of three words in `AIRail` row heads and add them as filter chips beside "Needs you". Needs a layout check at 400/1200/1920/3440, so not shipped blind overnight.
- ⬜ **AI2 class files lowercase** — `ai/rail/*.js` and `ai/cards/*.js` are still lowercase (`ai2/` holds only re-export shims). Renaming is major surgery (a dozen callers): scripted `git mv` with a manifest, own task.
