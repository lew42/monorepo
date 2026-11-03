# items

Array of item configs, defaulting to `[]` (`this.items ?? []`,
`Timeline.js:35`). The field-by-field shape — `at`/`from`/`to`, `label`,
`kind`, `url`, `lane`, `children` — is documented once, in the readme's
"Item shape" section, since it is the one config surface every method in
this file reads from.

Nothing validates an item at construction. An item with neither `at` nor
`from` produces `stamp(undefined)` → `NaN`, which then propagates silently
into every `calc()` as `NaN * 1em` — Chrome/Firefox both treat that as
`0` for layout purposes, so the failure mode is a mispositioned item, not a
thrown error or a console warning.

## Improvements

1. **No shape validation.** A `console.warn` for an item with neither `at`
   nor `from` (the one case every positioning `calc()` depends on) would
   turn a silently-misplaced bar into a diagnosable one — the same shape as
   the `orientation` and `zoom` gaps noted on their own pages. *(simple,
   useful)*
