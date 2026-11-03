# Brief E — the Needs-review filter on the inbox rail (follow-on to brief D)

Owner's words verbatim: owner-words-0929.md beside this file. Read them first. Same worktree, same rules as brief D.

**One concept, one flag, one source of truth.** "Needs review" IS the set your Needs you tab lists. Use the SAME function to decide it (export it from one module; the tab and the filter both call it). Do not invent a second flag.

1. **A small toolbar on top of the inbox rail**: holds `+ New card` and the filters, with room for more filters later.
2. **First filter: a "Needs review" checkbox.** On → the rail shows only needs-review rows. Its state is in the url (e.g. `?review=1`) so a reload keeps it.
3. **In a flagged card, an obvious "Reviewed ✓" control** that clears the flag. Clearing writes ONE line to the card's page.jsonl (e.g. `{"reviewed":{"at":…}}`) through the path the page already uses to append to a card (Servex /card/append); the needs-review function treats a card whose last reviewed line is newer than its last ask as cleared. The row leaves the filtered list and the Needs you tab.
4. **Remove the rail's text area and Send button** above + New card.
5. **Remove the folder icon and "Folder" label above the AI 2 title** (the owner: "way out of place, and takes up a bunch of space").
Leave the ☰ drawer alone.

Proof: shots rail-review-1920.png (filter on) and card-reviewed-1920.png (the control), plus one clear tested against a throwaway card on a PRIVATE path or `?servex=http://127.0.0.1:1` refusal — never write test lines into real cards. Smoke clean, commit, report.
