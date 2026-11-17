# Vote: how Lew42 v2 should be organized for swapping (mastermind-study-space, 2026-11-16)

From what I already know (the layouts, space and index studies); no Figma calls were made. Related: [think-layouts.md](../think-layouts.md), [study-space.md](../study-space.md), [think-index.md](../think-index.md).

## Q1. Resolution-first pages, or one page per component type?

**Resolution-first, for layouts and pages. Cards and elements stay width-free on one shared page.**
- Swapping works when everything you can swap *to* has the same width. A page per width means Assets, instance swap and Scale modes only offer parts that fit. A page per component type mixes 400 and 3440 versions in one list, and swapping a Mega part into a Mobile layout breaks it.
- A Card does not change with width ([think-layouts.md](../think-layouts.md): the page carries the width, the card stays Default). So Card, Stat, Button, Icon.Item and Text live once, on one Components page. They are not copied per resolution.
- So: one page per width (Mobile 400, Default 1000, Desktop 1920, Mega 3440) holding the layouts and demo screens; one Components page holding the card-level masters.

## Q2. Folders on each resolution page, in order

1. **Preview**: the one 1920 sheet the Index instances (3-column masonry, see [study-space.md](../study-space.md)).
2. **Layouts**: the page shells (Page, Sidebar + Main), the app and content skeletons.
3. **Sections**: the rows inside a layout (four features, three cards, masonry, split, dark band).
4. **Containers**: Card, Region, Header, the boxes that hold content.
5. **Content**: Button, Icon.Item, Image, Text, the leaves.
6. **Demos**: finished screens, last, because they are made from everything above.

Yes: demo screens are built **only from that page's masters, as instances**. A demo that uses a loose frame proves nothing, and one that is all instances proves "swap and it just works". The Preview is then built from the demo's best parts, so it stays swappable too.

## Q3. One Root per page, or top-level folder frames?

If Assets really groups only by top-level frame, **use top-level folder frames**. A single Root puts every master in one group and the folders are lost, which defeats the point.
- **Both is possible:** make each folder a top-level frame (hugging its content), place them in one row left to right with a fixed gap, and put the Preview first. One screenshot of the **Preview** gives the tidy overview that a Root would; per-folder screenshots give the detail. The Index already shows the whole system, so a page does not need its own all-in-one frame.
- **Second route, unverified:** name masters `Folder / Name` (slash paths), which I believe the Assets panel also groups by, even when the frames are nested. Test on one page before relying on it; I could not check without a Figma call.
- **Avoid:** nesting a folder inside a Root and expecting Assets to show it, or a screenshot-only Root that hides what is swappable.
