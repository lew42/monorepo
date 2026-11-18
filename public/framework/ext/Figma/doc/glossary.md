# Glossary (draft, 2026-11-17)

The words used in Lew42 v2. This file is the source; the AI page's Glossary block (`322:70`) is a copy, so change this file first, then the page. Status: draft until the owner approves [naming/proposal.md](./naming/proposal.md). **Proposed replacement for the layout words (Page, Section, Container, Columns, Column, Card, Content, each named by where it sits):** [naming/vocabulary-v6.md](./naming/vocabulary-v6.md).

**Rule: padding comes only with a background.** Surfaces (a Default) pad and have fill; bare things (Content, Columns) have neither. A master is defined once; other pages show it only in their Preview.

- **Size / tier:** a design width. The main tiers are 400 Mobile, 1000 Default, 1920 Desktop and 3440 Mega. Interim tiers (360, 600, 1600, 2600) go by their number. A size page is named after its tier.
- **Default:** `X · Default`, the starting point at a size: a white card with corners (`pad`, fill, radius, the card shadow) holding one swappable Content. Swap the Default itself for a layout (`X · 2 · Equal`). There is no separate Card master ([structure-v5](./naming/structure-v5.md), owner ~21:35).
- **Section** (owner, 2026-11-17 ~23:40): a full-width band. Fill width, Hug height, padding `section-pad-x/-y` (zero it by override for a flush one), background optional (a Scheme mode), no radius, no shadow; sections stack at zero gap. A preset master per core size, `Sections/<w> · Section` (500, 1000, 1920), so there is a starting configuration even if it is later detached. A Default made full width with radius 0 and no shadow also reads as a section (rule 15).
- **Page** (owner, 2026-11-18 ~00:20): the whole screen at a size, `Pages/<w> · Page` (500, 1000, 1920): a vertical stack of Sections with zero padding, zero gap, Fill width.
- **Section presets** (owner, ~00:20): a Section can hold columns directly (the horizontal layout is on the Section, no wrapper inside). Per size: `Sections/<w> · Section` (padded, vertical; holds Content or cards), `· Section · 2 Columns` and `· 3 Columns` (padded, horizontal, `gap`; no 3 Columns at 500), `· Section · Flush` (no padding, full bleed; only flush things such as images or zero-radius blocks).
- **Radius needs room** (owner, ~00:20): full bleed means zero radius. No rounded card touches an edge or another border; take the radius off and a card becomes a section.
- **The four words, as presets on three axes** (hug/fill × pad/no pad × background/none; any axis can be flipped by override): **Section** = fill, `section-pad`, optional background, no radius. **Wrapper** = arranges children: no padding, no background, `gap`. **Default** = the card: white, `pad`, radius. **Content** = no padding, no background, `text-gap`.
- **Max width** (owner, ~23:40): one, `max-width` = 1600 in the one-mode collection `Lew42 v2 · Constants`. Only the main content container on 1920 uses it (Fill, capped at 1600, centred); everything else fills. `measure` stays in Scale. No per-mode font sizes: Figma holds the rough structure, fine tuning happens on the web.
- **Surface / layout frame:** a surface has padding and its own fill; a layout frame has neither, only gap (rule 2).
- **Masonry:** items ordered to even out the column heights; not a column grid (rule 16).
- **Detach:** turn an instance into a plain frame, for structure no master has (rule 25).
- **Fill / Hug / Fixed:** take the parent's space, shrink to the children, or keep a set size.
- **Content:** bare (no padding, no fill). `X · Content` (placeholder, title = its own name) and `X · Content · Name`. Each size from 1600 down to 400 defines its own, inside ONE X-wide padded card with dividers. Larger pages use it only as instances. Always sits inside a surface.
- **Columns:** `X · N · Shape` (Equal, Sidebar, 1/3 + 2/3). Gap only, with no padding and no fill. Each column holds the Default of the nearest smaller size. Gap 0 gives joined cards.
- **Preview:** the page's showcase, built from instances.
- **Root:** the single auto-layout frame on each page. It holds titled Root columns.
- **Folder:** a frame inside Root that groups masters. It is named with the size: `X · Content`, `X · 2`, `X · 3`, `X · 4`.
- **Swap:** replacing a nested instance with another master. It keeps the overrides when layer names match.
- **Master:** a component. Every master has a description (rule 21).
- **Scheme / Scale:** the colour modes and the size modes. Scale is set only on the frame that sets the width.
- **Modes cascade** (owner, 2026-11-17 ~22:55): unset means inherit; set means locked for everything inside; reset on a wrapper. Masters set no Scale mode, so an instance takes the size of wherever it is dropped. A specimen stage sets its size's mode. To make a group of children differ from their parent, set the mode once on the wrapper around them (the Index's dashboards: 500 tiles inside a 1000 or 1920 area).
- **Core sizes** (owner, ~23:20): **500 SM, 1000 Default, 1920 Desktop**, each a range: SM ≈ 320–700, Default ≈ 700–1300, Desktop ≈ 1300–2400 (Mega, 2400 and up, is parked). A size's pieces should work anywhere in its range; widths add up only roughly.
- **Card layout / section layout:** a card layout is white Defaults on a gray ground with a gap. A section layout is full-width, flush Defaults: radius 0, no shadow, no gap, padding kept (the layer is renamed `Section`). Both are layouts, not components.
