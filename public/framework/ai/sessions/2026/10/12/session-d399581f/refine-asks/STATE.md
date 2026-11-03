# Refine asks: STATE

Asks [#7 asks-prompts-refine and #10 realtime-dictation-tasks](/framework/ai/doc/asks.md). Everything built here is browser-side, so **no Servex restart is needed**. Proofs sit beside this file.

## Built (each with a commit and a proof)
- **Per-prompt Refine button** on the Sessions page: select one of your bubbles, press `Refine ✦`, the stages stream under it. `12d9e9fb5`. Proof: `button-proof.mjs` / `button-proof.png` (the real `/api/refine` answered; a failure shows on the button).
- **Things you mentioned** (`ext/Refine/stages/ThingsStage.js`): say "where is Dictate" and a link card to `/framework/ux/Dictate/` is on screen as the words land, no model, no cost. This is the instant on-screen answer that replaces the scrapped fast assistant. `0fd19d684`. Proof: `things-proof.mjs` and `things-proof-{400,1200,1920,3440}.png` (5 names found, none from "the page should show a tree of cards", no overflow at four widths).
- **Importance and confidence bars on every card** (`CardsStage`): importance is the share of the prompt's sentences the card cites, confidence is the Haiku clarity score; both computed, never typed. `b1a8f8092`. Proof: `cards-meters.png`.

## Already built (checked, not rebuilt)
- Raw words live in about 100 ms, a mechanical per-sentence clean with them, then structure, refined, cards (`Servex/ext/refine/VoicePage.js`, `run.js`).
- **Tags:** the Haiku pass tags each sentence, cards show them, `TagRouter.js` leaves a note on the module page (`run.js`).
- Every prompt is logged raw-first to the session's `prompts.jsonl` (`PromptLog`).
- Approve/Improve decisions exist on board cards (`ai/sessions/2026/09/20/approve-loop/`).

## Not built, with the reason and the smallest next step
| Point | Why not | Smallest next step |
| --- | --- | --- |
| Per-sentence **model** clean | Each Haiku call is about $0.03 to 0.07 and 3 s, so a call per sentence costs more than the whole prompt. The mechanical per-sentence clean is already live. | A `clean_live` flag in `run.js` for one opt-in session, then one batched Servex restart. |
| **Echo** on every prompt | Off by design for cost (`SERVEX_ECHO=on`). | Flip the env var for a day and read the cost line. |
| **Opus voice overseer** | The owner's vision scrapped the fast assistant and said Haiku cleans but never runs the show, so no model is added as an overseer without a new decision; it would also cost a model call per prompt. | Only if asked again: a `voice` role that reads `prompts.jsonl` and posts `Note:` cards. |
| **Prompt cards to board cards / asks.jsonl** (approve-or-improve on a refined ask) | Routing an ask to an owner is judgment, not a mechanical step; it needs a Servex route. | A route that turns one refined card into an `asks.jsonl` line plus a board card, then the existing Approve/Improve buttons work on it. One Servex restart. |
| **Board creates tasks while you dictate** | Same route as above. The board and session page themselves already update live (page tail). | Same. |

## Notes
- Sessions missing from the AISession index read a `page.jsonl` in today's `session-<id8>/` while Servex writes to the older dated folder, so stages do not show for them. Found, not mine; the fix is in the index.
- The voice flow `ai/sessions/2026/10/12/session-b0c9ab63/voice-verify/walk.mjs` is re-run after the merge (result in `task.jsonl`).
- **Landed** as merge `a66e3b2dd` (smoke clean, review answered). Voice walk re-run after the merge: raw and clean at the first words, structure/refined/cards 6.4 s after Refine (baseline 6.6 s), no overflow, no errors. The walk's words name no module, so it does not draw the Things stage; `things-proof.mjs` covers that.
- The Refine button sends the whole bubble; a very long prompt (over 20k characters) is refused by `/api/refine` and the error shows on the button. Smallest next step: trim the text before sending.
