# Refine: tagged prompts reach their module's page inbox

The owner's words (2026-10-12, relayed): when a refined prompt card is tagged with a module (ext/Refine, core/Page, ext/Figma ...), the item should reach that module's own page automatically, programmatically (compute, don't recall), as a note in that page's inbox: reuse the existing Inbox class (core/Page/ext/Inbox, one class two views, rail + compact; written by Servex page_note onto the target page's page.jsonl as a {"note": ...} line); do not build a second inbox. Map tag -> page path with a script from the real tree; a tag with no page gets no note but is listed. The note carries a link to the source prompt (session + sentence indexes), never a retyped copy. Smallest slice: one tag, one note, visible in that page's rail. Commit each step.

1. tag -> page map computed from the tree: `TagRouter.page_for`.
2. one note per tag through the existing Inbox writer.
3. no page: no note, listed in `tag_notes.unrouted`.
4. the note links session + sentence numbers.
5. test + doc.
