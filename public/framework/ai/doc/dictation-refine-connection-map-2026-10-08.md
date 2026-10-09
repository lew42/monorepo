# Dictation, clean and cost: how the pieces connect (2026-10-08)

Every finished sentence is posted to Servex's session log. Servex then runs `clean()` and `structure()` (in `ext/Refine/engine.js` and `structure.js`) on that same sentence, through Echo, and writes a `refined` line. The chat window shows that line's cost as `refined · $x`, so the money you saw is the clean step, not the fast assistant.

`Server/refine.mjs` is a dev-only batch tool and is not on the live dictation path.

| piece | file | what it does in the dictation path | calls what |
|---|---|---|---|
| Dictate widget | `public/framework/ux/Dictate/Dictate.js` | Records speech and finishes a sentence. `revise_chunk()` (line 1117) runs `Revise.run(raw, level)` for the cleanup pass. | `ux/Revise/Revise.js` |
| Dictate widget (chat) | `public/framework/ux/Dictate/Widget.js` | Draws each line. `draw_refined()` (line 520) shows the `refined · $cost` box under the owner's bubble. | reads the `refined` line |
| Chat mic | `public/framework/ext/Chat/Mic.js` | Sends finished sentences. `await_clean()` (around line 557) waits up to 5 s for the `/api/tidy` answer. | `/api/tidy` |
| Chat panel | `public/framework/ext/Chat/ChatPanel.js` | Draws the chat. Has no cost or token figure of its own. | none |
| Servex tidy route | `Servex/Servex.js` line 599 | `POST /api/tidy` calls `Servex/agents/tidy.js`, a one-shot model call. | model |
| Servex session say | `Servex/agents/Sessions.js` line 759 `say()` | Writes the owner's `chat` line, then calls `this.refine(s, line)` (line 771). | `refine()` |
| Sessions refine | `Servex/agents/Sessions.js` line 485 `refine()` | Runs `clean()`, then `structure()`, and sums `cost_usd` from each call (lines 488–499). Writes `{refined: {…, cost_usd}}`. | `echo.call()` |
| clean() | `public/framework/ext/Refine/engine.js` line 336 | One model pass on a sentence. Its prompt is in `Servex/agents/tidy.js`. In the browser it calls `/api/tidy` (line 324). | `call` or `/api/tidy` |
| structure() | `public/framework/ext/Refine/structure.js` | Second pass: turns the clean sentences into sections. | `call` |
| Assistant (fast) | `Servex/agents/Assistant.js`, `Servex/agents/assistant.md` | Long-lived lobby agent `assistant-fast`. Started at boot, `Servex/Servex.js` lines 198–201, unless `SERVEX_NO_ASSISTANT` is set. | model session |
| Sessions (fast pair) | `Servex/agents/Sessions.js` | Voice session pair `session-fast` and `session-smart`. Its `refine` path is the one that writes cost. | model sessions |
| Batch refiner | `Server/refine.mjs` | Dev-only CLI. Reads a raw file and writes clean, brief and coverage files. Not called by the live path. | `clean()` by its own copy of the flow |

## Where the chat-window cost came from

- The box reads `refined · $${cost_usd}` (`public/framework/ux/Dictate/Widget.js` line 526).
- `cost_usd` is written only in `Servex/agents/Sessions.js` line 499. It is the sum of `r.cost_usd` from every `echo.call()` made during that one sentence's `clean()` and `structure()`.
- `ext/Chat` has no cost code of its own. Its only cost figure is in `ext/Chat/weight.jsonl`, which is a separate ledger note.
- So the figure is the Echo clean-and-structure cost of one sentence. The fast assistant's own replies do not write a `refined` line and do not show a cost here.
- Caveat: `total_cost_usd` is priced off Anthropic's table and is wrong for proxied models (`Servex/ext/openrouter/gaps.md`). The number is a guess for non-Anthropic models.

## Unknowns

- I did not confirm the exact URL `Revise.run` posts to. The file is `public/framework/ux/Revise/Revise.js`, not read. It probably reaches `/api/tidy`.
- I did not trace whether each sentence also wakes `assistant-fast`. `Sessions.say()` wakes the assistants (its comments say so), but I did not follow that path.
- I did not check whether `Assistant.js` is still running on your machine right now. That depends on the `SERVEX_NO_ASSISTANT` setting.
- I did not check `Servex/Servex.js` line 275 for a switch that turns off `Sessions`.
