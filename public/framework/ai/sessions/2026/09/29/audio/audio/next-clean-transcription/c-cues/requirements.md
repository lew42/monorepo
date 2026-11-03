# Minion C — don't reply while the owner talks, and pause cues

Load the `minion` skill, then `code`. The owner's words, verbatim: `public/framework/ai/sessions/2026/09/29/audio/audio/owner-words.md`, "Continued (about 8:20 PM)" — the last third ("very important in this transcription phase…" to the end). Parent brief: `../requirements.md` items 4 and 5. Task dir: `public/framework/ai/sessions/2026/09/29/audio/audio/next-clean-transcription/`. Slice 1 (clean mode in the composer) is already built — read `a-clean-mode/task.jsonl` and the commits on worktree/qf-6 first.

The owner: "we don't want to respond while the user is transcribing… sending kind of these audio cues to the LLM, the fast assistant… a pause, how long the pause is… a pause start and then a pause end… so it can get a real time sense for when audio cues are happening."

**Worktree: `C:/Code/lew42/worktrees/qf-6`.** Commit by exact path. Never the main tree. Don't merge. Never commit files.jsonl / page.jsonl / board.jsonl noise.

## Fence
`public/framework/ext/Chat/Mic.js`, `ext/Chat/Composer.js`, `ux/Dictate/Dictate.js`, `audio/MicStream/*`, `audio/Transcriber/*` (read-mostly), their readmes/docs, and `c-cues/`. NOT `Servex/`, NOT `ext/Session` (voice-sessions owns the fast assistant; your parent relays to them).

## Deliverables
1. **Research first, 15 minutes, written to `c-cues/research.md`** (load the `research` skill): what our local whisper-server returns per request (run it: segments? t0/t1 timestamps? `no_speech_prob`? tokens with probabilities?) and what `audio/MicStream`'s level history and Dictate's meter give (frame size, RMS threshold, how a pause is detected today). A table: signal · where from · resolution · useful for pauses? Credence on each claim.
2. **Pause cues on every sent entry.** While the mic is on, track pauses from the level meter: `{start, end, ms}` in ms since mic start, above a threshold (e.g. 300 ms). Attach them to each posted entry as `entry.cues = {mic_on_at, pauses:[…], speaking_ms, no_speech_prob?}` so the fast assistant sees the rhythm.
3. **The floor signal (don't reply while talking).** Every entry the composer posts carries `entry.floor`: `"speaking"` if the mic is still on and speech may continue (a mid-speech pause send), `"done"` when the mic is off or a long pause (the existing paragraph pause) ended the thought. Also post a tiny `{type:"floor", state:"speaking"|"idle", at}` line to the same `/log/prompts` route when the mic turns on and off, IF that route accepts it harmlessly (check `post_prompt` and what reads that log; if it would create a card or a reply, don't — then entry.floor alone). Document the contract in `ext/Chat/doc/floor.md` (short: fields, meaning, "a responder should hold replies while the latest floor is speaking").
4. **Smaller, more frequent pieces (review finding 3).** Only if 2–3 are done and clean: measure whether cleaning smaller pieces sooner makes clean text appear faster on screen (time from words spoken to clean text shown, before/after). Log it as an `{"experiment":…}` line. Wiring `Transcriber.Whisper` (local agreement) into ComposerMic is optional — do it only if it's a small, safe change; otherwise write in research.md what it would take.
5. Headless proof at 400px against the worktree server (http://127.0.0.1:61276/, or check qf-6's server): a posted entry's JSON showing `cues` and `floor`. Save into `c-cues/shots/`. Zero console errors.

Every Node spawn sets `windowsHide: true`; stop any server you start. End with a 5-line summary.
