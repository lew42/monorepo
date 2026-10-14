# Voice: the duplicates the surfaces page found, folded into one

Budget: $10. Load the `sub-mastermind` and `code` skills first. The owner's words: `../requirements-5.md` ask 3 ("we want to work towards a unified system… the sidebar and the mobile sheet should be a unified process, the same code") and `../requirements-3.md` ask 2 ("we don't want duplicate logic; one robust system"). The surfaces page (`public/framework/ux/Dictate/doc/surfaces.md`, 18:26) names 5 duplicates: 3 conversation stores, 3 Refine-stage writers, the New session button (done at 19:09), and its "Next 3" (`ux/Dictate/doc/next.md`): Echo and the Refine buttons share one call; retire `ext/Ask/chat.js`; trace the Dev shell chat tab. Your log is this dir's `task.jsonl`. CLAUDE.md: one of everything; never destructive (retired code moves to `ai/archive/retired/2026-10-13/` by script with relink and undo); link every mention.

## Deliverable, in order, each merged before the next

1. **Echo and the Refine buttons share one call**: find the two call sites (`Servex/agents/Echo.js`, `ext/Refine`'s buttons / `Servex/ext/refine/RefineCall.js`); one function with one signature; both callers use it; proof: the headless voice walk still passes and the Refine page produces the same stages.
2. **Retire `ext/Ask/chat.js`** if the surfaces page's evidence holds (prove: no importer, no route, no page uses it); `git mv` to the retired folder with manifest and relink; the Ask module's readme says what replaced it.
3. **The three conversation stores**: say which is the record (the SDK session file at `/ai-logs/<id>`, per the 10-03 "no duplicate transcripts" decision) and make the other two readers of it or append-only mirrors with a one-line reason each; no store is deleted; a `decision` line with the alternative.
4. **The Dev shell chat tab**: trace what it talks to; if it is a fourth chat surface, say so on the surfaces page and recommend; change nothing there.
5. `surfaces.md` updated (duplicates now: N); `next.md` marks what is done with hashes; card; landing line checked with `tail -1`.

Fence: `Servex/agents/Echo.js` and `Servex/ext/refine/*` (the shared call), `ext/Refine`'s button wiring, `ext/Ask/chat.js` + its readme, the two non-record conversation stores (readers only), `ux/Dictate/doc/surfaces.md` and `next.md`, this task dir. Not `ext/Chat`, not `ext/drawer`. Servex code tested on a private port; the live Servex is restarted by the mastermind. Sonnet.
