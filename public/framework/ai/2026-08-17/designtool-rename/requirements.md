# The atomic rename: `LayoutTool` → `DesignTool`

Mike, 2026-08-17: *"go ahead and rename the LayoutTool to DesignTool, so we can
have all the design elements, layout being a big piece."*

The module is finally clear — no other agent is inside it. **This is the one
window to do this in a single atomic pass.** Do the rename and nothing else: the
tool's four known calibration bugs and its two-screens/devbar problems are queued
as separate tasks and are **not yours**.

## Derive your own file list — the existing manifest's counts are wrong

`ai/2026-08-17/rename-manifest/manifest.md` has a **sound sequence, a sound
do-not-rewrite principle, and a sound risk ranking** — read those and use them.
**Its counts are unreliable and must not be trusted:** it reported 3 JS imports
where a grep finds 15, attributed two of them to markdown skill files that cannot
contain an import, and its category counts sum to ~373 against its own stated
total of 1,166.

So **grep fresh and work from your own output.** The repo also changed under it —
`styles/layouts/` was rewritten after that inventory was taken.

⚠ **Before trusting any sweep, find the files grep silently skips.** A file
containing a NUL byte is classified *binary* and drops out of every content search
without a word. One such file existed here today — `styles/layouts/space/search.js`
used a literal NUL as a delimiter, and it imports this very module. It's fixed, but
**check for others**: compare `grep -rl` against `grep -rIl` (the `-I` flag skips
binary), or list files where grep reports "Binary file … matches". Any hit is a
file your sweep would miss.

## Scope — what changes

1. **The directory**: `public/framework/ext/LayoutTool/` → `ext/DesignTool/`, and
   any file whose name carries the old name.
2. **Import specifiers** — real URLs, root-absolute or explicit-relative (LAW#3).
   There are ~15; **5 sit outside the module** in live site code, including
   `styles/layouts/space/gen.js`, `space/page.js`, `space/search.js`,
   `styles/rules/demos.js`. Find them all yourself.
3. **Urls in content** — `md()` prose, `page.js` links, `children:` entries, and
   ⚠ **`audit/pages.js`'s own url corpus**, which lists site urls *including the
   tool's own pages*. This is the **#1 silent-failure risk**: a stale url there
   makes the audit measure a 404 and report nothing amiss.
4. **CSS classes `.lt-*` → `.dt-*`** — ~61 of them. **This is decided; do it.**
   A module called DesignTool emitting `.lt-*` is the half-finished artefact
   RULE#18 exists to prevent. ⚠ It is the **#2 silent-failure risk**: CSS has one
   namespace and the class name is the registry, so a renamed emitter with an
   unrenamed selector fails invisibly. **Verify by construction — the count of
   class names emitted from JS must equal the count of selectors in CSS, before
   and after.** Report both pairs.
5. **Exported symbols** — rename any that carry the old name. `analyze`, `rate`,
   `probe` and `grade` do not, so most call sites keep working.
6. **Prose** in `readme.md`, `doc/*.md`, `knowledge/*.md`.
7. **`.claude/skills/`** — update references to the tool. ⚠ **Do not rename the
   `layout-design` skill itself**: it is about designing layouts, not about this
   tool, so its name stays correct. Same for `css-strategy`.
8. **`CLAUDE.md`** — check whether it names the tool at all and update if so.

## What must NOT be rewritten

⚠ **Historical records recorded what was true on that day; rewriting them
falsifies the record.** Leave alone:

- every `public/framework/ai/*/*/task.jsonl`
- every dated `requirements.md` and dated `*.md` record under `ai/`
- task directory names like `2026-08-14/layout-tool/`, `2026-08-16/layout-tool-live/`
- git history

If a historical page's *link* now 404s, that is acceptable and expected — note it,
don't rewrite history to hide it. State this principle in your log.

Also do not sweep `layout` as a bare word: variables, classes and prose about
layout-the-concept are unrelated. **Report how many of your grep hits are
false positives** a naive replace would have corrupted.

## Verify — silence is the failure mode here

A missed import throws loudly. Everything else in this rename fails quietly, so
prove each one:

- **Every page under the renamed module loads with zero console errors**, and the
  old urls are gone from the site (a stale `children:` entry 404s only when
  clicked).
- **`audit/pages.js`'s corpus resolves** — every url in it returns 200.
- **The emitter/selector counts match** (see 4).
- **The tool still runs**: `analyze()` and `rate()` both work against a live page
  and return the numbers they returned before. ⚠ Note that `probe` and the taste
  tier's outputs must be **unchanged** — this is a rename, so any number that
  moves means you changed behaviour, and that is a bug to fix, not a result.
- Nothing under `styles/layouts/` broke: it imports the tool from four places.

## Files you own

- `public/framework/ext/LayoutTool/**` → `ext/DesignTool/**`, everything in it.
- Every file outside it that references the old name, **except** the do-not-rewrite
  list above.
- `.claude/skills/**` references, `CLAUDE.md` if it names the tool.
- `public/framework/ai/2026-08-17/designtool-rename/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Fenced off:** `ext/Panel/**` (another session). `ai/2026-08-17/rubric-v2/**` and
`ai/2026-08-17/vision-baseline/**` (another agent is working there right now —
read-only, and `baseline.json` especially must not change).

## Deliverables, in this order

1. **The completed rename, verified** by every check above, results logged.
2. **The emitter/selector count pairs** and the false-positive count.
3. The list of historical links now knowingly 404ing, with the principle stated.

Running short? **Stop at a coherent point and say exactly where you stopped** — a
half-renamed module is the worst possible outcome, far worse than a fully
un-renamed one. If you cannot finish, revert to a working state and report that.

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.json)) { Start-Sleep 15 }`
- Use `git mv` / `git status` to keep the rename legible in the diff — but
  **never commit and never push** (LAW#5). Deliverables land in the working tree.
- Playwright is installed globally (LAW#4 — no npm dependencies). Reuse the dev
  server on port 80; **do not restart it**, another agent is using it.
- Assert `document.visibilityState === "visible"` before any measurement: hidden
  tabs run no rAF or ResizeObserver and return frozen geometry.
- Never wait for `networkidle` — the live-reload socket never idles.
- Restate the full layer order in any stylesheet you touch:
  `@layer base, theme, site, util;`. Every rule inside a layer.
