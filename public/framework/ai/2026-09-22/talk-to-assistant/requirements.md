# talk-to-assistant — the box you type or speak into reaches the Servex assistant, on the Prompts tab

Minion: Sonnet, effort high. Session id `ca954b97-02cc-44ee-b472-c0b18c16e9c1`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `code`, `layout`,
`css`. Private port **8098**. You own `/framework/ai/v/3/` (nobody else is on it).

## The owner's question (17:20)

> so, is there a fast assistant i can talk to via the browser? where do i click?

Today's honest answer was "by voice only": `v/3/compose.js` is the one box (type or dictate)
on the **Now** tab; `ux/Dictate` posts each spoken sentence to Servex's `POST /log/prompts`
(the fast assistant answers on the **Prompts** tab in ~2 s — `prompt-lifecycle`), but the
box's own **Send** still streams typed text to the dev server's old one-shot `assistant`
preset (`stream({preset: "assistant"})`, `ai/2026-09-19/assistant-stream/`).

## Deliverables

1. **Typed words reach the Servex assistant.** `compose.js`'s `send()` posts the text as a
   `prompt` line to `POST http://127.0.0.1:8090/log/prompts` — the same shape `ux/Dictate`'s
   `log_prompt` writes (`{type: "prompt", by: "owner", text, via: "typed"}`; read
   `Dictate.js` and reuse its function or lift it into one shared helper — decide, write the
   `decision`), and falls back to the old stream only when Servex is not answering (say so in
   the note under the box: "sent to the assistant" vs "Servex is down — old assistant"). Keep
   the old path as the fallback, not a second send: one message, one destination.
2. **The box lives on the Prompts tab** (top, above the thread), and stays on Now. Same
   composer, mounted twice; the Prompts view scrolls to the new row when the reply lands.
3. **One line under the box says where you are talking to**: "the fast assistant inside
   Servex · names in ~2 s · ✓ ✗ optional" — and nothing else.
4. **Proof, headless on 8098 with Servex up:** type a real sentence into the box on the
   Prompts tab, press Send, and screenshot the row with its names within 5 s (`shots/`); then
   with the base URL pointed at a dead port (a test flag), send again and show the fallback
   note. Zero console errors both ways; 400 and 1280.

## Fence

`public/framework/ai/v/3/compose.js`, `v/3/page.js` (Edit only), `v/3/prompts.js`, `v3.css`
(reuse first), `ux/Dictate/Dictate.js` only if you lift the helper (then `node --check` and a
headless load of a Dictate page), your task dir. Append-only to `.jsonl`. Take the reload hold
for the batch; the owner is on this page. Not `Servex/`, not `Server/`.

## Length

Under 60 new lines. Landing report: five sentences and the screenshot.

## Owner addendum (17:25, from the Improve button on the board card)

> the mic input ui is at the bottom of a 12 page scroll area? no bueno

So deliverable 2 is the point: the box goes at the TOP of the Prompts tab, first thing under
the view switch, and the Prompts tab is where the owner is sent to talk. Also: `servex-hardening`
is editing `v/3/page.js` at the same time (its fix 4, the deep-link double mount) — do
`compose.js` and `prompts.js` first, touch `page.js` last with small Edit anchors, and re-read
`page.js` immediately before each edit; never Write it whole.
