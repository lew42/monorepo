# Brief: two-column layouts, mobile to mega (owner, 2026-10-13)

The owner's words (dictated): "make a page specifically for two column layouts and show me, from mobile up to mega, different variants of two column layouts and what you would put on each side, how you would frame them in terms of background colors for each, whether one side could be nested within the whole. You could have one card on one side and the other side… an image or texture or maybe an icon or anything depending on the size and how much stuff would fit."

Read first: [brief-ds.md](brief-ds.md) (tokens, Resolution modes, prime is a small splash never a ground, hug or fill), [componentize.md](componentize.md) (the `Layout / Two columns` `177:1092`, `Split`, `Media + text`, `Sidebar + content`, `Ground` `177:1312` components on `Kit · Layouts`), [use-figma.md](/framework/ext/Figma/doc/use-figma.md) (traps). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. **The owner reads the file, not chat**: a Notes box at the top of the page with what you found and which variants you'd keep.

## Page `Layouts · Two columns` (new)
1. **Widths across the top:** 390 (mobile), 768, 1200, 1920, 3440 (mega). Each variant is a row showing the same content at every width: how it stacks on mobile, where it splits, how it caps or adds air at 1920/3440 (don't stretch a text column past a readable measure).
2. **Variants (each a row, labelled; aim 10–14):** 50/50; 60/40 and 40/60; text + image; text + texture/pattern; text + big icon; card nested on a full-bleed ground (the card on one side, the other side open on the ground); both sides as cards; one side a different ground (dark/near-black vs light, light vs gray); sticky narrow side + long content; form + explainer; stat/number + text; media fills the half edge to edge (bleed) vs inset.
3. **Grounds:** use `Ground` and the Text modes; show for each framing what colour each side gets and why. Prime only as a small accent.
4. **What goes on each side** is a short label under each row ("left: heading + body + button; right: image, bleeds at ≥1200").
5. Use instances of the existing kit components (`Layout / Two columns`, `Split`, `Media + text`, `Ground`, buttons, cards); add a variant to a kit component only if it's clearly reusable, otherwise build on the page. Images: reuse ones already in the file; generate at most 4 (`mcp__figma__generate_image`, planKey `team::1558244461354989578`) via `upload_assets` + curl (see [video-kit.md](/framework/ext/Figma/doc/video-kit.md)).
6. **Verdict** in the Notes box: the 5–6 variants you'd keep as the reusable set.

Screenshot each row and fix what looks off before reporting. Link the page from `Claude · Overview`'s design-system card. Add a line on the **For you** card (`186:1062`) only if something waits on the owner. Report `kit/two-col.md`, committed by path (`git commit -- <paths>`), with page/node ids.
