# ai-classes-asks: state

## Done (all on michael/dev, `node --check` clean, `/framework/ai/`, `/framework/ai/system/`, `/framework/ai/asks/` and `/framework/ai2/live/` load with no page errors)
- `cards/Faces.js` `class Faces`: 211a55e0c, file renamed to match f704c9389.
- `cards/` Activity, Agents, CardChat, Compose, Fold, Meter, Outline, Rules, Tasks: merge d50fc40bb, runtime fixes e43dec5db and e96916162.
- `rail/` Needs, NeedsRule, Processes, Log, Overview, and the `v/` pages: earlier merges on michael/dev.
- `asks/` AskFold, AskRows; `audits/paging/` PageTypes, PageTypePages; `SystemClasses`; `health/HealthDevbar`; `overview.js` becomes `AIOverview`: merge 396f10190 (branch michael/bags-misc, commits 0cedbad25 to d6e51cdab). Importers outside `ai/` updated (`Servex/asks`, `.claude/hooks/jsonl-schema*`).
- Function-bag census (`node public/framework/code/patterns/function-bag-census.mjs --repo`) lists no file under `framework/ai/` any more.

## Left (smallest next step each; these have a dozen or more callers, so CLAUDE.md "Ask before: major surgery" applies)
- `rail/inbox.js` (29 importers, 940 lines): fold `Board`, `Says`, `Day`, `CardList` stay; move the loose helpers (`say`, `new_card`, `archive_card`, `items`, `sub_rows`, ...) onto `class Inbox` statics, keep `export *` shim for one release.
- `cards/card.js` (31 importers): helpers `TYPES`, `summary_line`, `card_link` onto `Card` statics.
- `rail/live.js` (17): `live_model`, `live_row`, `live_full`, `usage_head` onto `class LiveModel`.
- `cards/real.js` (4), `rail/groups.js` (8), `rail/rail.js` (`auto_transcribe`): same recipe.
- Known not from these changes: `/framework/ai/classes/session/` throws `SessionLive.load_days is not a function`; `check-classes.mjs` reports 11 missing `Session` members; the jsonl-schema test's `page.jsonl` / `ai2/fold.js absorb()` check fails (not checked on the base commit).
- Headless Chromium on a static server did not show tab content for `/framework/ai/system/`; the page loads with no errors on the live site.
- Preview levels inline/card/detail as one class API and live-property class cards: name the three levels on `ai/classes/` first (class-architecture page before building).
