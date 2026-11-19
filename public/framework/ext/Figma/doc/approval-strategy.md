# Approval strategy: get something approved (2026-11-16, voice-app)

Michael: "The same outcome always happens: things that are kind of what I asked for, but not perfect and not ready for approval." The fix is to approve a very small core first, perfectly, and build everything else only from approved parts.

## Phase 0: structure and hygiene (running, agent `roots`, the only editor)

- Every page has one frame named **Root**, with nothing overlapping and no connectors.
- Inside Root, the most important things come first: the purple-stroked masters folder, then the page's best content.
- No Inter anywhere: a lint pass over every page fixes all unstyled text.
- Resolution cards use h1 instead of the 128 display style.

## Phase 1: Approval set v1, on one page called "Approve"

Exactly these items, each shown perfectly, and nothing else:

1. **Tokens.** Scale values per mode, shown as live bound shapes. Scheme on its 4 grounds.
2. **Text styles.** The 8 styles in use.
3. **Card at every resolution.** A basic Card (kicker, title, body; the button optional and off) in a breakout row from 360 to 3440. Each column is a Region that sets width and mode; the Card is on Auto.
4. **Button.** Default (gray) and accent.
5. **Page + Section**, rebuilt locally from Michael's reference Page Set: 1920 page, 160 margins, Section = label + content.

Nesting budget: Region → Card → Content → Text group. Four levels at most. The gaps are `gap` from the Region's mode; `text-gap` is used only inside the text group.

Process:
- One builder agent builds the page.
- A second, separate reviewer agent checks it against the rubric and sends fixes back.
- Michael sees it only after the reviewer passes it, then flips the tags.

Rubric (all must pass):
- No same-on-same fills.
- Consistent margins.
- Nothing floating or overlapping.
- Text no wider than the measure.
- Cards hug their content.
- Zero lint errors.
- Every text node uses a text style.
- The nesting budget holds.

## Phase 2: rebuild from approved parts only

- Unapproved masters move to Archive.
- Pages consolidate to the 9 in `consolidation-plan.md`.
- Sizes becomes a breakout page built from the approved Card, Page and Section.

## Phase 3: previews

The top of every page is a "Preview" frame showing the page's best 10%. Index shows one preview instance per page, as Big Sloppy's Index did.
