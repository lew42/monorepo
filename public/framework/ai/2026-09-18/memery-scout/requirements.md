# Brief: memery-scout (2026-09-18)

Minion task. Read-only over the repo; write only this task dir (`report.md` + the log).

## The owner's words (2026-09-18, 12:45)

> if each topic page were an actual team, then users could join specific meme topic pages. I don't remember where we're at with the whole memery idea — look into that, see if there's any existing work; it's essentially topics. A meme is a visual word title page. Failure to launch is one of my memes [...] a page that people who resonate with the idea... a YouTube video, the start of a community where other people can share their stories. I believe I requested some work on creating this topic system, topic pages, a team or community oriented platform with Discord-like features potentially, live chat, maybe voice chat. Check into that, add it to the report in terms of past work for that whole system.

## Where to look

Start here, then `rg` (drop the leading `/` — a pattern starting with `/` returns nothing through the Bash tool on Windows):

- `public/notes/each-meme-is-a-community/`
- `public/notes/` (levels-and-points, personal-specs, auth, inbox, …)
- `public/imagine/platform/` (`decisions/topic-model.md`, `identity.md`, `data.md`, `slice.md`, `mvp/`, `research/`, `existing/`, `prior/`)
- `worker/room.js` + `worker/index.js` (a Durable Object per live page — the room)
- `Server/plugins/Research.js`
- `public/framework/ai/2026-09-04/mastermind-platform/` and `existing-framework/`
- `ai/2026-09-06/platform-slice/` and `notes-pages*`
- `/imagine/team/` (join/assign) — as `imagine/team/`

Also: `rg -il "memery|meme|topic|community|discord|voice|chat|room" public/notes public/imagine/platform --glob "*.md" --glob "*.js"`

## Deliverable — `report.md`, one screen, plain sentences with links, same text as final message

1. First line: what the topic system is called on this site today and where it lives (the url).
2. What EXISTS, one line each with its link: the community-per-meme note, the platform program's decision records (topic model, identity, data, the MVP slice), what the worker proves live today (identity, likes, the room — is the room a live chat? what does it do, measured or read).
3. What was DECIDED and never built (one line each, from the decision records).
4. The gap to "a topic page is a team people join, with live chat, maybe voice": numbered steps with a minutes-or-hours estimate each, which of them needs the owner (credentials, a deploy), and the alternative for live chat (the Durable Object room vs a third-party embed) with the case each wins.
5. The failure-to-launch meme: does a page for it exist? (rg the phrase) — one line.

Two numbers that must agree: decision records in `imagine/platform/decisions/` and rows in your list of them.

## Never

Never touch port 80, never `git stash`, never `find /`, never drive the owner's tabs. No server needed. Timestamps from the clock.
