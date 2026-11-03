# 3 — the views (moved from the readme)

<!-- moved verbatim from readme.md lines 4-66, 2026-10-12 readme audit -->

**Four views on screen, five urls** (`board-declutter`, 2026-09-22). Every view word is a real
link, so `/framework/ai/days/`, `/framework/ai/now/`, `/framework/ai/timeline/` and
`/framework/ai/prompts/` each open that view — and the same exist under
`/framework/ai/v/3/`. The URL decides the view, always; the saved preference is read only when
the url names none, and the bare url then rewrites itself to the view it settled on, so a
reload, a paste or a Back never lands somewhere else. A card opened in the timeline gets its
own url under that view (`/framework/ai/timeline/<id>/`), and the old flat
`/framework/ai/v/3/<id>/` links still work — they rewrite themselves to the new shape.
`?view=<name>` is still accepted once and rewritten to the path.

**`grid` is hidden, not gone** (the owner, 2026-09-22: "I don't like the grid… maybe we just
hide the grid for now"). `HIDDEN_VIEWS` in `page.js` is the one flag: a name in it loses its
word on the chrome line and its url lands on the default view and rewrites itself there, so
`/framework/ai/grid/`, `?view=grid` and an old saved preference reading `grid` all end up on
`days` instead of on a word that is no longer there. `wall()` and every `.v3-cards` rule are
untouched — take `"grid"` out of that array and the view is back with its url intact.

**days** (2026-09-22, the default) is the odd one out — the owner's own
words, "i never have a nice clean report of what happened": newest day first, one row per
task that actually *landed*, collapsed to the one-line headline it wrote for itself at
landing (`day.jsonl`) until a click reads that task's own `task.jsonl` for the full outcome,
its links, and the task page. Today's still-running tasks show as one quiet "working — …"
line each. The other five share one data source instead (`ai/board.jsonl`, read through
`timeline.js`'s `Weighted` model, the same file the dev bar's own log reads): **now** (the
newest thing the owner said, live), **grid** (every card, sized and ordered by `weight()` —
importance, not age) and **timeline** (an inbox rail + detail pane, newest first). The two
permanently-disabled placeholders (gallery, dashboard) were deleted on 2026-09-22 — a word that
does nothing at any width is not worth a slot. **prompts** (`prompt-lifecycle`, 2026-09-22) is the
other odd one out: it reads neither file, only Servex's own prompt log — see below. `page.js`
is the whole page (about 1600 lines — five views is a lot for one file, named as a known cost,
not an oversight); `v3.css` is its styling, `timeline.js` the board's own data model and shared
card helpers, `Composer.js` the one text/dictate box every reply goes through, `AskControls.js` a prompt
card's Yes/No controls, `Demos.js` the live examples a card can name, `AgentsStrip.js` the Agents
strip and `Prompts.js` the Prompts view (both below).

`?log=`/`?verdicts=` point the page at a scratch pair instead of the real `board.jsonl`/
`verdicts.jsonl` — the device every proof run against this page should use (never write to the
real files directly; copy them into your own task dir first).

On the chrome line, on every view, sits the **Agents strip** (`board-from-events`, 2026-09-22) —
one chip per Servex-hosted Claude session that is actually **working** (`GET /agents`, pushed by
`GET /api/stream`), absent with zero console errors when Servex is not answering; click a chip
for its live transcript. Idle sessions get no chip: they collapse into one `N idle` fold at the
end of the same line, which lists them by name when pressed (`board-declutter`, 2026-09-22). A landed `minion`/`task-mastermind` becomes a real board card with nobody writing
one — folded from its own log, merged straight into this page's data, never into `board.jsonl`.
`AgentsStrip.js` is the whole thing; see the task page for the proof.

The **Prompts** view (`prompt-lifecycle`, 2026-09-22) is the thread of what the owner said and
what was made of it: newest prompt first, their sentences on the left never tidied, and on the
right the fast assistant's reading of them (hover it and the sentences it cites light up), the
names it minted as chips, the card, and a pre-proposal once a card is approved. **The reading now
carries a mode switch** (Condensed → Structured → Clean → Raw, `prompt-refine`, 2026-10-02) —
[`ext/Refine/prompt-card.js`](/framework/ext/Refine/)'s `prompt_modes()`, not a file here, because
`ai2` needed the same piece for its own pinned "Your prompts" card and this board is being
replaced. A ✓ or ✗ on any
chip or card appends one more line through `POST /log/prompts` and is never required — the
appender's naming checks are the authority, this only shows the 200 or the 409. `Prompts.js`
holds it and exports `prompt_stream()` (one shared `EventSource` for everything reading that
log) and `prompt_board_cards()` (every assistant card, folded onto the normal timeline and grid
the same way a landed agent's is). `?servex=<url>` points it at another Servex, which is how the
proof ran against a private one.

