# Rename manifest: `LayoutTool` → `DesignTool`

Mike, 2026-08-17: *"go ahead and rename the LayoutTool to DesignTool, so we can
have all the design elements, layout being a big piece."*

The rename must execute as **one atomic sweep** with nothing else touching the
module. It can't run yet — another agent is still measuring with the tool. **Your
job is the manifest, not the rename.** Change nothing.

## This is an inventory task — paste evidence, don't summarise it

⚠ A previous scout on this repo reported five line citations and **all five were
wrong, every one under-counting in the same direction.** Consistency across items
is the tell that one mistake was made five times. So the rule here is absolute:
**paste the actual command output.** Do not retype counts from memory, do not
estimate, and do not summarise a list you didn't print.

Run these and record the real output of each:

```bash
grep -rn "LayoutTool" --include="*.js" --include="*.css" --include="*.md" --include="*.json" --include="*.html" . | grep -v node_modules
grep -rni "layout-tool\|layout_tool\|layouttool" . | grep -v node_modules
grep -rn "LayoutTool" .claude/
```

Then count per category with `grep -rc` or by counting the printed lines, and make
the categories add up to the total. If they don't add up, say so.

## Categorise every hit

1. **Directory path** — `public/framework/ext/LayoutTool/` itself, and every
   subdirectory. Give the full tree and a file count.
2. **JS import specifiers** — real URLs, root-absolute or explicit-relative
   (LAW#3). These break instantly if missed.
3. **Urls in content** — links in `page.js` files, `md()` prose, `children:`
   declarations, and **`ext/LayoutTool/audit/pages.js`'s own url corpus** (it lists
   site urls including its own).
4. **Class names / CSS selectors** — anything like `.layout-tool-*`, plus JS that
   emits those classes. ⚠ CSS has one namespace and **the class name is the
   registry**; a renamed emitter with an unrenamed selector fails silently.
5. **Exported symbol names** — classes, functions, variables containing the name.
6. **Prose in docs and readmes** — `readme.md`, `doc/*.md`, `knowledge/*.md`.
7. **`.claude/` skills** — the `layout-design` skill and any other that names the
   tool. Note: the *skill* is about layout design generally, so its own name may
   well be correct as-is; flag it, don't decide it.
8. **CLAUDE.md** and any memory-style docs.
9. **Historical AI task logs** under `public/framework/ai/*/*/task.jsonl` and any
   dated `*.md` records.

## The three questions the manifest must answer

- **What is the exact ordered sequence** for an atomic rename? Name what must move
  together or the site breaks between steps (directory move vs import updates vs
  the url corpus).
- **Which hits must NOT be rewritten?** ⚠ Category 9 is history: a task log
  recorded what was true that day, and rewriting it falsifies the record. State
  the principle and list what falls under it. Same question for `git log`.
- **Where are the silent-failure risks?** Rank them. A missed import throws
  loudly; a missed CSS selector, a missed url in the audit corpus, or a stale
  `children:` entry all fail **silently** — and a declared child with no `page.js`
  behind it 404s only when clicked.

Also flag anything where the name is genuinely ambiguous — a variable called
`layout` that has nothing to do with the tool must not be swept. **Say how many
false-positive hits your greps returned**, because a naive find-and-replace over
that output would corrupt them.

## Hard constraints

- **Change nothing. Zero edits outside your own task dir.** This is read-only
  reconnaissance; the sweep is a later task.
- Do not run the tool, do not measure anything, do not screenshot.
- `ext/LayoutTool/**`, `styles/layouts/**`, `ext/Panel/**`, `Server/**`,
  `ext/JSONL/**`, `ext/AITask/**` — all read-only to you, along with everything
  else.

## Files you own

- `public/framework/ai/2026-08-17/rename-manifest/**` — your task dir only,
  including `manifest.md` (the deliverable).
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

## Deliverables

1. **`manifest.md`** — every hit, categorised, with file and line, plus the
   per-category counts and the total.
2. The ordered rename sequence, the do-not-rewrite list, and the ranked
   silent-failure risks.
3. A one-line summary in your `task.jsonl` with the headline number: how many
   files, how many references.

## Working notes

- **Foreground is the default** — these greps take seconds. Don't background
  anything.
- Use the `Grep` tool rather than shelling out where you can; it handles this
  repo's paths correctly on Windows.
- Print output; don't paraphrase it. An unverified count is worse than no count,
  because the sweep will trust it.
