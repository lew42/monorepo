# The Shell, and the dark dev shell: requirements

The owner's words are in `owner-words.md` (the dictation may have been cut off; more may follow and will be appended). Read them in full.

## Asks
1. **A general SHELL:** it wraps any page in optional regions: a HEADER, a LEFT sidebar, a RIGHT sidebar and a FOOTER. Every region is optional. Headers and footers are MINIMAL (a thin bar: properties, path, toolbar buttons). Shells NEST (a shell within a shell). The usual patterns are two or three regions.
   - Start from what exists; don't invent a second one: /layouts/shell/ (and its Shell.js), core/Sidebar and its variants, ext/drawer (the right rail), ext/grip (resizing), and the HTML study at /framework/ai/sessions/2026/09/29/cards/layout-explorer-3-columns-and-a-study-of/html-study.md (its recommendation for named sidebars: app.left, app.right).
   - It belongs in core (core/Page/layout/ or core/Shell); coordinate with mastermind-page, which owns core/Page and its layout audit.
2. **The DEV SHELL:** Ctrl+\ (today's dev bar shortcut) toggles a DARK-MODE shell around the whole site, which is obviously different from the site. It MERGES the dev bar into it: the dev bar's tools move into the shell's regions. Scrap most of the dev bar's own CSS and lean on the site's CSS and tokens (a dark theme via the existing tokens, not a separate stylesheet world).
   - The default dev shell is left and right sidebars; the header and footer are optional and thin.
   - Nothing breaks for pages underneath; toggling it off returns the page exactly as it was.
3. **Demos:** the Shell with each combination (L, R, L+R, with and without a header and footer, and nested), plus the dev shell on a real page, at 400, 1920 and 3440.

## Rules
Keep the old dev bar reachable as v1 until the owner approves. Use a pool worktree, the smoke test (links followed), merge.mjs, the review skill, and screenshots at 4 widths. At most 2 minions; budget $15, hard. The owner said to use a new mastermind for this.

