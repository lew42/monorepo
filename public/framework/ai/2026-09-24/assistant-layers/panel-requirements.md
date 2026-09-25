# Minion brief: the card's agent panel (context size, Compact, Recycle)

Load the `minion` skill first, then `code`, `css` and `ui-test`.

## The owner's words

"We'll want UI per card showing what context each agent has, how many tokens, and what percentage of its full window, with the ability to compact or recycle. Claude Code's auto-compaction could work, but we might want our own compaction system, so we can log the important details in the proper place."

Design: `public/framework/ai/2026-09-24/assistant-layers/doc/design.md`, section "What each agent knows, and how much".

## Where you work

The MAIN tree, `C:/Code/lew42/monorepo` (branch `michael/dev`): this is one small module edit. The site is live: wrap your writes in `node Server/hold.mjs on "minion-al-panel — card agent panel"` / `node Server/hold.mjs off "minion-al-panel"`. Commit ONLY your files (`git add <path>` for each), attribution `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Other agents have uncommitted files in this tree; never add, stash or reset them.

## The data (Servex routes, not live yet)

These routes exist on the branch `worktree/assistant-layers` and go live with a later Servex restart:

- `GET <servex>/api/card-agents?card=<card id>` → `[{id, role, state, model, session_id, context, window, pct}]`: the card's assistant and manager. `context` is tokens in its context, `window` its window size, `pct` 0-100 or null.
- `POST <servex>/api/agent/<id>/compact` → `{ok}`: the agent writes a summary line into the card, then restarts from it.
- `POST <servex>/api/agent/<id>/recycle` → `{ok}`: the agent restarts fresh from the card's log.

`<servex>` is `servex_base()` from `public/framework/ai2/inbox.js`. While the route answers 404 or fails, the panel shows **nothing at all** (same rule as the type picker's `cards_ready`).

## Deliverables

1. **`public/framework/ai2/agents.js`**: a small function (or a static part, per the code skill) that draws one row per agent under the card's meta line: the agent's id, its state, and a thin bar showing `pct` with the text "`<context>` tokens · `<pct>`% of `<window>`" (numbers shortened: 41k, 200k), then two small buttons, **Compact** and **Recycle**, each with a `title` explaining it in one sentence. A button posts, then refetches. Refetch every 10 s while the card is open. No DOM after an `await`: capture the box first, fill it in a callback (the `code` skill's trap). Run the `new-css-class` skill for any new class name (prefix `ai2-`), and put CSS in `ai2.css` inside its existing layer.
2. **`public/framework/ai2/card.js`**: ONE call that draws the panel right after the `ai2-meta` block in the full card view. Nothing else in that file.
3. **Prove it** with the `ui-test` skill, headless (Playwright's `page.route` to answer `/api/card-agents` with two fake agents at 12% and 83%, and the POSTs with `{ok: true}`): shoot the card at 1920 showing the panel, click Compact, and show the POST was sent. Also shoot a card with the route answering 404 and show that no panel appears. Put the shots in `public/framework/ai/2026-09-24/assistant-layers/shots/`.
4. Load `http://monorepo.localhost/framework/ai2/` for real, with no mock: zero console errors.

## Done means

Committed on `michael/dev` (your files only). Your last words: the commit hash, the shot paths, and anything you could not do. Length: agents.js under about 90 lines. Never write the owner's name.
