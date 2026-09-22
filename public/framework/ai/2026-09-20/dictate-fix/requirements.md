# dictate-fix — dictation stopped working

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Find the one thing that broke. Do not redesign it.
2. **Clear beats brief — by far.** The owner needs to know what was wrong in plain words.
3. **Prioritize.** Make it work; explain second.

## The owner's words, just now

> Also the dictation doesn't seem to work. I'm not sure what's going on there.

That is all they said, so **your first job is to find out what "doesn't work" means** — it could be
the button, the recording, the transcription, or the text never arriving. Do not guess; drive it.

## What is already ruled out

- **The whisper server is alive.** `127.0.0.1:8178` answers 200 right now, PID 35172, checked
  minutes ago. So this is not a dead backend.
- **The Dictate module is present and parses.** `public/framework/ux/Dictate/` has `Dictate.js`,
  `capture.js`, `pcm-worklet.js`, `Dictate.css`, `page.js`, and all four `.js` files pass
  `node --check`.
- **The page-health watcher has logged no console errors** on any AI page since 11:00 — but it only
  checks pages after an edit, so absence of evidence is weak here. Drive the page yourself.

## The likely cause, and why

Last night a `git stash` reverted the whole repo at 23:16 and it was restored from the stash this
morning — 1,008 files rewritten, plus an earlier recovery that rebuilt ~171 files from session
transcripts. Dictation worked before that. So suspect a **seam**: a file restored to a version that
no longer matches its neighbour, a missing file that nothing declares, or a wiring line that was
reverted while its counterpart moved on.

Three specific places to look:
- `public/framework/ux/Dictate/**` — the component itself.
- `public/framework/dev/DevBar/**` — the mic control and how it mounts Dictate. The dev bar had
  several files restored twice last night, once from transcripts and once from the stash, and one
  known casualty: `tools.js` was deliberately restored to an *earlier* state because a later edit
  referenced `chat.js`, a file that was never written. **Check whether the dictation wiring was in
  that same later edit.** That is the strongest single lead in this brief.
- `Server/plugins/Whisper.js` — the route the browser calls. Confirm the path the client uses and
  the path the server serves are the same string.

## How to find it

**Drive the real thing headless** with the `ui-test` skill: open a page with the dev bar, press the
dictation control, and watch the console and the network. Whatever fails will say so. Grant the
browser a fake microphone if it needs one — Chromium takes `--use-fake-device-for-media-stream` and
`--use-fake-ui-for-media-stream`, which also auto-accepts the permission prompt.

If the failure is a 404 or a bad path, name the exact URL requested and the exact URL served.

## Prove it

**Do not report this fixed on the strength of code reading.** Drive it end to end: press the
control, produce audio, and show the transcribed text arriving. Shot of it working. If you can get
it to the point where audio reaches the server but you cannot verify text in a headless browser,
say exactly that and what remains untested — an honest partial is better than a claim.

## What you must not do

- **Never kill or restart the dev server** — port 80 is the owner's and they are on it — and
  **never stop whisper-server on 8178**; it is working and it takes a long time to come back.
- **Never drive the owner's open tabs.** Headless only, your own browser instance.
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push.** ⚠ And do not
  touch `stash@{0}` — it is the only copy of some of last night's work. Reading a file out of it
  with `git show 'stash@{0}:<path>'` is fine and may be exactly how you recover a lost wiring line.
- **Stay out of `public/framework/ai/**`, `public/framework/ext/AITask/**` and
  `public/framework/framework.css`** — another minion is fixing page padding in those right now.
- Hold reloads around your batch and re-take the hold before each one; it expires after five
  minutes and has lapsed twice on long jobs.
- Do not search from the filesystem root.

## Deliverables

1. **Dictation working**, proven by driving it.
2. **`page.js` in your task dir — one screen.** Top line in plain words: what was broken and what
   fixed it. Then the proof. `new-page` for the shape; add it to
   `public/framework/ai/2026-09-20/`'s `children:`.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, `"worker": "dictate-fix (in-process
   agent)"`. Land with `finish-task`.

## Fences

You own `public/framework/ux/Dictate/**`, `public/framework/dev/DevBar/**`, `Server/plugins/Whisper.js`
(read freely; edit only if the break is genuinely there, and say so — a `Server/` save can bounce
the live site, so batch it and warn me), and `public/framework/ai/2026-09-20/dictate-fix/**`.

## Length budget

One screen. Landing `outcome`: what broke, what fixed it, what is still untested — at most five
sentences.
