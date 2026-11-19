# Lew42 v3: Images (proposal, 2026-11-18)

**Where it is:** the [Images page](https://www.figma.com/design/JYGQX0WaBO4HcGMZTkL2rx/Lew42-v3?node-id=23-3) (`23:2`, right after Split squeeze). The owner's words: [owner-words-2026-11-18.md](./owner-words-2026-11-18.md) (~17:50).

## Photo styles (decided by the owner, ~19:00)

- **Paint styles** `Photo/Mountains` (his), `Photo/Fjord`, `Photo/Snow`, `Photo/Forest`: each is one image fill, scale mode Fill, grayscale. Any frame can use one as its fill. To swap the photo, pick another style.
- **Master templates** (column `Column - Photo styles`, `30:32`, at the right of the Images root, inside a purple-dashed MASTERS frame). They are benchmarks for fast prototyping, not mainly for inheritance:
  - `Photo Card` (`30:36`): a title over a photo.
  - `Hero` (`30:40`): title, line and his Button.
  - `Avatar` (`30:51`): round, radius half the size.
  - Photo Card and Hero set Color Mode Dark (white text) and hold a `Scrim` layer (`darken`, absolute, stretched). Overlays can be edited freely.
- **Three ways to show a photo**, compared on the page:
  - (a) Image Set variant: a nested photo layer. Web: background-image, cover.
  - (b) Frame + Photo style: overlays sit right inside. Web: background-image, cover.
  - (c) A rectangle in a clipped frame with constraints: a focal point, at the cost of one extra layer. Web: an `<img>` with object-fit cover and object-position.
- **Crop warning:** set the style by script with Fill. In the UI, confirming the crop dialog switches the fill to Crop, which stretches on resize.
- **Seen:** on the bright Snow photo, the title over the 20% `darken` scrim reads weakly. Use a darker photo, or a stronger scrim (which would need a new token).

## What is there (first pass)

- **`Image`** (`24:25`), the placeholder master. Its fill is `darken` plus 20% black, with the image icon at 50% opacity. Both were copied from the owner's own edits to `.Proposal/Media`, which was left as he set it.
- **`Image Set`** (`24:49`) has one property, `Image`, with five values: Placeholder, Mountains, Fjord, Snow, Forest. Every variant holds an instance of `Image`, so an edit to `Image` reaches every variant. Each photo variant overrides the instance's fill with a photo (scale mode Fill) and hides the icon.
- **In use:** a placeholder, a cover at Fill width, three avatars (radius overridden to half the size), a framed image inside a padded card, and a row of fillers. All of them are instances.
- **Masters are marked:** they sit in a frame named `MASTERS`, with a purple dashed outline bound to Colors `master` and purple MASTER labels. The Proposal page's master holders got the same marker.

## Photos

The four photos are grayscale, from Unsplash under the Unsplash License, downloaded through Lorem Picsum with `?grayscale` at 1600×1000:

| Variant | Photographer | Source |
|---|---|---|
| Mountains | Andrew Ridley | unsplash.com/photos/Kt5hRENuotI (Picsum id 1018) |
| Fjord | Alexey Topolyanskiy | unsplash.com/photos/-oWyJoSqBRM (1015) |
| Snow | Wolfgang Lutz | unsplash.com/photos/yOujaSETXlo (1036) |
| Forest | Christian Joudrey | unsplash.com/photos/mWRR1xj95hg (1043) |

How they got into the file: `upload_assets` set each photo as the fill on four source frames (the Photo sources row on the page). The variants reuse those image hashes.

## How other kits do it (from memory, not re-checked)

Simple Design System, Untitled UI, Material 3 and the shadcn kits all treat a photo as a **fill swap** on an image layer. They use variants only for shape and size (avatar sizes, photo / initials / icon), never one variant per photo.

**Recommendation:**
- Keep `Image Set` small: a placeholder plus a few fillers, for quick stand-ins while designing.
- A real photo is a fill swap on the nested Image layer, with scale mode Fill. It doesn't need a new variant.
- Avatar, cover, framed and filler are all overrides of the same instance. None needs its own master yet.
