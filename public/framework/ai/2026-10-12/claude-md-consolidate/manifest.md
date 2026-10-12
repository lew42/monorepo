# CLAUDE.md consolidation — sentence manifest

Base: `87afbdd55:CLAUDE.md`. Every sentence of the old file has exactly one row in `manifest.jsonl`; this page lists the ones that left CLAUDE.md. `node run.mjs check` proves none is lost.

| action | count |
|---|---|
| keep | 161 |
| move | 24 |
| merge | 22 |

## Moved to a topic doc (verbatim)

- **L9 Clear beats brief — by far** → `public/framework/ai/doc/writing.md`: L9.4 “Give me something I can chew quickly, without effort.…”
- **L12 Keep working; never wait on the owner** → `public/framework/ai/doc/readmes.md`: L12.12 “Keep the `readme.md` minimal (the reader's lightweight index…”
- **L18 (Presentation — always the overwhelmed newcomer (the owner, 2026-09-05))** → `public/framework/ai/doc/writing.md`: L18.4 “An index page is a wall of previews, kept small enough to di…”; L18.5 “Demonstration and report pages are held to this harder than …”
- **L24 Link every mention** → `public/framework/ext/Mention/doc/ideas.md`: L24.3 “Idea to evaluate: run all content text through one processor…”
- **L26 Readmes are the cheap index** → `public/framework/ai/doc/readmes.md`: L26.3 “A searching or indexing agent reads one readme and decides "…”; L26.5 “A session worth tracking gets a short readme of its own (an …”
- **L28 Audits go to Haiku** → `Servex/doc/budget.md`: L28.1 “**Audits go to Haiku** (the owner, 2026-10-08): under ~100k …”
- **L32 Classes are the structure; show them** → `public/framework/ai/doc/classes.md`: L32.3 “Document a thing as its class: an icon + class name card wit…”; L32.4 “A reader should see the structure, not paragraphs about it.…”
- **L34 A readme is a module's memory** → `public/framework/ai/doc/readmes.md`: L34.3 “Sub-readmes load on demand.…”
- **L38 The iceberg readme** → `public/framework/ai/doc/readmes.md`: L38.3 “So readmes are read on demand, each giving the lay of the la…”
- **L40 Name things, and write `.md` links as files** → `public/framework/core/Page/doc/markdown.md`: L40.2 “Markdown renders at `<dir>/md/<file>/` (see `core/Page/doc/m…”
- **L42 Haiku stays under 100k tokens** → `Servex/doc/budget.md`: L42.1 “**Haiku stays under 100k tokens** (the owner, 2026-10-08): C…”
- **L54 Write classes, not function bags** → `public/framework/ai/doc/classes.md`: L54.6 “When extending `Page`, mind its large API (it extends `Item`…”; L54.7 “A reader should see how the pieces fit from the class hierar…”
- **L56 Show the class** → `public/framework/ai/doc/classes.md`: L56.3 “A default renderer that walks a class's properties is accept…”; L56.5 “Tags that point at code use the familiar repo path plus clas…”
- **L58 Design the class architecture before you build** → `public/framework/ai/doc/classes.md`: L58.3 “Choose names with care: short, specific, never reusing a nat…”
- **L66 A name is a name plus its scope** → `public/framework/ai/doc/writing.md`: L66.3 “Put what everyone must see at the top; keep the detail one c…”
- **L70 Clarity is familiar structure** → `public/framework/ai/doc/writing.md`: L70.3 “Under it, only as many items as it takes, most important fir…”; L70.4 “Each item sits beneath the right parent, with the right chil…”; L70.5 “A familiar concept needs no explanation, only its name and a…”
- **L104 (The site is live while you edit it (the owner, 2026-09-19))** → `Server/doc/watch.md`: L104.3 “Streams (the chat log, the AI board) keep flowing during a h…”

## Folded into a shorter rule — original wording in the archive

- **L12 Keep working; never wait on the owner** → `public/framework/ai/doc/claude-md-archive.md`: L12.10 “If there is a safe, quick fix, attempt it; if not, **record …”; L12.11 “Write notes, legitimate questions, tradeoffs or implications…”; L12.13 “Superceded docs can be deleted cleanly in the future, but un…”
- **L22 How to respond** → `public/framework/ai/doc/claude-md-archive.md`: L22.2 “Each `###` heading names the thing (the class, module or pag…”
- **L24 Link every mention** → `public/framework/ai/doc/claude-md-archive.md`: L24.1 “**Link every mention** (the owner, 2026-10-08): whenever tex…”; L24.2 “Use the mention system (`ext/Mention`, `#Page` `@agent` `/pa…”
- **L28 Audits go to Haiku** → `public/framework/ai/doc/claude-md-archive.md`: L28.2 “Task audits, readme audits, searches and fan-outs use Haiku …”
- **L32 Classes are the structure; show them** → `public/framework/ai/doc/claude-md-archive.md`: L32.1 “**Classes are the structure; show them** (the owner, 2026-10…”
- **L34 A readme is a module's memory** → `public/framework/ai/doc/claude-md-archive.md`: L34.1 “**A readme is a module's memory** (the owner, 2026-10-08): e…”; L34.2 “Keep both fresh, so a new agent that reads them is fully up …”
- **L38 The iceberg readme** → `public/framework/ai/doc/claude-md-archive.md`: L38.1 “**The iceberg readme** (the owner, 2026-10-08): a parent rea…”
- **L42 Haiku stays under 100k tokens** → `public/framework/ai/doc/claude-md-archive.md`: L42.2 “A node script chunks big inputs (a raw session file, a log) …”
- **L48 Everything is linked** → `public/framework/ai/doc/claude-md-archive.md`: L48.1 “**Everything is linked** (the owner, 2026-10-08): the owner …”
- **L50 Moves and renames are scripted, never retyped** → `public/framework/ai/doc/claude-md-archive.md`: L50.3 “Also run a **visibility check** on anything we work on: if i…”
- **L54 Write classes, not function bags** → `public/framework/ai/doc/claude-md-archive.md`: L54.1 “**Write classes, not function bags** (the owner, 2026-10-08)…”; L54.2 “One class per file, the file named for the class (`SessionsP…”
- **L56 Show the class** → `public/framework/ai/doc/claude-md-archive.md`: L56.2 “Where a class has a UI, the demo shows two things side by si…”
- **L70 Clarity is familiar structure** → `public/framework/ai/doc/claude-md-archive.md`: L70.2 “(the owner, 2026-09-29) Build a hierarchy of understanding: …”
- **L77 Docs point, they don't explain** → `public/framework/ai/doc/claude-md-archive.md`: L77.1 “## Docs point, they don't explain…”
- **L91 Systems that shape every turn (the owner, 2026-09-30)** → `public/framework/ai/doc/claude-md-archive.md`: L91.1 “## Systems that shape every turn (the owner, 2026-09-30)…”
- **L97 References** → `public/framework/ai/doc/claude-md-archive.md`: L97.1 “**References:** `#Page`, `@agent` and `/path` in any text be…”; L97.2 “Use them instead of prose names.…”

