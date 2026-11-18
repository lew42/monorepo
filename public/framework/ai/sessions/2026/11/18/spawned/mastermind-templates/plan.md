# Plan: Lab · Templates (page, section and card templates), 2026-11-18

Words from [vocabulary-v6](/framework/ext/Figma/doc/naming/vocabulary-v6.md): a **Page** or a **Card** is a frame holding a stack of full-width, zero-gap **Sections** (Header, Body, Footer, Hero, Media); text sits in a bare **Content**; 1920 sections hold a **Container** capped at `max-width` (1600).

## Where

New page `Lab · Templates`, placed right before `Archive ↓` (the two Lab pages sit after the divider today; a live pilot belongs before it). Nothing else in the file is touched. Root setup B (as on Explorations): no fill, padding 0, gap `gap`, horizontal wrap, fixed width, Scale 1920 Desktop. Three tinted groups, `500 · Small`, `1000 · Default`, `1920 · Desktop`, each setting its own Scale mode once.

## Per size (X = 500, 1000, 1920)

| Group (canvas title = folder) | Masters |
|---|---|
| Sections | `Sections/X · Header` (transparent; logo, nav, Button), `· Body` (transparent; Content · Text), `· Hero` (Dark), `· Body · 2` / `· Body · 3` (Light gray; Cards in wrapping columns), `· Media` (flush image, radius 0), `· Footer` (Dark) |
| Cards | `Cards/X · Card` (Body), `· Card · Header + Footer`, `· Card · Media` (Media + Body). Card frame: White, `radius`, Card shadow, clip, padding 0, gap 0. Its sections bind `pad` (vocabulary caveat 1) |
| Pages | `Pages/X · Short` (Header, Hero, Body, Footer), `Pages/X · Long` (8 sections). Square frame, White, padding 0, gap 0, Hug height |
| Card ↔ Section | the same Card in a padded stage (room) and flush (radius 0, no shadow, Fill, parent padding 0), one-line note |

Content comes from the existing `Content/500 …`, `Content/1000 …` and `Content/1600 …` masters (one of everything). 1920 uses the 1600 Content inside a Container.

## Decisions (alternatives)

- **Header and Body are transparent** (the frame carries the background); a White Header on a White Page would be same-on-same. Alternative: White Header; lint error.
- **Pages are masters** so they drag from Assets; to change which sections a page has, detach it once (its sections stay instances). Alternative: plain frames to duplicate; no Assets entry.
- **Media image heights** are fixed per size (280 / 400 / 560): an image height is not a spacing token. Alternative: let a text half set the height (a split band); more nesting.
- **Body · 2 at 500** keeps min width `card-min`, so its two cards stack at 500 (shows the wrap). Vocabulary skips it at 500; the brief asks for it.

## Done

Lint 0 on the page, a rule-18 screenshot checked, a fresh reviewer, a step count for one new page built from the templates, a message to voice-app.
