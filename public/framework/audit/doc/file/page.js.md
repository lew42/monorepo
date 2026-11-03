The Overview for the whole audit: the synthesis (citation rot, docs that were
confidently wrong, what got fixed versus recommended, what the skill itself
learned) plus a Docs tab built by overriding `docs()` rather than by handing
`notes:` a list of real names.

## `AuditDoc` overrides `docs()` because the slugs need re-titling

`notes:` normally shows each name as its own tab title, but every name here
is a flattened slug — `core-View`, `ext-DesignTool` — because a note cannot
hold a `/`. `docs()` reverses that with one regex
(`name.replace(/^(core|ext|dev)-/, "$1/")`) purely for display; the files on
disk stay flat.

## `leaf: true`, because this page's children are tabs, not nav

The framework sidebar lists a section's `children:` as sub-entries. Without
`leaf`, converting this top-level page to a `Doc` would spill *Overview · API
· Docs · Files* into the site sidebar as if they were pages of their own.

## It says outright that it is a snapshot

The `description` is dated (`2026-08-15`), and `content()` opens by pointing
at Priorities and Organization rather than repeating them — the Overview is
deliberately thin because the findings themselves live one click away, not
because there was nothing to say.

## Improvements

1. **`md(ui ? "" : "")` is dead code** — both branches of the ternary are the
   empty string, so the line renders nothing regardless of whether `ui` is
   truthy, and the only reason `ui` is imported at all. Safe to delete.
   *(simple, important.)*
2. **Nothing enforces the readme's own "delete when done, don't maintain"
   rule.** `page.js` carries the audit's date in prose but no code checks it
   against, say, the recommendations being marked done or rejected elsewhere —
   a living audit is one edit away from becoming a stale one nothing flags.
   *(medium, speculative.)*
