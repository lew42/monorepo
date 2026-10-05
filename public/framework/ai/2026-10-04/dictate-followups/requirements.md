# Dictate: four more owner-visible fixes (follow-up to dictate-fixes)

Opened mid-`dictate-fixes` (relayed via vscode-mastermind) — NOT done there: that task was
already 339% over its $5 budget ($16.96) when this arrived, and Servex had stopped its minions.
Landing the original four cleanly took priority over absorbing more scope into an already-blown
budget. This is a fresh task, fresh budget.

## The owner's words, verbatim (from the voice conversation on `/framework/`, relayed 2026-10-04 ~21:00)

> First: find the owner's voice conversation from the last hour on the /framework/ page
> (`Servex/agents/Sessions.js` knows where sessions are written) and read every owner line; they
> asked the assistants for fixes that never happened. Add these to your list, all inside the
> freeze:
> (5) the mic BEEPS twice mid-sentence after a pause, as if it stops and restarts; it must stay
>     on until the owner stops it;
> (6) send: manual send is fine and stays (box clears, keep talking); remove whatever restarts
>     the mic on silence;
> (7) the text box grows to 5–7 lines and hides everything: cap it at 2–3 lines and scroll
>     inside;
> (8) an old error line stays on screen forever: errors clear themselves when the stage
>     recovers, and live in the one status line, not new rows.
>
> Same proof rules: headless, load → reload → load, console "[dictate]" trail. The owner wants
> to replace the VS Code tab with this widget before Claude cuts off; it must simply work.

## Step 0 — before anything else

Read the owner's actual voice conversation (the source this brief was relayed from) in full —
`Servex/agents/Sessions.js` + the `/framework/` page's session log. The four points above are a
relay's summary of it; confirm them against the owner's own words and catch anything the relay
missed, the same way `dictate-fixes/requirements.md` did for the first four.

## Freeze

Nothing else. These four fixes, each proven headless (`Server/browser.mjs`, never
`mcp__playwright`), the same way `dictate-fixes` proved its four — console `[dictate]` trail,
load → reload → load where relevant. Touches the same fence as `dictate-fixes`:
`ux/Dictate/`, `ext/Chat/`, `ai2/` (rail.js, card.js).

Read `public/framework/ux/Dictate/doc/decisions.md`'s new "Four owner-visible fixes" section and
`public/framework/ai/2026-10-04/dictate-fixes/task.jsonl` first — this is continuation work on
code that task just changed (whisper_seen/detect_engine retry, the mic/socket/whisper status
line, the instant-send cleaning…/sent-waiting states), not a clean slate.

## Budget

$5, a guide, same as the original. Over pace → land what's proven, note what's left, stop; don't
silently keep burning.
