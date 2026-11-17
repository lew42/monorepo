# Simplify the Figma work: a proposal (2026-11-16, waiting on the owner)

All Figma edits are stopped until the owner approves this. It merges the diagnoses of the six agents that worked in Lew42 v2 today (figma, layouts, masters, bench, tour, lint, plus live, which wrote this).

## Why the output is complex and broken

1. **Too many agents in one file at once, and nobody owned a page.** About ten agents worked in parallel. Each added its own masters, wrappers, modes and labels, and nothing was removed, so pages filled up with half-finished experiments.
2. **Live master edits spread everywhere instantly.** The 1920 "morph" happened while the owner watched, and it had four sources:
   - bench pulled the owner's hand-made nodes into an auto-layout row;
   - masters changed the Scale modes on 360 / Navigation, 360 / Profile and the App bar (16 instances on 1920);
   - layouts made the Specimen and Notes slots stretch their items;
   - tour changed Card's swap options.
3. **Builders drew layouts by hand instead of using shared parts.** Each builder was told to "make layouts", so each made its own version: floating frames, 5000 px connectors, fixed widths and heights, and new Cards and Buttons.
4. **Reviews graded their own work by eye, zoomed out.** A frame 3000 to 18000 px wide was shot at 1600 to 2400 px and checked against "it renders and nothing overflows". At that scale missing padding and floating frames can't be seen. Nobody checked the colour cascade from the root down. Card's fill follows the ground's Scheme, so a card on white turns white on white. Nobody compared a frame's fill to its parent's, or looked at the pages around a changed master.

**Measured by lint (read-only, 2026-11-16):**
- **2600 XL:** 132 errors. 90 are a frame with the same fill as its parent, mostly white cards on white regions. There is also an 18840 × 14844 wrapper and 4 loose connectors up to 13476 px long.
- **1920 Desktop:** 48 errors (raw fills, raw padding, same-on-same) on a root 24986 px wide.

## The minimal system: five rules

1. **The masters are the approved design system.** A design becomes a master only after the owner approves it. Until then it is a plain frame on a Draft page.
2. **Keep masters few.** Colour comes from the Scheme modes and size from the Scale modes, so there is never a "dark card" or a "mobile card" master. A second master is made only when the structure differs. The core is about six: Button, Icon button, Icon.Item, Card, Image, Page. A card sets its own white, so it never takes on the colour of its ground.
3. **One page is one root vertical auto-layout frame.** Nothing floats outside it, there are no connectors (they are only for one-off diagrams), and there are no fixed heights. The container sets the width and the Scale mode, and the content inside it is Fill.
4. **Seven building blocks, and only these:**
   - **Page:** the vertical root stack.
   - **Region:** sets the width and the Scale mode; its fill is 5% black, so regions stack.
   - **Section:** a padded band whose fill differs from its parent's.
   - **Sidebar + Main:** a rail that hugs its width and fills the height, beside a main area that fills both.
   - **Columns:** a row of Fill columns.
   - **Card grid:** cards that wrap, each at least `card-min` wide.
   - **Card:** white and padded, on light gray.

   Text uses the text styles and is never wider than 720 px.
5. **One agent per page and one agent for masters.** Masters change only with the owner's OK. Nobody moves, re-parents or reflows the owner's hand-made nodes.

## How a review works

- **A script fails the build** before anyone says "done": a padded frame with the same fill as its parent, padding that is unbound or zero, fixed heights, text wider than 720, nodes outside the root, connectors, or the owner's nodes changed. Lint ([lint.md](./lint.md)) already catches the same-on-same and padding problems. It still needs one new rule: a page has one root, no connectors and nothing else at the top level.
- **Screenshots are 1:1 crops, section by section,** plus every page that uses a changed master. They are judged by an agent that didn't build the thing.

## If approved: next steps (nothing is touched before)

1. **One agent cleans one page at a time.** It starts with 1920 and 2600 XL, and moves anything outside the root, or not approved, to a Draft page. Nothing is deleted.
2. **The core masters are frozen at their current state.** The unapproved ones (Specimen, Notes, Note, Icon.Title, Card · Slot) move to Draft until the owner approves them.
3. **One token decision is needed** so cards stay white on any ground. Either Card's fill binds to a new Scheme `card` role that is white in every mode, or every Card instance sets Scheme White. The first is one change and the second is a habit, so the recommendation is the `card` role.

**Alternative:** keep parallel agents but lock each one to a page. That still lets master edits collide across pages, which caused most of today's "morph".
