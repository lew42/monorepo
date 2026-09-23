# talk — press the mic, talk, see your words on the screen, in one card that never jumps

Minion: Opus, effort high. Session id `1b8ccd50-fe41-427c-b12d-a4bbdd76aabd`. You are IN A
WORKTREE (the launcher says where; your server's port). Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `code`,
`layout`, `css`, `new-page`, `ui-test`. **This is the owner's number-one ask right now; the
fastest version that truly works wins, and it lands within the hour.**

## The owner's words (2026-09-22 18:35, verbatim)

> please get me a transcription flow working. Spawn minions, do whatever you have to, I push
> the microphone button and I talk and I see my words on the screen. That's what I want, like
> right now. I want a new card on my AI dashboard where I can talk to it and then see that
> card updating in real time. Without shit jumping around.

## What exists — use it, do not rebuild it

- `public/framework/ux/Dictate/` — the mic: `Dictate.js` (`partial_text` + `draw_caption()`
  while a segment streams from whisper, `commit(text)` on a finished sentence which also
  posts `{type: "prompt", by: "owner", text, via: "whisper"}` to Servex `POST
  http://127.0.0.1:8090/log/prompts`), `capture.js` (16 kHz worklet; `loudness()` and a
  level now exist — `dictate-silence`), the bench at `ai/2026-09-22/dictate-silence/`.
  `dictate-silence` is being edited by another minion RIGHT NOW (mic picker, record-until-stop,
  a level on the mic button) — **you import Dictate, you do not edit it**; if the copy in your
  worktree is mid-edit and broken, `node --check` it, log it, and pull the latest from the main
  tree (`cp C:/Code/lew42/monorepo/public/framework/ux/Dictate/*.js <your worktree>/public/framework/ux/Dictate/`).
- whisper-server on `127.0.0.1:8178` (76–98 ms per 10 s clip). The "Thank you" bug was whisper
  being sent the quiet gaps; fixed 18:02 (segments under 120 ms of real speech are refused).
- Servex's fast assistant: within ~2 s of a `prompt` line it appends `name`, `card`, `refined`
  lines to the same log; `GET http://127.0.0.1:8090/api/stream` (SSE) pushes them; `GET
  /log/prompts?n=50` reads them (CORS on). `v/3/prompts.js` is a working client.
- The AI board's view switch and per-view URLs (`/framework/ai/<view>/`, `v/3/page.js` —
  `board-declutter` owns that file and is mid-resume: touch it with ONE Edit, the view word,
  after re-reading it).

## Deliverables

1. **`/framework/ai/talk/` — one card.** A page whose whole content is: a big mic button
   (Dictate's own, with its level), and under it ONE card, fixed at the top of the page, that
   fills with the owner's words as they speak: the streaming partial text appears live inside
   the card (grey), turns solid when the sentence commits, and the next sentence appends
   below it — **text only ever appends; nothing above it moves; the card's top edge stays at
   the same y for the whole session** (measure it). When the assistant's `card` line for a
   sentence arrives, its title becomes the card's heading and its names appear as chips under
   the text — in place, no second card, no reflow above the text (reserve the heading and
   chip rows from the start so nothing jumps). A new session (a click on "new") starts a
   fresh card below the finished one; finished cards stay.
2. **The board knows it.** The word `talk` joins the view words on `/framework/ai/` (one Edit
   in `v/3/page.js`, and the route `/framework/ai/talk/`), and it is the view the mic on any
   other view leads to. The composer's mic on the Prompts/Now tabs may stay; this page is the
   one the owner is sent to.
3. **Proof, with the fake mic:** headless on your worktree port with
   `--use-fake-device-for-media-stream --use-file-for-fake-audio-capture=%LOCALAPPDATA%/lew42/whisper/jfk.wav`
   (16-bit PCM — it is): press the mic, the JFK sentence appears in the card while it plays,
   commits, the assistant's name chips arrive within ~3 s; the card's top y is identical in
   five screenshots taken during the run (log the five numbers); no console errors; at 400 and
   1280. Then land by the launcher's patch (v/3/page.js's one line by `git apply --3way`; your
   own dir by copy), load `/framework/ai/talk/` on the MAIN tree's 8123 headless with the fake
   mic once more, and post ONE card under id `talk` with the link.

## Fence

`public/framework/ai/talk/**` (new), `public/framework/ai/v/3/page.js` (one Edit for the view
word + route), your task dir, `ai/2026-09-22/page.js` `children:`. Not `ux/Dictate/**`, not
`Servex/`. If Dictate lacks a hook you need (an `on_partial`/`on_commit` callback), subclass it
in your page (`class Talk extends Dictate`) and override `draw_caption`/`commit` — never edit it.

## Length

Under 200 lines. Landing report: four sentences and the five y numbers.
