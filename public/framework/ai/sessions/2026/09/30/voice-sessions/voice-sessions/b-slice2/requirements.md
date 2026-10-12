# Slice 2: resume, titles, refined lines, and a smart assistant that knows what's in flight

Load the `minion` and `code` skills first. Your parent is task-mastermind-voice-sessions.
Read these first: [../design.md](../design.md) (the table and the `chat` line), then slice 1 as it shipped: `Servex/agents/Sessions.js`, `session-fast.md`, `session-smart.md`, `public/framework/ext/Session/` (and its readme and doc/sessions.md). The owner's words for this slice are [../owner-words-2.md](../owner-words-2.md): read all of it, it's one paragraph.

## Where you work

Worktree `C:/Code/lew42/worktrees/qf-9` (branch `worktree/qf-9`, already at michael/dev, site http://127.0.0.1:52363/). Commit there by exact path.
**Fence:** `Servex/agents/Sessions.js`, `session-fast.md`, `session-smart.md`, `Servex/agents/tools.js` (only new `session_*` tools), `Server/plugins/ServexProxy.js` (item 7 only), `public/framework/ext/Session/**`.
**Not yours:** the ✦ sheet (`ext/drawer/rail.js`, which is mobile-nav's), `ext/Chat` (the audio task's). Never restart Servex, and never restart the dev server on port 80. Stop every process you start, and set `windowsHide: true` on every spawn.

## Deliverables

1. **Resume within an hour.** `POST /api/session/new {path}`: if a session whose home or visited pages include `path` had its last line less than 60 minutes ago (`SERVEX_SESSION_RESUME_MS`), return IT, with `resumed: true`, instead of making a new one. Otherwise make a new session and add `previous: {session, title, summary, at}`, the most recent older session on that page, so the sheet can show one line ("Voice session plumbing · 1 day ago") that resumes it when tapped. Add `POST /api/session/resume {session}` (continue any session by id) and `GET /api/sessions?page=/x/&limit=10` (recent sessions started on or passing through that page, newest first, each with `{session, home, title, summary, at, last_at}`).
2. **Idle pairs stop; a say brings them back. Memory is the machine's bottleneck, so this comes FIRST** (19:40: two empty pairs from the phone held about 1 GB and blocked every other spawn). Today every ✦ press spawns two agents at once and keeps them forever (`session-` is in Global.js `LONG`, and stopped session agents are `revivable: false`). Instead: `/new` spawns NOTHING. The pair is spawned on the session's first `say`, and the `backing` ids are written then. Stop both agents after 5 minutes without a line (`SERVEX_SESSION_IDLE_MS`, default 300000). On a `say` or `resume` whose agent is stopped or gone (after a Servex restart), respawn it with `resume: <its backing uuid>` and the same cwd and spec, then send. If the backing session can't be resumed, spawn fresh and give it the session file's last 40 lines as context. Record the new backing in the session file as a `{"backing": {...}}` line (the latest one wins). Prove it: stop the pair, say a line, and a reply lands.
3. **A title and summary for every session.** Add a Servex tool `session_summary({session, title, summary})`: `title` is at most 6 words and `summary` is one line. It writes `<home>ai/<session>.summary.json` `{id, home, title, summary, at, visited}` and appends a fresh pointer line with the title and summary to the home page's `page.jsonl` (the latest pointer for an id wins; page.jsonl stays one line per update, not per sentence). The smart assistant calls it after its first reply and again whenever the topic shifts.
4. **Refined lines (the audio task's format, adopt it as-is).** Add a Servex tool `session_line({session, text, re, level})`. It appends a `chat` line from `{kind:"assistant", id:"smart"}`. A REFINED line has `re` = the raw owner line's `at` PLUS `level` = `clean` | `edit` | `summary`. `re` alone is an ordinary reply. `level` is required on every refinement, or ChatPanel draws it as a reply. Export the three levels from `Session.js` (`LEVELS`) and document them in doc/sessions.md.
5. **The smart assistant's brief (`session-smart.md`)**, rewritten to hold these, in the owner's and the Servex mastermind's words:
   - **It knows what's in flight:** every task, who runs it, who started it, on which page, and how to reach it (`list_agents`, plus the newest `task.jsonl` first lines under `public/framework/ai/<today>/`). When the owner talks, on ANY page, about work started elsewhere, it ROUTES the words to the existing mastermind (`send_to_agent`) instead of starting a duplicate. Related work goes to the same mastermind or worktree. New sessions can talk to masterminds that are in flight or already finished, because everything is logged.
   - **Only the fast and smart assistants see the raw words.** A mastermind never gets the owner's raw words, only a POLISHED message. For a long dictation, make it with `node Server/refine.mjs` (see `Server/doc/refine.md`) so its `coverage.md` lets anyone audit the handoff. Post the refined text to the owner as a `session_line` with a `level`, so they see raw → revised.
   - Call `session_summary` as in item 3.
   - **Every session leaves the directory's readme and logs in a state where a NEW session knows as much as this one.** The session file is the full record; the summary and pointer are the index.
   - Keep the "final text is your reply" rule for ordinary answers.
6. **The client (`Session.js`)**: `start()` returns `resumed` and `previous`. Add `resume(session)` and `recent(page)`. The demo page shows a resumed session and the Recent list (a few rows, each a click that resumes it). The demo page must keep working at 400px wide, since the owner uses the phone.
7. **Key sessions by Host (requirements item 16).** `Server/plugins/ServexProxy.js` currently drops the browser's host. Make it pass `x-forwarded-host`, and have Sessions store `host` from `x-forwarded-host ?? host` on `/new`. `/api/sessions` then lists only sessions from the same host. Nothing else is keyed by host yet; say so in doc/sessions.md.

## Proof (each one an `experiment` line in your task.jsonl)

Run a second Servex-like harness on a private port, as slice 1 did (see slice 1's task.jsonl, `a-slice1/task.jsonl`, for how it proved against real SDK sessions), with `SERVEX_HOME` in a scratch dir. Then:
1. `/new` twice on one page within a minute returns the same session with `resumed: true`. After setting `SERVEX_SESSION_RESUME_MS=1000` and waiting, it returns a new session with `previous` filled.
2. Stop the pair, `/say`: a reply lands, and a `backing` line is written.
3. After one exchange, `.summary.json` exists with a title, and `/api/sessions?page=` lists it.
4. A long dictated line produces a `session_line` with `level` and `re`.
5. The demo page at 400 and at 1920: zero console errors, and screenshots of both.

Update `ext/Session/readme.md` and `doc/sessions.md` so they are true. Clean up every session file and pointer line your proofs wrote. Reply with the commits, the proofs, and anything you couldn't do.

## Added at about 8:00 PM: `ai/log.jsonl` replaces the page.jsonl pointer (the owner, via mastermind-servex-7; design.md's table was updated)

8. **Any directory MAY have `<dir>/ai/log.jsonl`**: a MINIMAL, iceberg-prioritized index of AI work in that folder. It records presence only, one line per event, each pointing at its detail file: `{"session":{"id","event":"started"|"ended","title","file","at"}}`, `{"task":{"dir","event":"opened"|"landed","title","at"}}`, `{"decision":{"text","file","at"}}`. No step updates; those stay in the session's or task's own log.
   - Sessions.js writes the session's `started` line to the home's `ai/log.jsonl` (INSTEAD of the `page.jsonl` pointer), a line in each new folder the session reaches, and `ended` with the title when the pair is stopped for idling. **Remove the page.jsonl pointer writes.** `/api/sessions` reads log.jsonl instead.
   - `session_summary` rewrites `.summary.json` and appends a fresh `session` line with the new title to the home's log.jsonl only when the title changes.
   - Add a Servex tool `dir_log({dir, line})` that appends one validated line (the three shapes above, nothing else).
   - **The SMART assistant's brief:** it writes important context and decisions to the right folder's `ai/log.jsonl` IN REAL TIME, as it goes, not as a cleanup step, so a pair stopped after 5 idle minutes loses nothing. The FAST assistant only does speed; it writes nothing.
   - Remove the proof lines your earlier runs left in any real page.jsonl.
