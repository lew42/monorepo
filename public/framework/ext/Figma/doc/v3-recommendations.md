# Lew42 v3: images, focal point, media cards, AI page (recommendations, 2026-11-18 ~18:50)

These answer the owner's four questions. Nothing has been built or changed for them. His words: [owner-words-2026-11-18.md](./owner-words-2026-11-18.md).

## 1. Image paint styles: yes, they should replace the photo variants

- **The idea:** make `Photo/Mountains`, `Photo/Forest`, … paint styles, each an image fill with scale mode Fill. Any frame (a card, a section, a hero background) picks one as its fill, and text or buttons sit on top. There are no variants and no extra layer, and changing a style's image updates every use.
- **Against the current Image Set:** each photo there is a variant that hides the icon and overrides the fill. That costs an extra nested layer, and nothing can sit on top without detaching.
- **Keep one component:** `Image`, the placeholder (a fill plus an icon). An icon can't live inside a paint style.
- **Then:** archive Image Set once the styles exist.
- **On the web:** a style maps to a `background-image` (or an `<img>`) per photo.
- **Caveat:** cropping one use by hand turns that paint into Crop mode and breaks its link to the style.

## 2. Focal point: don't build one

- Fill mode always centres the image. In Figma, a focal point would need either Crop mode, which distorts as soon as the frame resizes, or an oversized image layer positioned inside a clipped frame, which adds a layer and fights Fill widths.
- On the web it's one line: `object-position` / `background-position: 30% 20%`.
- **Recommendation:** keep Fill and centred. When a subject matters, bake a re-cropped image as its own style (for example `Photo/Gull · Top`), and set `object-position` in code when it's built.

## 3. Cards with images: full bleed, agreed

- **Media top:** a frame with gap 0, holding an image frame (a `Photo/*` fill, Fill width, a fixed height or ratio) above his Default Card. The card keeps its own padding, so only the text is padded. No new master is needed.
- **Background card:** the card's own fill is a `Photo/*` style, with a `darken` layer or scrim behind the text.

## 4. AI page for v3: yes, one short page of 8 rules

It would be the first page, mirroring [start-here-v3.md](./start-here-v3.md) (edit the doc first, then the page). These are what still holds from v2's 32 rules:

1. **Hands off his nodes.** Propose first, build beside, archive (never delete). *(v2 rules 1, 14, 29)*
2. **Never change his numbers, names or tokens** without asking. *(31)*
3. **Tokens and styles only:** colour from Color Mode and Colors, size from Scale, and every text uses a style. *(4, 9)*
4. **Modes cascade.** Masters set no mode; set Scale or Color Mode on the frame that decides. *(32, 19)*
5. **Auto layout all the way down.** Nothing loose on a page; pages read at about 2:1. *(7, 12)*
6. **Show, don't tell.** Masters are marked and plainly named, each with a short description; very little prose. *(21, 26, plus his Images feedback)*
7. **Photos use Fill, never Crop,** and run full bleed on cards. *(28)*
8. **Done means** you checked a 1:1 screenshot, a different reviewer looked, and you stayed around 10 Figma calls a minute. *(10, 11, 18)*

Dropped, as v2 structure that no longer applies: the Index, the 8 size pages, `<Group>/<Name>` naming, swap folders, slots, the Root v2 spec, specimen benches, and the padding⇒background rules.
