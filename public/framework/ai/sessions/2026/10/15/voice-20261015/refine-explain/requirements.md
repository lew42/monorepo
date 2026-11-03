# ext/refine: how it works today, and wiring voice prompts into it

Owner ask: voice a98d6231, logged in [../task.jsonl](../task.jsonl). The owner is opening ext/refine now.

## Write `public/framework/ext/refine/doc/how-it-works.md` (link it from `ext/refine/readme.md`)
Plain sentences for a newcomer, read from the source (file:line refs), not from memory:
1. **The classes**: one line each (Refine, RefineSystem, Prompt, RefinedCard, Scorer, VoiceFollow, Outline, engine.js and the rest in `ext/refine/`). Say what extends what.
2. **The two steps: clean, then refine.** What each step does, which model, where the result goes.
3. **How Dictate feeds it**: mic, then the local Whisper stream, then bubbles, then refine. Name the classes and files in `ux/Dictate` (or wherever Dictate lives) at each hop.
4. **What is known broken**: connections drop, and LLMs write wrong or out-of-order jsonl deltas for bubbles. Find where each shows up in code, docs or logs (`ext/refine/doc/`, `inbox.jsonl`), and say what is known about the cause.

## Then write `doc/voice-to-refine.md`: a proposal
How a long prompt dictated through the voice tunnel (`Servex/ext/remote/`, reply files under `%LOCALAPPDATA%/lew42/servex/remote-replies/`) could go through refine so a refined prompt appears on `/live/`. Cover the smallest slice, which class owns each hop, and the risks. A proposal only: build nothing.

## Record only (owner's longer-term note, no action)
Add one line to `ext/refine/doc/` (or the closest Page doc): "Subpages and navigation built out of jsonl deltas may be the wrong tool; better templates written in raw markup, which jsonl then uses, may be the answer." (owner, 2026-10-15, voice a98d6231)

## Rules
- Haiku. Stay under 60k tokens: read files, don't replay logs. Docs only: commit straight to the current branch, no worktree. Do not restart anything.
- When done, message mastermind-voice-20261015 with five lines: the classes, the two steps, the Dictate path, what's broken, and the proposal headline.
