# Start here: Lew42 v3 (current, 2026-11-18)

**Lew42 v3 is the current Figma file.** It is a fresh, simple restart. The goal: a near pixel-perfect Figma-to-browser design system, so the browser stops coming out with the wrong colours and sizes. Simpler is better.

- File: [Lew42 v3](https://www.figma.com/design/JYGQX0WaBO4HcGMZTkL2rx/Lew42-v3), key `JYGQX0WaBO4HcGMZTkL2rx`.
- Work only in v3 unless told otherwise. v2 (`ADpu9u2V0BlEZfR3rrMfER`) is the previous attempt: read it for ideas, don't edit it.

## Pages

AI · Index · Scale · Proposal · Split squeeze · Images · Icons · Colors · Content · 500 Mobile · 1000 Default · 1920 Desktop · Archive. The **AI** page (first) shows the 8 rules below; change them here first, then on the page. The **Index** holds the three size Previews (500, 1000, 1920) and is the design system: [v3-index.md](./v3-index.md). **500 Mobile, 1000 Default, 1920 Desktop** each have one Root: the size card, its Preview, then Layouts and Content.

- **Scale** holds the owner's own Card and Button masters and the 500 / 1000 / 1920 Wrappers.
- **Proposal** shows the accepted cards-and-sections examples (nesting with `darken`, a rounded card needing padding around it) and one open proposal, where content lives: [v3-content-map.md](./v3-content-map.md). The declined card proposals are on the Archive page: [v3-card-proposal.md](./v3-card-proposal.md).
- **Split squeeze** lines up two Default half cards with a Desktop card above them, in three setups: [v3-split-squeeze.md](./v3-split-squeeze.md).
- **Colors** is a live token sheet: every swatch is bound to its variable, with Colors (primitives) and Color Mode in Light and Dark side by side (the mode is set on each column). Color Mode's default (first column) is Light.
- **Content** and the size pages are the owner's, built by hand.
- **Archive** holds retired masters (`.Proposal/Media`).
- **Images** holds the Image placeholder master and an Image Set (placeholder plus grayscale fillers); masters are marked with a purple dashed frame: [v3-images.md](./v3-images.md).

## Collections (variables)

| Collection | Modes | What it holds |
|---|---|---|
| Lew42 v3 - Colors | one | prime, light, dark, error, ok, warn, master, tint |
| Lew42 v3 - Color Mode | Light, Dark | text, muted, fill, lighten, darken (accent and on-accent removed by the owner, 2026-11-18) |
| Lew42 v3 - Scale | 500 Mobile, 1000 Default, 1920 Desktop | width, column-min-width, size/0-5 … size/4, pad, gap, text-gap |
| Lew42 v3 - Constants | one | squeeze (1600) |

Text styles: h1, h2, h3, h4, body, label, small (Montserrat, sizes bound to Scale) and code (JetBrains Mono 14, fixed).

## The scale (details: [v3-scale.md](./v3-scale.md))

- `size/1` is 1em: **14 on Mobile, 16 on Default, 20 on Desktop.**
- Steps are multiples of it, rounded: 0.5, 0.75, 1, 1.5, 2, 3, 4 (Default: 8, 12, 16, 24, 32, 48, 64).
- The owner's aliases (edited by hand, 2026-11-18), Mobile / Default / Desktop: pad = size/3 / size/4 / size/4 (42 / 64 / 80); gap = size/2 / size/2 / size/3 (28 / 32 / 60); text-gap = size/1 / size/1 / size/1-5 (14 / 16 / 30). h1 = size/3, h2 = size/2, h3 = size/1-5, body and label = size/1, h4 and small = size/0-75.
- **How to use:** set the Scale mode on the frame that decides the size (a page column, a section, or a single card). Everything inside inherits it, buttons and text included. Unset means inherit; set means locked for everything inside. A size master (the owner's `500`) sets its own Scale mode; content masters set none.
- See it on the Scale page: the owner's Card shown inside the 500, 1000 and 1920 Wrappers, in Light and Dark.

## Words (2026-11-18)

Card, Body, Content, Media, Actions, Footer and Wrapper are defined in [v3-card-proposal.md](./v3-card-proposal.md). The owner dislikes "Container". His words: [owner-words-2026-11-18.md](./owner-words-2026-11-18.md).

## Open recommendations

Image paint styles, focal point, full-bleed media cards, and a proposed 8-rule AI page: [v3-recommendations.md](./v3-recommendations.md).

## The 8 rules (the AI page shows these)

1. **Read the Index page in its entirety.** The Index is the design system: all the main components in the right configuration ([v3-index.md](./v3-index.md)).
2. **Hands off the owner's work.** Propose first, build beside, archive on the Archive page. Never delete. Never change his numbers, names or tokens without asking.
3. **Tokens and styles only.** Colour from Color Mode and Colors, size from Scale, every text a text style. Photos: a Photo/ style, scale mode Fill, set by script, never Crop.
4. **One Root per page:** the size card, its Preview, then Layouts and Content. A Preview holds instances or detached copies, never masters.
5. **Content items:** zero padding, transparent, Fill width; drop them into cards. A content master lives on the page of the smallest width where it looks as intended.
6. **Modes cascade.** A size master (500, 1000, 1920) sets its own Scale mode; content masters set none and take the size they sit in.
7. **Masters only when useful:** every master shows in the swap menu. Short plain names, a 2-line description, little text on the canvas.
8. **Done =** a 1:1 screenshot checked, a second agent reviewed it, about 10 Figma calls a minute.

Layouts to port from Big Sloppy (shortlist, nothing ported yet): [v3-port-shortlist.md](./v3-port-shortlist.md).

## House habits (still hold)

- Short answers. Chat is read rarely; what matters goes in a file.
- Never delete: archive instead (move it aside, say where).
- Keep the owner's words verbatim (`owner-words-*.md`); don't paraphrase a decision into something else.
- Check a 1:1 screenshot of what you built before calling it done.
- About 10 Figma calls a minute, shared by every agent. Batch work into a few large `use_figma` calls.
- **Photos: set a `Photo/` style (or image fill) by script with scale mode Fill, and never touch crop.** In the UI, applying a photo style opens Figma's crop dialog; zooming and confirming there switches the layer to Crop, which stretches or squishes on resize.
- Never change the owner's numbers, names or token values unless he has delegated them for that job. Record the old values first when he has.

## Stale docs (describe v2)

Read these only for history; where they disagree with this page, this page wins.

- [start-here.md](./start-here.md) and the cloud doc `claude/system-picture.md` (repo: [size-system-proposal.md](./size-system-proposal.md)): v2's files, pages and size system.
- The **Rules** in [../readme.md](../readme.md#rules): written for v2 (one Root per page, the Index, 8 size pages, `<Group>/<Name>` names). The habits above are the part that carries over.
- [glossary.md](./glossary.md), [index.md](./index.md), [root-spec.md](./root-spec.md), [naming/structure-v5.md](./naming/structure-v5.md), [lint.md](./lint.md): v2's words, Index, Root, page template and lint.
- v2's Scale docs: [scale-tokens.md](./scale-tokens.md), [scale-proposal.md](./scale-proposal.md), [modes.md](./modes.md) (v2 had 8 Scale modes; v3 has 3).
