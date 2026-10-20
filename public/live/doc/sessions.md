# Live sessions: how past ideas are kept and found (2026-10-19)

**A session is what was on screen between two `clear` lines of `page.jsonl`.** The voice agent already clears the page when the topic changes, so nothing about how it writes changes, and nothing is stored twice: the sessions are computed from the log.

- **Stored:** `page.jsonl` only (append-only, as before). `LiveLog.sessions()` in [`Live.js`](../Live.js) folds it: each `clear` closes the cards shown so far into a past session; the cards shown now are the current one. Pointer and view cards (`archive`, `sessions`, `now`, `tasks`, `part-live`) are never counted as session content.
- **Streams:** unchanged. `/live/` tails `page.jsonl` and shows the current session.
- **Found:** [/live/sessions/](/live/sessions/) ([`sessions/LiveSessions.js`](../sessions/LiveSessions.js)) lists every session, newest first, from `/live`'s log and the old [archive](../archive/readme.md) log. Each row opens `/live/sessions/<source>-s<line>/`, which shows that session's cards whole, oldest first, so it reads top to bottom. The id is the line the session began on, which never changes because the log only grows.

## The gap found on 2026-10-19 (owner: "only October 15, nothing since")

The list only counted `clear` lines in `/live`'s `page.jsonl` and the old archive. That log has three clears, the last on 2026-10-17 04:47; since then the voice agent has not cleared, so everything after is one "now" session and the 16th to 19th looked empty. The real record of sessions is Servex's per-day `ai/sessions/YYYY/MM/DD/index.json` (every voice and agent session, with title, agent, first and last activity, folder). `LiveSessions.load_days()` now reads the last 14 days of those and lists each session under its day, newest first, voice ones marked, each row linking to its session folder. The clear-based list stays below as "Cleared screens of /live/". The day indexes load once per visit (reload to refresh), they are not streamed. Not yet seen in a browser.

## Voice sessions: one central store (owner decision, relayed 2026-10-19)

Voice sessions are saved centrally at `public/framework/ai/sessions/YYYY/MM/DD/<id>/session.jsonl`, whose line 1 is `{"session":{..., "kind":"voice"}}` (`Sessions.session_path` in `Servex/agents/Sessions.js`, live after the next Servex restart). If `/live/sessions/` ever lists voice sessions, it reads them from there, never from a third store. The clear-delimited sessions above are a view of `page.jsonl` and stay separate.

## Not yet done

- **Not yet looked at in a browser.** The agent that wrote it had no permission to load a page; open `/live/sessions/` first and fix what is off.
- **A tile on `/live/`:** add one card, `page_add` on `/live/`: `{"type":"part-card","id":"sessions","title":"Sessions","preview":"Sessions","text":"Past sessions."}` (the card's link goes straight to the child page).
- **Names:** a session is named by its first card's title. A `{"title": …}` line or an explicit "session started" line could name it better.
- **Only clears split sessions.** If the voice agent goes a whole call without clearing, that is one long session; a time-gap split (for example 3 hours quiet) is the simple next step.
