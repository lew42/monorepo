# Session architecture — the browser is a thin client, Servex owns the files

`ext/Session` is the browser half of a voice session: one ✦ press is one session, and its whole conversation is one JSONL file that Servex writes. The main file is [`Session.js`](../Session.js), a set of plain functions (`start`, `say`, `stream`, `watch`, `entry`…) and one default export. The other half is `Servex/agents/Sessions.js`, which this module never imports.

## The browser sends verbs; Servex decides

**Decided:** every write is a `POST` to `/api/session/<verb>` on Servex, and every read is either that file or a `recent` query. The browser keeps no conversation state of its own.
**Why:** the two assistants, the floor and the quiet timer must see the same truth, and only Servex has all of it.
**Instead:** the browser holding a local copy and syncing later. It would drift from what the assistants read.
**Detail:** [doc/sessions.md](./sessions.md#the-routes-servex-port-8090-cors-open)

## One press, one file, under the page it started on

**Decided (superseded 2026-10-25: the file now lives in the dated store, see [sessions.md, "The file"](sessions.md#the-file); `home` is only a field of the session):** a session lives at `<home>ai/<session>.jsonl`, where `home` is the nearest folder to the page. A press on a page whose session spoke in the last hour continues that session (`resumed: true`), unless `fresh: true` is passed.
**Why:** the file sits where the work is, so the folder's own `ai/log.jsonl` can point at it.
**Instead:** one global log. It loses the page context that the assistants need.
**Detail:** [doc/sessions.md](./sessions.md#the-file)

## A card can be the session's home

**Decided:** passing `card` makes the home that card's own folder, `/framework/ai/<card>/`, while `path` still records where the owner stood.
**Why:** a card's page and its voice session then share one folder.
**Instead:** keeping the session under the nearest folder. The card page could not find its own conversation.
**Detail:** [doc/sessions.md](./sessions.md#card-sessions)

## Live replies stream; the file is read by polling

**Decided:** replies arrive over Server-Sent Events (`stream()`, each event carrying the whole text so a reconnect loses nothing). Lines in the file are read by `watch()`, which fetches the file every 1.5 s.
**Why:** the stream gives token-by-token replies; the file read needs no server push for the rest.
**Instead:** a `watch` built on `stream` for every line. Not done yet.
⚠ **Code mismatch with the stream rule:** `watch()` is a timed `fetch` loop, not a stream. Replace it with the `live()` tail when the server offers one.
**Detail:** [decisions.md](./decisions.md)

## Silence is an event, and the spoken line waits for it

**Decided:** `report_quiet()` sends every silence mark of the mic (`quiet`), and Servex holds a spoken line until the owner has been quiet about 2.5 s (per the note in `Session.js`'s header).
**Why:** a half-finished sentence should not get an answer.
**Instead:** the browser deciding the moment itself, which the server could not check.
**Detail:** [doc/sessions.md](./sessions.md#when-they-answer-the-floor)

## Mic pause is found by polling the mic

**Decided:** `report_pause()` reports the mic stopping through `on_quiet`, and the mic starting again by checking the mic's `owner` field every 400 ms.
**Why:** `floor.js` has no event for the mic turning back on.
**Instead:** adding that event to `floor.js`, which is outside this module's fence.
⚠ **Open:** this is a timer, so the stream rule applies here too. The fix belongs in `ux/Dictate/floor.js`.
**Detail:** [doc/markers.md](./markers.md#the-five-invisible-markers)

## Five markers are never bubbles

**Decided:** `nav`, `pause`, `select` are invisible and dropped by `entry()`. `para` and `refined` are also never bubbles, but `entry()` passes them through so `ux/Dictate/Widget.js` can act on a bubble already drawn.
**Why:** the smart assistant needs them as context, and the reader must not read past them.
**Instead:** drawing them as small notes, which cluttered every thread.
**Detail:** [doc/markers.md](./markers.md)

## Open items

Open questions are in [doc/decisions.md](./decisions.md). Its one open item is the `session-` CSS prefix, which is not yet in `styles/css-scopes.txt`.
