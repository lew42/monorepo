# Minion brief: the fast assistant refines each dictated utterance, live, with its cost

Load the `minion` skill first, then `prompt-refine` (read it only; you're wiring it, not acting as it). Your parent is **task-mastermind-one-dictation**. Work only in your served worktree. **Budget: $5, Sonnet. Usage is over pace, so build this one link and nothing more.**

## The owner's ask (2026-10-03, via vscode-mastermind)
In our own Whisper dictation (the fast and smart assistants), prompt refinement is the FAST assistant's job. As each utterance lands, it runs the shared Refine engine (`ext/Refine/engine.js` and `structure.js`) and writes the structured version beside the raw text, live, with each prompt's cost shown. No second engine.

## What exists (read first)
- `Servex/agents/Sessions.js` `say()` (~line 516) writes each owner utterance as a `{chat: {at, session, path, from: {kind: "owner"}, via, text}}` line into the session's `.jsonl`.
- `Servex/agents/Echo.js` already runs the mechanical half for VS Code prompts: `process()` calls `clean(text, {call})` and then `structure(sentences, {call})`, and `call()` records each model call. Reuse that call path and its machine-session guard. Don't copy the engine. Note the hotfix comment in `process()`: Servex's own process has no OpenRouter key, so use the default (Anthropic) model, the same as Echo.
- @task-mastermind-prompts-live is fixing Echo's VS Code path right now (Echo.js). Don't edit Echo.js beyond, at most, exporting a small shared function. If you need one, add it in one place and say so in your task.jsonl.
- The chat draws session lines through `ext/Session/Session.js` `entry()` and `ux/Dictate/Widget.js` `Thread.draw()`, one renderer for every surface.

## Do
1. In `Sessions.js`, right after an owner `say()` line is written (voice or typed, from the owner only, never an assistant), run `clean()` and `structure()` in the background, without blocking the say or the fast assistant's reply. When they finish, append ONE line: `{refined: {at, re: <the chat line's at>, sentences, sections, flags, cost_usd}}`. `cost_usd` is the sum of that utterance's model calls (from the SDK result's `total_cost_usd`; if it isn't there, compute it from tokens).
2. In `Session.js` `entry()` and the Widget's thread, draw a `refined` line as a small, collapsed "refined" block under the owner bubble it `re`s. It shows the sections with their sentence ids and the cost ("$0.004"). The raw bubble stays exactly as it is.
3. Never refine an assistant line, a `para`/`skip`/`nav` line, or a refine call's own output (Echo's machine guard).

## Prove (headless only; never `say()` into a live session)
- A node test calls the new Sessions code with a stubbed `call` (no real model), and checks that one `refined` line lands with `re` and `cost_usd`.
- One headless shot at 400 of the ✦ sheet, replaying a stubbed stream that holds an owner line and its `refined` line, into `minion-voice-refine/shots/`.
- Name the Servex restart this needs; your parent asks mastermind-servex-9. Never restart Servex yourself.

## Rules
Commit by exact path; never commit `.jsonl` files. Don't merge. End your turn with the commit hash, the test output, and the shot path.
