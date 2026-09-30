# Minion A — clean transcription mode, first slice (the phone)

Load the `minion` skill first, then `code`. The owner's words, verbatim: `public/framework/ai/2026-09-29/audio/owner-words.md`, section "Continued (about 8:20 PM)" — read it; it is the acceptance test. Parent brief: `../requirements.md`. Task dir: `public/framework/ai/2026-09-29/audio/next-clean-transcription/`.

The owner, in short: "the clean transcription mode pairs the raw whisper with the fast assistant's refinement… we just put the clean transcription into the UI… the strike throughs… we can still do that in the debug mode… I also want to be able to dig backwards into the actual text to see what was actually transcribed."

He is testing voice ON THE PHONE right now, at `/framework/ai2/` (the composer). Ship something that works there fast.

**Work only in the worktree `C:/Code/lew42/worktrees/qf-6`** (branch worktree/qf-6, server http://127.0.0.1:61276/). Commit there. Never edit the main tree. Do not merge — your parent merges.

## Fence (only these files)
- `public/framework/ext/Chat/Mic.js`, `ext/Chat/Composer.js`, `ext/Chat/Chat.css`
- `public/framework/ai2/compose.js`
- `public/framework/ux/Dictate/Dictate.js`, `ux/Dictate/playground/Playground.js` (+ its .css)
- readmes/doc of those three modules (Chat, Dictate, Dictate/playground)
Not `ext/Session`, not `Servex/` (another team owns them).

## Deliverables
1. **Clean mode on the phone composer (the default).** `ai2/compose.js` turns `revise: "clean"` on. In `ComposerMic`: each finished Whisper utterance is sent to `Revise.run(raw, "clean", {before})` (it already goes through `revise_chunk`; `/api/tidy` answers in ~3 s, checked). The box shows the CLEAN text in place of that utterance's raw words once it arrives (raw stays in grey/italic while waiting, as the live guess does now). No strike-through anywhere in this view.
2. **The message that is sent is the clean text**, with the raw kept on the entry (`entry.raw`, raw Whisper words, and `entry.level:"clean"`). When a send fires (pause / sentences / manual Send) while a clean-up is still pending, wait for it (at most ~5 s), then fall back to raw for anything unanswered — never lose words, never send twice. If Servex/tidy fails, send raw and say so in the hint line.
3. **Raw stays reachable (dig back).** A small toggle on the composer (e.g. "raw" chip / long-press) shows exactly what Whisper produced for the current box. Keep it light.
4. **Kill switch:** a `clean` on/off in the composer's existing settings panel (`SETTINGS` in Mic.js), default on, remembered like the other settings.
5. **Playground:** add a **Clean** tab (the clean text alone, no marks) and make it the default tab; relabel Corrections/Live as debug ("Corrections (debug)"). Keep every existing tab working (v1 stays reachable).
6. `Dictate.sample()`: wrap its loop in `try/finally` so `this.sampling` always resets.

## Prove it
- Headless Playwright (`browser-testing` memory: never drive the owner's tabs) against YOUR worktree server, at 400px width: feed the composer a raw utterance with fillers (there is a `sample()` path, or call the methods directly) and screenshot the box showing clean text; then the raw toggle. Also `/framework/ux/Dictate/playground/` at 1920 on the Clean tab. Zero console errors.
- Save shots in `a-clean-mode/shots/`. Log each step in your task.jsonl.
- Every Node spawn sets `windowsHide: true`. Stop any server you start.

Budget: small. Don't redesign — add. When done, commit and end your turn with a 5-line summary: what changed, the shot paths, anything left.
