# chat.js — notes and architecture

## Controller factory pattern

Everything this file used to do with one module-level singleton now lives in create_controller(), so it can be built TWICE: once, here below, as `GLOBAL` — the one conversation per browser tab, shared by every `chat()` call made with `keep: true` (the default) — and once PER MOUNT, fresh, never saved anywhere, for a call made with `keep: false`. A `persist: false` controller never touches `sessionStorage`, so it can never be read back by a later mount — which is exactly "coming back starts fresh".

## Duplicate message fix

`attach()` below wires up BOTH `Session.watch()` (polling the session file every 1.5s) and `Session.stream()` (an SSE push the moment Servex writes a line) to this SAME `draw()` function — on purpose, two separate jobs. That means EVERY real line is expected to arrive twice, once from each channel. `own_ats` already dedupes one case — the owner's own sent message, echoed back once the file/stream reads it — but an assistant's reply was never covered, so replies each drew as two separate bubbles. `seen_chat` is the same guard, widened to every chat line, keyed the same way `ext/Chat/Chat.js`'s own `chat()` factory already dedupes its `source()` lines.

## In-flight echo

The stream can push the owner's own line back BEFORE `Session.say` resolves, so `own_ats` lacks its `at` and it drew twice. Texts being sent wait in `sending[]`; the first owner line matching one is that echo.

## Resume offer timing

Before a word is said: the tab's newest OLDER session, offered as one tappable line — a session that spoke within the hour is picked up silently by `ensure()` itself; only an older one is worth asking about. Never offered for a `keep: false` mount — there is nothing saved for it to resume FROM; every one of its own sessions starts fresh.

## Cold reload fix

Every (re)appearance of a session — this mount's own first paint, or a LATER start/resume/reset from any mount sharing this controller — redraws this mount's thread whole, from the file's own first line, via a brand new `Session.watch()` call (never a cursor carried over from before). This fixes a bug where reopening the chat showed an empty box because the file wasn't being re-read from the top.

## Live bubbles and merging

A `para` line is an instruction to the Widget to split a bubble (the fast assistant's own line, written after `chat.js` calls `Servex/agents/Sessions.js`'s own `refine()`).
