# chip-context-fix

Verbatim ask (from a Servex minion dispatch on 2026-09-29):

> A bug fix, using the quick-fix pool (take_worktree, then node Server/merge.mjs, then
> return_worktree). Budget about $2.
>
> The owner: on /framework/ai2/, they opened the ☰ drawer and selected a code block. The chip
> "this code block ×" appeared in the chat input. They dictated a question about it and sent it,
> and the fast assistant replied that it didn't see the selected element. So the chip shows, but
> its context never reaches the prompt.
>
> Code: public/framework/ext/drawer/select.js, tabs/ai.js and tabs/element.js (docs in
> ext/drawer/doc/select.md), plus wherever the drawer's AI tab sends a message: the dictation send
> path and Servex's card or page chat route (Servex/cards/Cards.js, Servex/agents/brief.js, the
> card-assistant prompt).
>
> Trace the chip's data from selection to the text the assistant receives, find where it's
> dropped (the dictation send path vs. the typed send path is a likely split), and fix it. The
> prompt should carry a short, labelled block, e.g. "[Selected: code block] <its text, trimmed,
> plus a selector>".
>
> Prove it end to end headless: select an element, send a message through BOTH typed and
> dictation paths (simulate the dictation send), and show that the assistant's received prompt
> includes the block (read the agent's input from Servex logs, or the card's page.jsonl). Post the
> result in one line on card 2026/09/29/layout-explorer-3-columns-and-a-study-of via POST
> http://127.0.0.1:8090/card/append?id=… using node fetch.

## Scope / fence

Files to touch: `public/framework/ext/drawer/select.js`, `public/framework/ext/drawer/tabs/ai.js`,
`public/framework/ext/drawer/tabs/element.js`, and whichever file actually sends the chat message
(dictation send path vs typed send path) — expected under `public/framework/ext/drawer/` or
`Servex/cards/Cards.js` / `Servex/agents/brief.js`. No other files.

Quick-fix pool: `take_worktree` → write + commit in the worktree → `node Server/merge.mjs
<worktree> /framework/ai2/` → `return_worktree`.

