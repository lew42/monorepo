verdict: fix

1. [fix] The "instant" card's tabs row is already stale: it says tabs work on a plain page but are broken under `/live/`. `public/live/doc/page-features.md:8-18` (written 2026-11-06, after the plan's search) says that split is now moot and tabs **work** on `/live/` — a leaf sub-page becomes a real tab via `LivePage.pages_of`, not via the `navigation:"tabs"` delta. Only `columns`, `nav` (rail) and `place` stay broken on LivePage. The plan should say tabs are fixed and cite the real mechanism, or a reader will think the fold plan still has to fix tabs.
2. [fix] The shape's core claim — "it is the same layering core/Plugin already has, class row → instance row, with one layer added in the middle" — doesn't hold against the code. `PluginEntry.get_one` (`core/Plugin/PluginEntry.js:13-20`) and `Plugin#load_overrides` (`core/Plugin/Plugin.js:68-90`) resolve exactly two hops: the instance's own override, else the single class-wide `rec.on`/`rec.config`. There is no generic middle layer a template could occupy, and `load_overrides` *replaces* the full override set rather than merging under it — so there's no existing way to tell "this value came from the template" from "the page chose this itself", which the plan's own promise ("change the template later and every page... follows, except where a page made its own choice") depends on. This is new plumbing, not reuse of what's there, and isn't called out in the $4 templates step's cost.
3. [note] Brief question 3 ("could the MVP start without fold step 2, on a plain `Plugin` host?") is never answered — the plan only says "waits on fold step 2." A plain-`Plugin` toy-host demo (not `Page`) could show the tree/switch/save/reload today with zero dependency; worth one line either way.
4. [note] "full screen... under /live/ untested" (instant card) is honestly flagged as untested, not claimed false — fine as is, just the one unverified cell on that table.
5. Everything else checked against code holds: `core/Plugin`'s per-instance rows, `overrides`, `make_default` (`Plugin.js:55-64, 217-237`); sub-plugins (`row.plugins`, `PluginEntry.js:29-33`) exist but are genuinely unused outside `Plugin.test.mjs`/readme — grep confirms no caller; `page.ext(name)`/`{"ext":…}` having no off switch matches `fold-2/requirements.md:9-12` exactly; `page.pages.add`/`page.content.add` deltas match `ai-api.md:44-56`; `{type:"View"}` drawing via `Item.foreign` is real (`live/LivePage.js:600,686`, `live/div-test/page.jsonl`); Template/BigCard being a repeated-card system distinct from a page template matches `findings.md` word for word; no `save_template`/`core/Page/templates/` exists yet, consistent with it being marked a proposal.

## Requirements
- What exists — yes, mostly — see finding 1 (one stale cell) and item 5 above
- The shape — no — see finding 2 (layering claim not proven by the code)
- The dependency (fold step 2) — yes — `fold-2/requirements.md` matches the plan's description of `class Page extends Pluggable(Item)` exactly, status "building" is consistent
- The words, read as the owner would — yes — each card makes one point, code blocks are JS not JSON, "tip" card states the one-line plan up front
- Missing — see finding 3 (brief's "could MVP skip the dependency" question unanswered)

## Words
- Level 1 (the "tip" card) is one plain sentence plus a status line — clear on a phone
- Each card (mvp/exists/past/shape/template/instant/ui/views/steps/alts) makes one point; "exists" and "instant" are tables, dense but still one topic each
- Code shown is JS (`page.plugins.set(...)`, `other.set({template:...})`), not JSON deltas — matches the ask
