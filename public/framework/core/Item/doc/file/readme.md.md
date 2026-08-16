The maintainer's document: what an `Item` is, the wire envelope, four traps,
seven verdicts with the options that lost, and two open items. Written by the
2026-08-13 persistence council and largely unchanged since — this audit added
only a **Used by** section, since nothing here had recorded who actually calls
the class.

It is also the design record cited from the bottom of `page.js` via
`md.details`, so a reader on the live page and a reader in the repo see the
same file, not two versions of the same argument.

## Improvements

1. **No "Used by" section existed before this audit.** A module with four real
   importers (`ext/Panel`, `ext/editor`, plus two demo-only imports) had no
   record of that anywhere. Added; see the readme itself. *(simple, important
   — this is the finding the audit brief calls out by name.)*
2. **The "Open" section's two items are still open.** Worth a second pass once
   `ext/Panel`/`ext/editor` (its two real subclassing consumers) have had more
   mileage — a subclass constructor doing async setup would be the first real
   test of the `Item.open()` ordering guarantee. *(medium, speculative — needs
   a second caller's experience, not more reading.)*
