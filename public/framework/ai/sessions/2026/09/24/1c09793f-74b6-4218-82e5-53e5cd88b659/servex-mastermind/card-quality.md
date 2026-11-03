## What gets built

1. **The card shows the new parts.** `card.js` learns four lines: `state`, `checklist`, `objects`, `preview`. Overview draws the folder (`ext/files`), then objects, checklist, words last. The rail keeps only the one-line preview. Every tab, file and sub-card gets its own URL.
2. **One object widget, [`ux/Objects`](/framework/ux/Tree/).** A [Tree](/framework/ux/Tree/) that walks a live object: rows like `agents: Agent ×11`, each class name a link, each count opening the list. A + New button appears where a module allows it. Servex answers the same walk at `/api/objects`.
3. **A check at landing.** `card-check.mjs` checks each card against the standard with no model — only failures reach me.
4. **The skills.** The four card-writing prompts open with the standard. **Done.**
5. **The pilot.** The Servex card is rebuilt as in the picture, then the other seven group cards.

Brief: [todo.md](/framework/ai/todo.md), "Cards that show the thing."

Also today: [an assistant on every page](./page-assistant/). Earlier: [module agents](./design.md).
