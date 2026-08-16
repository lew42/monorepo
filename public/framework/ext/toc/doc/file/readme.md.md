## `readme.md`

The design record: every decision `toc.js`/`toc.css` embody, argued rather than just
stated, plus the traps that fail silently and the open questions. Cited from the page
itself via `md.details(import.meta, "readme.md", …)` at the bottom of the Overview, so
it is read twice — once here, once collapsed under the live page.

## What's in it and why it's split this way

**Decisions** carries the five choices that could plausibly have gone another way
(scan vs. declare, when to scan, the rejected `IntersectionObserver`, `current` vs
`active`, `sticky` in a grid track) — each as question, options weighed, verdict.
**Traps** is the four things that fail with no error at all. **The skip list** is a
one-paragraph pointer to `doc/skip-list.md`, broken out because the two-galleries story
is longer than a readme section should be. **Open** is what's still unresolved,
honestly stated as questions rather than as decided-and-deferred.

## Improvements

1. **The Decisions section alone is most of the file's length** — consistent with the
   reference shape (`ext/doc/readme.md` is the same shape, similarly long), so not
   flagged as a defect here, but see Skill feedback in the audit report: the skill's
   "keep the whole readme to one screen" reads as a stronger constraint than either
   readme actually honors. *(n/a — a documentation process question, not a file fix)*
2. **The sticky-vs-fixed story appears in both Decisions and is referenced again from
   Traps' CSS entry** — a short cross-link (`see Decisions above`) would save a reader
   who lands on Traps first from wondering if it's a second, different incident.
   *(simple, speculative)*
