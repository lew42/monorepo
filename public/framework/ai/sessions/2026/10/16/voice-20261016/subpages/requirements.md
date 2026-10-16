Budget: $12

# core/Page: subpages are page.jsonl lines, never page.js edits

Task mastermind brief from mastermind-voice-20261016 (voice session 2026-10-16). Card: 2026/10/15/voice-session-2026-10-16-19-06. Model: Sonnet for the code; Haiku for any search.

## The owner's words (voice, question 50e26818, relayed verbatim)

> Owner direction on subpages: agents must never edit page.js; the children string is the old index approach and is duplication. Page tools lean on Page methods: creating a subpage = page.add on the parent, stored in the parent's page.jsonl as a line (a pages add). Two storage variants, both allowed: (a) embedded, child lives entirely as items in the parent's jsonl; (b) referenced, child has its own folder with page.js and/or page.jsonl, and the parent's jsonl holds the reference line (an index: exists / later a remove line). Deltas only, never rewrite whole items; pass exactly what changed, deep. Optional: child may use the parent as a template (past request for Page.clone / template class via Object.create; find what came of it). Navigation rendering of jsonl-declared children is a separate open question. Immediate: fix create_page so it never touches page.js and writes the reference line instead, so the voice agent can make a fresh slate under /live in one call. ... Route the rest to the page mastermind with the one-question-per-step rule.

## Rule: one question per step

Work in steps; each step settles ONE question, is committed, and is logged in task.jsonl before the next starts.

## Steps, in order

1. **Immediate fix (do first, land fast).** `create_page` / `page_set({pages:{add}})` (`Servex/pages.js` line ~90, `Servex/agents/Subpages.js`) must never touch any page.js. Drop the "name added to the parent page.js children string" branch; always append the reference line to the parent's page.jsonl. Prove it: one call makes a fresh page under `/live/` and it loads (check_page). Commit, merge. Servex changes need a restart: do NOT restart Servex during the owner's voice call; note on the card that it takes effect on the next restart.
2. **Storage variants.** Document and support both: (a) embedded child, all items in the parent's page.jsonl; (b) referenced child, own folder (page.js and/or page.jsonl) + a reference line in the parent (add now; a remove line later). Doc in `core/Page/doc/`, linked from `core/Page/readme.md`.
3. **Deep deltas.** Today `Servex/agents/page_tools.js` (line ~144, ~194) uses the caller's id or `crypto.randomUUID`, and a set does a shallow merge by top-level id. Design the deep delta (pass exactly what changed; a nested id walks into the item). Propose first in the doc; build only the smallest slice.
4. **Parent as template (optional).** `core/Page/Template/Template.js` already has `clone(data)` via `Object.create(this)`. Say whether a child page can use its parent as a Template; record what came of the past Page.clone request.
5. **Navigation of jsonl-declared children** — open question only: write it down in the doc, do not build.

## Also read
- `core/Page/doc/ai-api.md`, `core/Page/doc/server-instance.md` (helper-page-instance, commit 0c4423940), `ai/doc/tool-collapse.md` (helper-tool-collapse is reshaping the page tools now: coordinate with it via send_to_agent, don't collide).
- The `children:` string stays readable for existing pages; no mass rewrite. Moves are scripted (CLAUDE.md).

Report on the card in plain sentences, one screen.
