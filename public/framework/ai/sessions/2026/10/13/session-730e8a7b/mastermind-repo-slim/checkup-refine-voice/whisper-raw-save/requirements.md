# Save every raw Whisper reply, from every dictation surface

Budget: $4. Sonnet. Work in a worktree (`take_worktree`), prove headless, then tell the parent; the parent reviews the diff and runs `merge.mjs`. Read `CLAUDE.md`, `public/framework/ux/Dictate/readme.md`, `public/framework/audio/Whisper/readme.md` first.

## Why

The owner (2026-10-17) suspected the raw Whisper reply is only drawn on screen. Checked: true for every surface except the Refine demo.

- `Dictate.transcribe()` (`ux/Dictate/Dictate.js`) hands the whole reply to `this.on_whisper?.(…)`.
- Only `ext/Refine/RefineDemo.js` sets `on_whisper`; it writes `ai/whisper/<date>.jsonl` (dev-server path, git-ignored).
- The chat composer (`ext/Chat/Mic.js`), voice strip and widget set nothing. Only the committed sentence reaches Servex, as `{type:"prompt", via:"whisper"}` (`Dictate.log_prompt`).
- Lost: raw text before the split, segment timings, `avg_logprob`, `no_speech_prob`, every interim.

## What to build (smallest)

1. In `ux/Dictate/Dictate.js`, after `on_whisper` in `transcribe()`, add `this.log_whisper(...)`: a fire-and-forget POST to Servex's single-writer log `POST /log/whisper` (the same helper as `post_prompt`, `servex_url("/log/whisper")`; never a second writer, never awaited on the hot path, never throws). Line: `{type:"whisper", kind, req, segment, ms, seconds, bytes, text, raw, session, segments}`; `segments` is the slimmed `body.segments` (`[{start,end,text,avg_logprob,no_speech_prob}]`, present only when the reply carried them); `session` is `this.session` (string or function, as `ComposerMic` already uses) or empty.
2. Request `verbose_json` for finals only (`kind === "final"`: the settled chunk, one per sentence, about 70 ms more); interims stay `json` (text only) so the hot loop is unchanged. Keep `Dictate.prototype.response_format` meaning "the interim format"; `WhisperLog.attach()` still forces verbose for the logged mic.
3. A switch `Dictate.prototype.log_raw = true` to turn it off; Refine demo's `on_whisper` path is untouched (it already writes the debug day file; say in the doc that this is a second, dev-only copy).
4. Headless proof: run `ext/Refine/test/composer-flow.mjs` (fake mic, jfk.wav) against the running Servex (`SERVEX` url in `Dictate.js`), then `GET /log/whisper?n=20`. Paste the first interim and the final (with `segments`) into `audio/Whisper/doc/proof-raw-log-2026-10-17.jsonl` (under 20 lines). If Servex is not up, say so and prove with a stub server that records the POST body.
5. Docs (short): a section "Raw replies are saved" in `audio/Whisper/doc/raw-log.md` (the parent is writing that file's first half; append your section "## How it is saved", do not rewrite theirs), and a one-line pointer in `ux/Dictate/readme.md`.

## Fence

`ux/Dictate/Dictate.js`, `ux/Dictate/readme.md`, `audio/Whisper/doc/raw-log.md` (append only), the proof file, this dir. Not `Servex/`, not `ext/Chat/`. Commit by path in the worktree; do not merge; do not touch other agents' dirs. Log with the item tool in your `task.jsonl`; last line is the landing line.
