# Inbox rail: the scrollbar disappears into the page until you hover (brief)

**Owner (2026-10-12):** a clean rail with no visible gutter or colour gap between the rail and the detail area.

## The technique
- **One ground:** the rail's container (the inbox's left sidebar) gets the same light gray background as the detail area, so rail and detail read as one surface.
- **White on top:** each card and the rail's sticky header are white. The rail list itself has no padding; each card has the default padding.
- **Scrollbar:**
  - Thin, and **transparent until the rail is hovered**. Hovering shows the thumb on the light gray, which matches the right side.
  - No `overflow` toggling, so the layout never jumps: always `overflow-y: auto`, only the colour changes.
  - Use `scrollbar-width: thin` + `scrollbar-color: transparent transparent` → on `:hover`, a visible thumb; plus the `::-webkit-scrollbar` equivalents if needed. Check Chrome on Windows and Android.
- **Leave for now:** the detail page's column-paging header border (it may conflict later; note it).
- **Mobile:** the rail becomes a full-width page; tapping an item switches to the detail page (a switcher, not columns), with a way back. Check it really works at 400 px.

## Where
Find the one inbox rail (law 6): `ux/Inbox/Inbox.css`, `core/Page/ext/Inbox/Rail.js`, `ai/rail/rail.css` (and `ai/v/3/v3.css` if the AI inbox uses it). Change the shared component, so every rail gets it.

## Done when
- [ ] Screenshots at 400/1200/1920/3440, before and after, plus a hover shot showing the scrollbar (`ui-test` skill: hover, then shoot).
- [ ] The mobile switcher works: tap through to the detail and back, shot.
- [ ] `hold.mjs` around the CSS; smoke clean; commit; merge; land with `finish-task`.

Sonnet 5.5. Worktree; `STATE.md` here; one-sentence replies.
