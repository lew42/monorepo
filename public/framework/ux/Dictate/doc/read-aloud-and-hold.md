# Two settings: read-aloud on/off, and a Hold button (proposal, 2026-11-03)

**Asked.** (1) Read-aloud on or off (it is a bit annoying, you may turn it off), and when it is off the assistant should work differently. (2) A Hold (mute) button so the assistant does not respond at all while you talk, until you pause or ask. Nothing is built; each has an option A (client only) and B (also known to Servex), and a recommendation.

## 1. Read-aloud on/off

**Today it already exists, but only the page knows.** The 🗣 button on the Recite bar (`audio/Recite/ReciteBar.js:29`) calls `Recite.set_auto()` (`Recite.js:493`); the choice is saved in this browser's `localStorage` (key `auto`, on by default, `Recite.js:38`) and every "not read: auto is off" path (`:330`, `:346`, `:421`) skips the speech. Servex never hears about it, so the assistant writes for the ear and holds its pause cue for a reading that is not happening.

- **A. Client only (nothing new).** Keep the 🗣 button; it just silences the voice. The assistant keeps its voice style, and keeps waiting for a "read finished" marker (see [echo-and-turn-taking.md](echo-and-turn-taking.md)) that never comes until its timeout.
- **B. Tell Servex (recommended).** The button also posts the setting to the session, beside `assistant` in `Sessions.settings()` (`Servex/agents/Sessions.js:357`): `POST /api/session/settings {session, read_aloud: false}`; stored on the session so a phone and a desktop agree (the open "settings per device" item in the [readme](readme.md)). Servex then changes the procedure:
  - **Brief note, no turn:** the assistant's next turn opens with `(read-aloud is off: the owner reads your replies, not hears them)`, the way `notes` already carries a page report. With it off the reply may use a short list or a link, since nobody listens to it, but it stays small and one item at a time.
  - **No echo work:** the echo drop, the `read` marker, and the cue re-arm while reading ([echo-and-turn-taking.md](echo-and-turn-taking.md)) all skip, because nothing plays. Read-aloud off removes the echo problem altogether, so it is also a cheap fix for it.
  - **Cue timing:** the pause cue can fire as soon as the owner is quiet, with no wait for a reading to finish.
  - **Where the button lives:** the sheet bar's gear panel and the Recite bar's 🗣, the same setting; the gear row says "Read replies aloud: on / off".

## 2. Hold (mute) button

**Asked:** while you talk, the assistant does not respond at all: silent until your pause, or until you ask. Today the single seat's cue fires about 1 s after the last sentence (`single_cue`, `single_pause_ms`) and never looks at whether you are still talking (`Sessions.js:716`, see the echo doc), so a short breath already brings a reply. The fast seat's reply is already held while you speak (`speaking(s)`, `Sessions.js:1199`, `held` :1618); the single seat's is not.

- **A. Client only.** A toggle that stops the page from posting the pause moment. Cheap, but the server cue timer still runs, and a second device is not held.
- **B. A server flag (recommended).** A Hold toggle on the sheet bar beside ⚙ and ⌨ posts `settings {session, hold: true}`. While `hold` is set, Servex:
  - **files sentences as now** (the raw log stays instant; with the new brief the assistant does nothing per sentence anyway);
  - **does not open the pause cue**: `single_cue`'s timer re-arms instead of firing (one more `if`, like the floor check proposed in the echo doc);
  - **queues, never drops:** a reply that is finished while held goes into `held` and is written on release, like the fast seat's.
  - **Release, any of:** you tap Hold again; a longer silence (the wake policy's `gap_ms`, 12 s, reuse the one knob); or an ask (a question mark, or the assistant's name, which `WakePolicy` already detects: `Servex/agents/WakePolicy.js`). So "silent until the pause, or until he asks" is one flag plus two existing triggers.
  - **One cue on release:** the assistant files the whole held burst in one turn, which is the batching the brief now asks for.
- **Why not push-to-talk:** it needs a held finger; a toggle works hands-free on a phone.

## How the two combine

| read-aloud | hold | the assistant does |
|---|---|---|
| on | off | the normal loop: files at the pause, replies to a question, written for the ear, echo guards on |
| off | off | same loop, replies may use a short list; no echo work, no wait for a reading |
| on or off | on | nothing visible until a release (tap, long pause, or an ask); then one batch |

Order to build (when told to go): read-aloud flag and brief note (small), Hold flag with its release triggers (small to medium, all in `Sessions.js` plus one button), then the gear rows. Tests: `Sessions.single.test.mjs` gains "hold: no cue until released, the reply is queued then written", and a settings-persist check.
