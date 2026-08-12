`"Default Page Title"` → `"default-page-title"`.

**Usage** — one caller: `naming()`, which derives `/default-page-title/` from
`title` when a page has neither `meta` nor a parent — so a demo tree's root
writes no url line at all. A static, so it also answers as a utility:
`Page.slug(text)`.

**Necessity** — earned by that derivation. Lowercase, any run of
non-alphanumerics collapses to one hyphen, edges trimmed: `add()` → `add`,
`Page shapes` → `page-shapes`.

**Simplicity** — three chained replaces. Deliberately not a general slugifier —
no unicode folding, no uniqueness — because a fictional url needs neither, and a
real page's url comes from the filesystem, never from here.
