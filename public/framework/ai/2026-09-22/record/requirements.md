# record — a page where the owner records their voice to a file on the server, and a test that runs those files through whisper

Minion: Sonnet, effort high. Session id `36e558ed-30a4-4725-8868-9243d91efca2`. You are IN A
WORKTREE (the launcher says where; your server's port). Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `code`, `layout`,
`new-page`. Private whisper test port **8179** if you need one; the owner's 8178 may be POSTed
to, never restarted.

## The owner's words (2026-09-22 18:37, verbatim)

> the dictate thing should be able to just record a file to the server, right? I'd like to
> record my voice, you can save it to file, and then you can use that to test the whisper
> thing — so that while I'm not here you can run those through and make sure it works
> properly. I'd like to get you a few test recordings, so set up a page where I can click on it
> and record my voice please.

## What exists

- `ai/2026-09-22/dictate-silence/page.js` — the bench: records through `ux/Dictate`'s
  `capture.js` (16 kHz Int16 WAV, `wav(samples)`), shows the numbers, posts to whisper, and
  offers a browser-side download (`URL.createObjectURL`). No server write yet.
- The dev server: `Server/plugins/` — `Screenshots.js` writes PNGs the site sends (read it
  for the pattern: a route, a size cap, a path under `public/`), `Append.js` (`rpc:append`,
  text only). Servex's `/log/<name>` is text. So: a small `Server/plugins/Recordings.js`
  route `POST /recordings/<name>.wav` (raw body, 16-bit PCM WAV, ≤ 25 MB, loopback only) that
  writes to `public/framework/ai/recordings/<name>.wav` and returns `{path, bytes, seconds}` —
  and `GET /recordings/` listing them. Hold + `node --check` + boot your worktree server and
  curl before landing (a `Server/` save restarts the owner's server after a boot test).
  The folder is gitignored (add ONE line to `.gitignore`: `public/framework/ai/recordings/`).

## Deliverables

1. **`/framework/ai/record/`** — one screen: a mic picker (the same `enumerateDevices` list
   the bench is getting; `deviceId` into `getUserMedia`), a live level meter, one big button
   "record" → "stop", then: a name box prefilled with the date-time, the WAV's numbers
   (seconds, sample rate, RMS), an audio player to hear it back, and "save to server" →
   `POST /recordings/<name>.wav`. After saving: the list of every recording on the server,
   each with play, its numbers, and "transcribe" (POST it to whisper 8178, show the text).
   Nothing jumps: the list is below the recorder and grows downward only.
2. **The test — `Server/whisper-test.mjs`**: runs every `public/framework/ai/recordings/*.wav`
   through whisper-server (8178, or `WHISPER_URL`), prints one line each (name, seconds, ms
   to answer, the text), and compares against `public/framework/ai/recordings/expected.json`
   (`{"<name>": "<what was said>"}` — the owner fills it, or the page's "this is what I said"
   box beside each recording writes it) with a word-level match percent. Exit non-zero under
   80 %. That is how a minion checks the whisper stack while the owner is away.
3. **Proof:** headless with the fake mic playing `%LOCALAPPDATA%/lew42/whisper/jfk.wav`
   (`--use-fake-device-for-media-stream --use-file-for-fake-audio-capture=`) — record 8 s,
   save as `jfk-fake.wav`, it appears in the list, transcribe → the JFK sentence; then
   `node Server/whisper-test.mjs` prints it with ≥ 90 % match against the expected text.
   Screenshots at 1280 and 400 into your task dir. Zero console errors.

## Fence

`public/framework/ai/record/**` (new), `Server/plugins/Recordings.js` (new) + its one
registration line in `Server/run.js`, `Server/whisper-test.mjs` (new), one `.gitignore` line,
your task dir, `ai/2026-09-22/page.js` `children:`. Not `ux/Dictate/**` (import only), not the
bench, not `v/3`. Land by the launcher's patch; the `run.js` line by `git apply --3way`.

## Length

Page under 200 lines, plugin under 80. Landing report: four sentences with the match percent.

## Owner addendum (18:38, verbatim) — the shape of the page

> Try and use the tree, or the files UX we have somewhere: create a little workspace for the
> recordings. You just push record and it makes a new recording, and when you stop it adds
> "recording 3" or "recording 4" to the list. When you click on any one of them you can
> preview it and see information about that recording — probably just auto-transcribe it to
> see if it works. With a little workspace I can try different things, test it out, get a feel.

So deliverable 1 is a **workspace**, not a form: left, the list of recordings (use `ux/Tree`
or `ext/files` — whichever already draws a selectable list with an active row; say which in a
`decision`), with one button above it: **record** → **stop**; on stop the WAV is saved to the
server as `recording-N.wav` (N = next number; no name box) and appears in the list, selected.
Right: the selected recording — a player, its numbers (seconds, sample rate, RMS/peak), the
mic it was made with, and its transcription, which starts by itself on save and on select
(cached after the first time in a sidecar `recording-N.json` beside the WAV: `{text, ms,
device, seconds}`), plus a small "this is what I said" box that writes `expected.json`. The
level meter and mic picker sit with the record button. Nothing jumps: the list grows at the
bottom, the right pane is persistent. The two fixtures already on the server
(`public/framework/ai/recordings/just_a_test.wav` = the owner's own voice, and `jfk.wav`, with
`expected.json`) show in the list from the start.
