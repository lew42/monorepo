# Whisper log: every event, numbered (2026-10-16)

**What it is.** [`WhisperLog`](/framework/audio/Whisper/log/) (`WhisperLog.js`) writes one line for everything between the microphone and the Cleaned list, and a page shows those lines as a table, newest last. Open it at `/framework/audio/Whisper/log/`. It exists so a duplicate in the transcript can be found by eye: the same words twice, with two different origins.

**Which store.** The day file `ai/whisper/<date>.jsonl` that `WhisperSession` already wrote, through the same `FsFile.append`, tailed by `JSONL.live()`. One store and one writer (`WhisperSession.record` now calls `WhisperLog.record`). Old lines have no `seq`; the table skips them. The file is git-ignored; the proof run is kept in `doc/proof-2026-10-16.jsonl`.

**Size.** A logged mic writes every interim (the old `record` skipped repeats) and the whole `verbose_json` body, so the day file grows fast; it is a debugging tool, and it is git-ignored. `ux/Dictate/WhisperLog.css` is now unused (kept, never destructive).

## A line

`{ seq, run, t, at, src, kind, msg, ...extras }` — `seq` counts up in the order things happened (per page load; `run` names the load, so two tabs never mix).

| src | kind | meaning |
|---|---|---|
| server | interim, final | whisper-server's reply to one request: `msg` its text, `server` its whole answer (`verbose_json`), `req`, `segment`, `ms` |
| dictate | guess, commit, stale | what `ux/Dictate` did with the reply; **stale** is a reply dropped as out of date (it never reached the page before) |
| composer | commit-in, commit-dropped, enqueue, post, send-check, deliver | the box and the send queue in `ext/Chat/Mic.js`; **commit-dropped** is a final stripped as "already sent" |
| refine | sending, go, chunk, done, sentences | `RefineSystem`: the send, the chunk, the cleaned-sentence list |

Wired by `WhisperLog.attach(mic, system)` (Refine does it): it wraps instance methods, so `Mic.js` and `RefineSystem.js` are untouched. Anyone can add a line: `WhisperLog.event("chat", "bubble", { msg })` (`chat:bubble` is already in the duplicate stages; no chat page calls it yet).

## Reading it (`WhisperLogRows.js`, pure, tested)

- **diff**: each row's text against the previous row of its lane (Whisper replies of one segment; else the same stage). Green added, red struck removed.
- **amended** (orange): a reply changed words it had already said. A changed last word alone is a tweak, not an amend.
- **same as #N** (red): the same words at the same stage, in the same run, earlier. Interim guesses never count. A duplicate shows two rows with two different `req` / `chunk` ids.

## What Whisper sends, and what it does not

- `response_format=json` is the text only (what we used). `verbose_json` adds `segments` (each with `avg_logprob`, `no_speech_prob`, `temperature`, timestamps) and per-word probabilities. It costs about 70 ms per 8 s clip (0.11 s vs 0.187 s, measured 2026-10-16), so only a mic that is logged asks for it: `WhisperLog.attach()` sets `mic.response_format`. The default in `ux/Dictate/Dictate.js` stays `json`.
- **No field says "fixing" or "finished".** whisper-server is stateless: every reply re-transcribes the whole audio window it is given. "Interim" and "final" are our own words (`partial_tick` and `close_segment` in Dictate), not Whisper's. A reply that rewrites earlier words shows as amended.
- The server splits one spoken sentence into several `segments` and puts a `\n` inside `text` between them; `transcribe()` collapses it to a space.

## Proof, one fake-mic pass (jfk.wav, headless, `ext/Refine/test/composer-flow.mjs`)

Whisper `:8178` was up. Lines: `doc/proof-2026-10-16.jsonl` (39 events). It shows:

- Six interims (req 1 to 6) grew one phrase at a time ("American" to "Americans, asked" to "ask not what your country" ...), and the **final** (req 7, `#29`) is word for word the last interim (`#16`): nothing was amended.
- The mic **auto-sent the sentence before the final arrived** (`#19` to `#25`, deliver at `#25`); the final then came back as `commit-in` (`#30`) and was **dropped** (`#31`) by the already-sent strip. No duplicate reached the Cleaned list in this pass. That window (send first, final after) is where a double would come from, and today only that strip guards it.
- Not a product bug: the test's refine cap (6 POSTs) was used up by the live outline ticks (`/api/refine/live`, one per interim), so both chunks ended `failed: Failed to fetch` on this private server.

A real dictation that does duplicate will show as a red "same as #N" at `composer enqueue`, `post`, `deliver` or `refine go`; one fake-mic pass of one sentence does not reproduce it. Run the log on your own dictation and open the page.
