# Lew42 v2 consolidation plan (2026-11-16, voice-app, for Michael's OK)

## Where things stand (inventory, read-only)

- **27 pages.** Masters are spread over 15 of them: Card is on Scale, Button on Elements, Icon.Item on Icons, layout masters on six size pages, old Layout.* sets on 2600 XL, templates on Templates, interactive sets plus Review, Specimen and Notes on Elements, test masters "Master 1-6" on Scale, and Card Set and Heading Set on Explore pages.
- Michael's reference for "strong layout" is the Big Sloppy **Page Set** pasted on Index (103:25367). It is built from four blocks: **Page** (Header + Content slot, 1920 wide, 160 margins), **Section** (Label + Content slot), **Grid of Cards** (each Card has a Content slot) and **Masonry**. Consistent margins and gaps, white cards on light gray.

## Target: 9 pages

1. **AI**: rules and Systems map (unchanged).
2. **Live**: status board (unchanged).
3. **Components**: the ONE home of every master, each group in a purple-stroked folder:
   - **Elements**: Button, Icon.Item, Image, Icon.Title.
   - **Blocks**: Card, Card with media, Stat.
   - **Layouts**: Page, Section, Grid, Masonry, Sidebar + Main.
   - **Interactive**: Sidebar, Miller, Miller Mobile.
   - **Review**: Review tag, Specimen, Notes.

   Names carry no resolution prefix.
4. **Tokens**: Scale, Scheme, Surface, squeeze/measure and the columns rule on one page, absorbing Scale, Squeeze, Columns and Card vs Section. The centrepiece is Michael's **breakout**: one master shown at every Scale mode side by side, so token tuning is visible.
5. **Text**: as is.
6. **Icons**: as is.
7. **Sizes**: one page, absorbing the 8 size pages. One row per core layout and one column per mode (360 → 3440), all instances of Components. Alternative, if Michael prefers: keep the 8 size pages, but only as instance-only specimen pages.
8. **Showcase**: demos, including Click through.
9. **Archive**: hidden frames holding everything from the Explore pages, Templates, Index and the old size-page step grids. Nothing is deleted, only moved.

## Order (one agent at a time, Michael approves each step)

1. `roots`: one root auto-layout per page, zero overlap, no connectors, masters in purple folders, resolution prefixes dropped. *(running)*
2. Rebuild the four reference blocks (Page, Section, Card grid, Masonry) locally in v2, bound to v2 tokens. Build one, get Michael's OK, then do the next.
3. Consolidate pages per the target. Move masters (instances follow them), merge doc pages, and archive the rest.
4. Build Sizes: the breakout of the core layouts at every mode, using the step-2 blocks.

## Quality, so the slop stops

- One builder at a time, one owner per page, masters only after approval.
- Lint at zero errors.
- Review screenshots of the ROOT frame, plus 1:1 crops of each section, judged by a different agent with a five-line rubric: no same-on-same fills; consistent margins; nothing floating or overlapping; text at the measure; cards hug content.
- Card colour: give Scheme a `card` role that stays white on a light gray ground, so cards stop taking their ground's colour.
