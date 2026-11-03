# Past work: the per-file documentation system

```
module/
├── page.js        files: [...]  hand-typed list
├── Thing.js
└── doc/file/
    └── Thing.js.md   the note, shown beside the source in the Files tab
```

**Answer:** it exists. It is the `doc/file/<path>.md` convention: a note beside each file, shown next to the source in a module's **Files** tab. This is the system the owner half-remembered ("doc subdirectory or a doc/file sub namespace"). It is built, live, and has 349 notes on disk.

## Ranked finds

1. **The renderer: `ext/Doc` Files tab.** `public/framework/ext/Doc/Doc.js:200` passes `about: path => md.file(this.meta, \`doc/file/${path}.md\`, { h1: false })` into `ext/files`. A file's note shows in a column beside its source. Works today by code reading. Not browser-checked in this search. Confidence high.
   - Last changed: `f86d9065a`, 2026-10-19.
2. **The contract: `ext/files` `about` hook.** `public/framework/ext/files/doc/about.md` documents `files(meta, names, { about })`. `ext/files/page.js:19,24` shows the call. Confidence high.
   - Last touched: `12aec4bdb`, 2026-10-13.
3. **Where the notes are.** `doc/file/` folders sit under the module, for example `public/framework/ext/Panel/doc/file/` (40 notes), `ext/DesignTool` (38), `ui` (35), `ai/AITask` (24), `ext/demo` (13), `ext/highlight` (12), `dev/DevBar` (11), `core/Page` (11). Total 349 on disk today (2026-10-24).
4. **The list of files is hand-typed, on purpose.** `public/framework/ext/Doc/doc/files.md` ("Why the file list is declared") says `files:` is authored, not crawled, because `directory.json` is gitignored and a crawled tab would be blank in production. `ext/Doc/readme.md:16,29,43` links it. Confidence high.
5. **The audit of this system, 2026-08-30.** `ai/sessions/2026/08/30/doc-file-verdict/` (371 notes then): reachable 334 (90%), sample of 12 was 11 fresh, 5 of 5 added value beyond the source comments. Verdict: keep, prune orphans only. `ai/sessions/2026/08/30/doc-file-prune/` deleted 37 orphans (styles/*, and one ext/Timeline note). Confidence high.
6. **Memory note.** `memory/doc-system-2026-08-15.md` lines 25–28: `files:` is declared, never crawled. Points to `ext/Doc/doc/files.md`. Confidence high.
7. **Dropped Files lines, 2026-10-14 and 2026-10-20.** Commits `cd080619e` (`ai/AISession/page.js`) and `0a25deb80` (`core/Item/Dated/page.js`) each removed one `files:` line, "it asks for per-file doc pages that do not exist". Those pages had no notes. Caveat: a page with a missing note gets no Files tab. Confidence medium: the reason is the commit message only.
8. **The owner's newest asks, still open.** `ext/Doc/readme.md:55–56` lists two ⬜ items, cited to prompts 2026-10-24T00:20:16Z: (a) every markdown file as a page, using each folder's `files.jsonl` as the index; (b) a files widget for a folder's real files, placed where it helps. Confidence high that they are open. Not built.

## The owner's past words

- **2026-10-20 prompt** (`ai/2026/10/20/session-e00f55c9/page.jsonl` line 402): "a per file README… in the doc subdirectory or a doc/file sub namespace". Answer: `doc/file/`, below.
- **2026-10-24 00:20:16Z** (`ai/sessions/2026/10/20/session-e00f55c9/prompts.jsonl`): the two open items in find 8.

## Method notes

- **Found it fast:** `node Server/PastWork.mjs "doc/file"` (top hit: the 2026-08-30 verdict). Then one grep for `doc/file/` in `.js` and `.mjs` gave the renderer in one pass.
- **Wasted time:** `PastWork.mjs "per-file doc"` returned mostly comment-prune and figma tasks. The grep for `per[- ]file|sidecar|companion` returned about 80 hits, most of them audit and readme prose. `find -name "*.doc.md"` found nothing; the convention is a folder, not a suffix.
- **Missed by the brief's terms:** the name `doc/file` plus the word `about`. `ext/files/doc/about.md` is the file to read, not any `FileDoc` class (none exists).
- **Context at the end:** the total-tokens counter went from 15.00M to 14.88M over this search, about 116k. The brief allows past 100k.

## Not checked

- Whether every one of the 349 notes still matches its source file. The 2026-08-30 sample of 12 is the only staleness data.
- Whether `ext/files` renders the note in the browser today. Code path is read, not clicked.
