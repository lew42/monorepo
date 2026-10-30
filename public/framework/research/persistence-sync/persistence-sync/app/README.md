# Research browser

A small static app for browsing this research on a phone or desktop: tools, categories and strategies, and every markdown doc (notes, lessons, the lew42 overview, the taxonomy, the report).

## View it

- Double-click `index.html`. It works from `file://` with no server, because the data is a plain script (`data.js`) and `app.js` is a classic script, not a module.
- Or serve the folder: `npx serve persistence-sync/app` (any static server works, including Cloudflare Pages with `persistence-sync/app` as the output directory and no build command).
- `hosted.html` is the same app in one self-contained file, for publishing as a single hosted page.

Markdown is rendered with `marked` from cdnjs (jsDelivr as a fallback). Offline, docs show as plain text.

## Rebuild after the data changes

From the repo root:

```
node persistence-sync/scripts/build.mjs
```

No dependencies. The build:

1. Reads every `data/ops/*.jsonl` op log, sorts the ops by `at` (ties keep file then line order) and folds them into one record per id. `set` replaces a field; `add` and `del` change a list, matching items by `value.id` or by value. Bad lines are skipped and listed, never fatal.
2. Merges `notes/adoption_metrics.csv` onto the records as `metrics`. A row's id comes from the id mapping table in `taxonomy.md` (any cell in a row maps to that row's `id` column), then from an existing op id that matches its name, package or repo, then from a kebab-case of its name.
3. Writes `data/tools.jsonl` (one record per line, sorted by id), `app/data.js` (`window.RESEARCH = {tools, taxonomy_md, docs, mentions, build, built_at}`) and `app/hosted.html`.
4. Prints counts, skipped lines, CSV rows with no op record, op records with no CSV row, and likely id mismatches.

`data.js`, `hosted.html` and `data/tools.jsonl` are generated; edit the op logs or the sources instead.

## Live updates on the hosted page

The hosted page declares the artifact `db` capability and reads three documents in collection `live`:

- `live/status` and `live/owner`: `{md, updated_at}`. When newer than the embedded copy, they replace STATUS.md / OWNER.md on Home without a republish.
- `live/build`: `{built_at}`. When newer than the page's own build, a "Newer version published" bar with a Reload button appears.

The build writes ready-to-send copies to `app/live/*.json`. Update them with the ArtifactData tool, e.g. `batch` with `set` on collection `live`, doc ids `status`, `owner`, `build`, `file_path` pointing at those files, and each document's current `version` as `if_version`. Only editors (`admin`) can write `live`; everyone who can open the page reads it. The page re-reads on every change (live or about every 30 s) and when it comes back to the foreground. Opened locally (file:// or a static server), it shows the embedded copies only.

## Navigation

One sticky header row, no tab bar: a ‹ back button (only below the top level: `history.back()`, or the parent page when the app was opened straight on that page) and a title button such as "Design ▾". Tapping the title opens a list. On a top-level page it lists Home, Design, Categories, Tools and Docs with the current one ticked. On a page below that, it lists "↑" entries (the parent list, then the section) and that page's siblings. Tap outside or press Esc to close. `navFor()` in `app.js` describes where each route sits.

## Design tab

`#/design` is a hub of four short lists, each one tap deep, and no page is longer than about two screens (a Phase 1 part with code excepted):

- `#/design/takeaways` and `#/design/takeaway/<id>`: Keep / Change / Adopt / Avoid, one line each. A takeaway page shows the line, the detail, the code and links for `see` (decision ids go to decision pages, numbers to Phase 1 parts). Data: `design/takeaways.json` `[{id, group, line, detail, code, see[]}]`; without it the build falls back to the bullets of `design/takeaways.md`.
- `#/design/decisions` and `#/design/decision/<id>`: rows grouped Open, Leaning, Decided (by `status`; a missing one counts as open), each with a status pill, a "clear win" tag when `kind` is `clear-win`, and your saved choice (from the database) or "recommended: …". The page shows the title with its status pill, the question, a one-line agents' banner, context, the optional `example` code, the option buttons, a note, a collapsed Details section, the refs, and "Found along the way", with previous and next links. Data: `design/decisions.json`, each `{id, title, status, question, context, example, detail, options[{id,label,summary,added_by}], recommended, kind, refs, analysis}`.
  - `analysis` (optional) = `{agreement, analysis_recommends[], confidence, options{<id>:{wins[], fails[], worst, precedents[], picked_by[]}}, surprises[], sources[], notes}`. The banner reads "Agents: both pick X · confidence 3/5" or "Agents split: A vs B"; tap it for the full sentence and notes. Under each option a tiny line shows worst-failure dots (●●●○○ = severity 3, from `worst`, else the largest "(sev N)" in `fails`) and "picked by N"; its "why" button opens wins, fails, precedents and who picked it (it never chooses the option). Options with `added_by: "analysis"` get an "added by agents" badge. `surprises` are the "Found along the way" list.
  - `detail` (markdown) is drawn on first open of Details with the same renderer as the docs: tables sit in a scroll wrapper, `js`/`json` code is coloured, reference codes and repo `.md` paths become links. Tapping an option writes `{choice, note, at}` to the artifact database, collection `decisions`, doc id = decision id. Editors write, everyone who can open reads; the page declares `db` rules for `live` and `decisions`. Without a database (file://) choices save on the device only.
- `#/design/phase1` and `#/design/phase1/<n>`: `design/phase-1.md` split at its `## ` headings (outside code fences) by the build, one page per part, with previous and next links.
- `#/design/fixes`: the numbered list of `design/fixes.md` (title, effort S/M/L, test ids; tap a row for why), plus "Notes for later".

The build embeds all of it as `RESEARCH.takeaways`, `.decisions`, `.phase1` and `.fixes`, and lists anything it could not read in the footer's build notes. Rebuild and republish to pick up changes to these files. Code blocks tagged js/json are coloured by highlight.js (cdnjs, jsDelivr fallback); offline they stay plain.

## Reference codes become links

In the design pages and in the docs where they mean this (design/*, lessons/*, lew42/overview.md, report.md; STATUS, OWNER and README without F6/F7, which are the owner's own forks):

- `D1`–`D12` open that decision page. `T1`–`T6`, `F1`–`F10`, `R1`–`R9` open the lessons doc that defines them (object-model, storage-compaction, sync-protocol) at that heading, highlighted. "gap N" opens the lew42 overview at that gap's heading.
- Repo-relative `.md` paths open that doc (in any doc).
- Nothing is linked inside code blocks or headings, after "your " (your F6), or where `D1` / `R2` read as Cloudflare products. Doc links use `?find=<term>&at=h`: the viewer highlights every match and starts at the first one inside a heading.

## Links

Routes live in the hash, so links can be shared and Back works:

- `#/tools?q=sqlite&cat=…&sort=dl` – tool list with filters
- `#/tool/yjs` – one tool
- `#/` – Home: needs your attention, status, key links
- `#/design` – hub: takeaways, decisions, phase 1 classes, fixes (see above for the pages under it)
- `#/categories` – categories as tool pills, then shared layers, design choices and features
- `#/docs?q=compaction` – doc list with full-text search
- `#/doc/notes/sync_engines_crdts.md?find=Hocuspocus` – a doc, with matches highlighted

## Files

- `index.html`, `app.css`, `app.js` – the app (vanilla JS, no build step)
- `data.js`, `hosted.html`, `live/*.json` – generated by `scripts/build.mjs`
