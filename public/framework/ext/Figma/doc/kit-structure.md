# Kit structure: Section, Container, Card, Content (2026-11-16)

Built in Lew42 v2 on page **1000 Default** (`64:2898`), as four top-level frames to the right of Root, each with a 1px purple stroke. Nothing existing was touched. The question this answers: [owner-words-2026-11-16.md](./owner-words-2026-11-16.md) (resolution first, masters only, padding as a layer). Screenshots: [kit-structure/](./kit-structure/).

## The structure

Masters only: no component sets, no variants, no instance-swap properties. To swap a part you use Figma's normal swap on the nested instance, and the menu lists the other masters in the same folder.

| Folder (top-level frame) | Masters | What they are |
|---|---|---|
| **Sections** `180:644` | Section `180:617` | Padded (bound to `section-pad`), fill bound to Scheme `fill` with its own Scheme mode Light gray, no border, a small "1000" size label, holds ONE Container. |
| **Containers** `180:645` | 1 column `180:548`, 2 columns `180:560`, 3 columns `180:583` | Transparent, padding 0, gap bound to `gap`, horizontal + wrap, children Fill with min width bound to `card-min`, each holds Card instances (Scheme White). |
| **Content** `180:646` | Text `180:516`, Text + button `180:520`, Stat `180:527`, List `180:531`, Two columns of text `180:541` | What goes inside a Card. No padding, text styles only. |
| **Swap demo** `181:557` | Four Section instances | Step 1 to 4, each one change from the last, each captioned with what changed and where the new part lives. |

Folders must be top-level frames with plain names: the Assets panel and the swap menu group by page, then top-level frame or section, and ignore nested frames.

## The rules

1. **Anything with padding has its own background; anything without a background has 0 padding.** The Section is padded and filled (Light gray); the Container is transparent and flush; the Cards inside are White, so each padded layer differs from the one under it.
2. **Text always sits inside exactly one padded thing** (a Section or a Card), never bare and never in two. Never double pad.
3. **No padding property and no Pad variants.** Padding comes from composition: Section is padded, Container is flush. For a one-off, override the instance's padding to 0. Variants only for small atoms (e.g. Button states), never for containers that hold content.
4. **A Section can also be a plain frame (one-off).** Make it a component only when it's reused or swapped. Split Section > Container only when the cards should be a different size than the section's padding.

## How it maps to the web

- **Section** = a `<section>` with padding, a background and `data-scale` (the page size).
- **Container** = a columns class with `gap` and its own `data-scale` (the card size). This is [mode-split.md](./mode-split.md) option A: the padding frame takes the page size, the columns frame takes the card size.
- **Card** = the existing Card master (`16:364`), set to Auto so it follows its Container.
- **Content** = what the Card holds; swapping it is changing the markup inside the card.

## What I found

- A 3 columns Container with `card-min` 320 needs at least 1024 of content width at 1000 Default, so the Section is 1200 wide. A 1000-wide Section shows 2 + 1.
- A Container nested in a Section instance keeps its own explicit Scale mode. Setting the Section to 1600 LG grows only the padding; the cards do not change (Swap demo, Step 4).
- The Section's size label is static text, so Step 4 overrides it to "1600"; a bound label would need a text variable.
- Cards in a wrapped row do not stretch to equal height on their own (Stretch on a wrapped child has no effect). Setting vertical Fill on one card in the row makes the row equal; the 2 columns master does this on its first card.
- Lint: the last full run (before the label and card-height fixes) had 0 errors on the folders. The final re-run was blocked by the Figma MCP call limit, so re-run it before relying on it.
- The lint's `page-root` rule expects exactly one `Root` per page, so it flags these four folders. They sit on 1000 Default by the brief, not by mistake; moving them into Root would hide them from the Assets panel's folder grouping.
