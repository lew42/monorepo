# Explore · Index: what the new Index builds, and in how many steps (2026-11-18)

The [Explore · Index page](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=414-451) of Lew42 v2 sits right after the Index. Every screen on it was built only from what the new Index (page `368:2`) shows, plus the Pages, Sections and Cards masters on [Lab · Templates](./templates-2026-11-18.md). The allowed steps: drag an instance, swap, override (text, radius, shadow, Scheme) or detach. Each counts as one step; so does a rename, a delete or a size fix. Your question behind it: [owner-words-2026-11-17-naming.md](./owner-words-2026-11-17-naming.md), "Text (~02:15)": "Hopefully we've done some explorations about what we can build with them". The old [Explorations page](./explorations-2026-11-17.md) was built from the old Index.

**Stopped (2026-11-18):** you are starting over in a simpler v3 file, so this v2 exploration ends here. The page stays in v2 as built; nothing was deleted. The frictions worth carrying into v3 are in [Top 5 gaps and frictions](#top-5-gaps-and-frictions) below. In short: a Page loses its text when swapped to another size, there is no 1000 app (sidebar + main) layout, there are no form controls, lists or icons, card titles are too big, and there is only one photo.

**The answer in one line:** a mobile screen takes 39 steps, an app page with a sidebar 48 and a 1920 landing page 36. Most of them are typing text. The landing needed only 5 shape steps, because `Pages/1920 · Long` already holds every section a landing page needs. The app page was the hard one.

## The three outcomes

The product on every screen is the same: **Gull Watch**, a sighting log for a birdwatching club. The text is real (no lorem), and the photo is the Index's seagull.

| Size | Screen | Node | Steps | Shape | Text | Built from |
|---|---|---|---|---|---|---|
| 500 | Today (app bar, a feed of cards, a CTA) | `415:55` | **39** | 11 | 28 | `Pages/500 · Short`, Header swapped to `App/500 · App bar`, two `Sections/500 · Body · 2` dragged in, cards swapped to `Card · Media` and `Card · Header + Footer`, Body swapped to Stat |
| 1000 | Club dashboard (250 sidebar + main) | `416:172` | **48** | 17 (4 fixes) | 31 | `Pages/1000 · Short`, Hero swapped to `1000 · 2 · Sidebar` (detached), sidebar swapped to `App/500 · Navigation`, main swapped to `400 · Stack` (detached, padded), three Contents swapped |
| 1920 | Landing (header, hero, 3-up, Text + Media, stats, CTA, footer) | `420:332` | **36** | 5 | 31 | `Pages/1920 · Long`, not detached: three Contents swapped (Text + Media, Stat, Text + Button). Every section is capped at 1600 |

For comparison: the old Explorations landing took 34 steps (12 shape), and the Lab · Templates About page took 22 (5 shape).

## Everything else on the page (duplicates and swaps)

| Screen | Node | Steps (shape / text) | How |
|---|---|---|---|
| 500 Sighting | `421:679` | 22 (4 / 18) | Today duplicated; Hero → Media, Body · 2 → Body |
| 500 Menu | `421:803` | 18 (7 / 11) | `Pages/500 · Short`; Header → App bar, Hero → Navigation |
| 500 Log a sighting | `422:834` | 8 (3 / 5) | Menu duplicated; Navigation → Hero section |
| 500 Me | `421:853` | 28 (4 / 24) | Today duplicated; Hero → `App/500 · Profile` |
| 500 Landing at 500 | `420:650` | 25 (3 / 22) | the 1000 landing duplicated, Page swapped to `Pages/500 · Long` |
| 1000 Settings | `417:616` | 17 (8 / 9) | the dashboard duplicated; the main column's three cards swapped to Text + Button |
| 1000 Landing at 1000 | `420:481` | 35 (4 / 31) | the 1920 landing duplicated, Page swapped to `Pages/1000 · Long` |
| 1000 Announcement band | `422:879` | 6 (3 / 3) | `Sections/1000 · Section`, Content → Text + Button, Scheme Dark |

A duplicate is the cheap path: Me took 4 shape steps and Log 3. A new kind of screen costs 7 to 17.

## Top 5 gaps and frictions

1. **A Page does not swap across sizes.** Swapping the finished 1920 landing to `Pages/1000 · Long` kept 3 of 33 texts, and the page stayed 1920 wide. At 500 it kept 3 of 26. So each size retypes its text (31 and 22 steps). Why: the Pages nest sections whose layer names carry the size (`Sections/1920 · Header`), and the 1920 sections put their Content inside a `Container` frame that the 1000 and 500 ones don't have, so the override paths don't match. Fix to test: name every section layer in a Page by its role (Header, Hero, Features, Story, Media, Numbers, Closing, Footer), and give every size the same inner path.
2. **No app layout at 1000.** `1000 · 2 · Sidebar` is 250 + 32 + 718, not 250 + 750, and it has no padding, so its cards touch the page edge and the main column needs a detach to get padding. The only nav is `App/500 · Navigation`. Put inside the sidebar Default it padded twice, and the text broke one letter per line. Swapping the whole column to Navigation worked, but it took three fixes: set the width back to 250, set Scale to 500 SM, and give the app area a Light gray ground. A `1000 · App` master (a flush 250 sidebar beside a padded main) would remove 6 of the 17 shape steps.
3. **No form controls, lists, tab bar or icons.** Settings is three rows of Text + Button, Log a sighting has no fields, the Footer stands in for a tab bar, the App bar can't show a back or close icon, the dashboard has no table or list row, and Navigation can't mark the current link (Overview is always highlighted).
4. **Type doesn't fit the card.** Every card title is h2 (36). It wraps to four lines in the 280-wide cards of the 1000 Body · 3, and to two lines in 500 cards. In the 500 three-up Stat, "18,400" breaks in two. A Card title style (h3) and a Stat that holds six characters would fix both.
5. **One photo.** Every image on the Index is the same seagull, so the card captioned "Black-headed gull" shows a herring gull. Three or four photos to swap between would make the screens believable.

Also hit, smaller:
- A white App bar on a white page fails lint (same-on-same), so each app screen needs one Scheme override.
- Swapping a Card back to a Default kept the Card's small body text style, and Reset didn't clear it; it was fixed by hand.
- At 500 the landing lost its third feature (no `500 · Body · 3`) and its closing button (no 500 Text + Button).
- Detaching a nested instance also detaches its parent instance. Detach the outer one first.

## The page

`Root` `414:452` is a clone of the Index Root (Colors `tint`, Scale 1920 Desktop, padding and gap `section-pad`, horizontal), 7116 × 3656, **1.95 : 1**. It holds three equal 2276 groups; each title equals its frame name, and each group's columns set their own Scale mode:

| Group | Node | Columns |
|---|---|---|
| `500 · Mobile app` | `414:453` | 4 × 500: Today · Sighting, Menu, Log · Landing at 500 · Me |
| `1000 · App page` | `414:534` | 2 × 1000: Dashboard, Settings · Landing at 1000, Announcement band |
| `1920 · Landing page` | `414:574` | 1 × 1920: Landing |

Each screen sits in an `Item · …` frame under a `Caption` (an h3 label with the step count, then the one-line note in body text). One change from the Index: the group panels use Colors `tint` instead of Scheme Light gray. On a Light gray panel, the light gray app screens had no visible edge.

## Checks

- **Lint** (`doc/lint.js` on the page): **0 errors**, 7 warnings. Five are `padded-no-fill` on the transparent Body and Header sections (the same as on Lab · Templates). Two are `mode-mismatch` on the 250 sidebars set to 500 SM, which is on purpose: the cascade rule, as in the Index's dashboards.
- **Screenshots** (rule 18): the Today feed at 1:1, the 1920 Media band at 0.5, every screen at 0.3–0.5, and the whole Root. No cropped heads, no stretched photos, nothing outside Root.
- **Left as is:** the bottoms of the 500 columns are ragged. Today and Me end about 500 short of the tallest column (1000 Settings), because a 500 screen comes in fixed sizes. Filling the gap would take one more screen per column.
- **Review** (a fresh Sonnet reviewer, 2026-11-18): **OK, no defects.** It read Root's structure (three 2276 groups, titles equal to frame names, 1.95 : 1), took five screenshots, and checked two step counts against their captions (48 and 25). The record is in the task log, [mastermind-explore-index](/framework/ai/sessions/2026/11/18/spawned/mastermind-explore-index/).

Nothing outside the new page was edited: no Index, size page or Lab · Templates node, and no token.
