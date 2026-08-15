# Reuse — before you define a new block

> "we don't want to define similar blocks, if we already have something like
> that, it creates duplication, confusion, and harder to update both"

A near-duplicate is worse than either the thing it copies or a genuinely new
thing. It splits the answer to one question across two files, and every later
change has to find both. The cost is not the twenty lines; it is that from then
on **nobody can tell which one is the real one.**

## The census, first

Before writing a class, find out what already answers the question:

```bash
rg "class=\"[^\"]*card" public/ --glob '*.js' -o | sort | uniq -c | sort -rn
rg "^\s*\.[a-z-]+\s*\{" public/framework/framework.css -o
```

The vocabulary you are looking for is small and it is worth knowing by heart:

- **Arrangement** — `flex`, `grid`, `auto`, `gap`, `v`, `wrap`, `v-center`,
  `h-center`, `split`, `flex-1`, `basis`, `three`, `all-1`
- **Surface** — `surface`, `wash`, `tint`, `muted`, `pad`, `all-pad`
- **Measure** — `measure` (34em), the page's `--measure` (52em)
- **Type** — `h1`–`h4` as classes, `code`, `capitalize`, `uppercase`
- **Components** — `.page-preview`, `.page-previews`, `.sidebar-link`,
  `.ui-table`, `.tab`, `.tab-bar`

## The three questions

**1. Does something already do this?** If yes, use it. If it is *close*, prefer
extending it — a modifier class on the existing component — over a sibling.

**2. Is the difference a value or a vocabulary?** A different colour, gap or
column count is a **token override**, not a new component:

```js
div.c("grid auto gap").style({ "--column": "22em" })   // ✅ same block, new value
```

A genuinely different *arrangement* — something the existing block has no word
for — is a new block.

**3. Will there be a third?** One-off styling belongs at the call site. A
pattern earns a name on its **second** appearance, and by the third it should
have one. Naming the first occurrence guesses at a shape you have only seen
once.

## One demo system, five blocks

Anything that shows an example is built from exactly five things, and a sixth is
a proposal rather than a commit:

1. a `Page` — demos are pages
2. `preview()` / `previews()` — the only preview
3. the `ext/demo` stage — the only resizable viewport
4. the `ext/layout` panel — the only interactive control surface
5. the utility vocabulary

The census that forced this rule found **fourteen** mechanisms, four of them
preview cards. (`framework/ai/2026-08-09/proposal.md`.)

## The class name is the registry

CSS has one namespace and no build step, so **the name is the only index there
is.** Prefix a class with its owning component (`.page-preview`, not
`.preview`), and if your CSS styles a class you do not emit, import the module
that does — the import *is* the loading edge, not an annotation:

```js
/* css: .page, .page-title, .page-previews, .page-preview */
import "../Page/Page.class.js";
```

## When a duplicate is already there

Do not leave both and pick a favourite. Either **merge** (one keeps the name,
the other becomes an alias, callers move over one commit) or **name the
difference** — if they genuinely differ, the names should say how, and if you
cannot say how, they are the same block.
