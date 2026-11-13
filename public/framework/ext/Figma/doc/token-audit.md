# Token audit: Lew42 Design System variable collections (2026-11-13)

Verdicts for the owner to confirm: 18 collections, 49 variables. Nothing is deleted or renamed yet. Counts are nodes bound to a variable (nodes inside instances count, so one master edit shows up many times), summed by script over every page of the file ([the rules](./use-figma.md)). "Live" excludes the Cut list. Scale and Scheme counts come from the readme's Scale usage line: the page scans skipped them to save output.

## Proposed: ship 9 collections, merge 3, toss 6

| Collection | Variables x modes | Live uses | Verdict | One reason |
|---|---|---|---|---|
| Colors | 8 x 1 | light 231, main-component 35, error 6, prime 5, dark 5, ok 1, warn 1, ink 0; most reach screens through Scheme aliases | KEEP | The base palette; Scheme and Theme alias it |
| Scheme | 5 x 4 (White, Light gray, Prime, Dark) | text 2217, muted 1609, surface 987, accent 481, on-accent 91; 1147 explicit modes | KEEP | Every card, page and button reads it |
| Scale | 12 x 7 | radius 4484, btn-pad-y 1160, btn-pad-x 678, gap 336, pad-x 270, pad-y 212, h1-size 158, section-pad 112/120 | KEEP | The size system; the owner's own |
| Constants | 2 x 1 (round, icon-pad) | round 1724, icon-pad 7 | KEEP | Values that never change with size |
| Button | 3 x 5 | label 1985, fill 1832, stroke 1832 | KEEP | Every button and pill |
| Selection | 3 x 3 (Off, On, Hover) | fg 434, bg 157, indicator 57 | KEEP | Marks the selected item in nav, lists, icon buttons |
| Icon size | 1 x 6 | 2332; 2117 explicit modes | KEEP | The one switch for icon size (Icon master) |
| Image | 1 x 2 (Rounded, Flush) | 1044; 1491 explicit modes | KEEP | Why a photo has no corner of its own inside a card; cannot live in Scale (needs its own two modes) |
| Bar | 4 x 3 (Plain, Tonal, Floating) | pad 141, radius 208, shadow 55, fill 46 | KEEP (low priority) | Only the Bars page and its demos use it; see flags |
| Card padding | 3 x 2 (Padded, Unpadded) | x 2286, y 2298, gap 1111 | MERGE into Scale | The owner wants cards to follow Scale; Padded already aliases Scale, so Card master `8:5` binds Scale pad-x, pad-y, gap directly and Panel `153:1779` gets plain 0 |
| Theme | 2 x 4 (Prime, Blue, Gold, Teal) | ui 33, on-ui 8; 36 explicit modes | MERGE into Scheme | Scheme accent and on-accent alias it; bind them straight to Colors prime and white. Blue, Gold and Teal were a demo and go to the Cut list |
| Flow | 5 x 1 | stroke 141, arrow-length 63, arrow-gap 76, radius 14, fork-half-row 0 | MERGE into Constants | Single mode, never changes; keep flow-stroke, flow-arrow-length, flow-radius; fold arrow-gap (always 0) into a plain 0; toss fork-half-row (0 uses) |
| Label | 6 x 1 | 173 (Labels page, Live, 400 Mobile) | TOSS | Labels are static by design and never follow a mode, so the variable adds nothing; hard-code the fills (or fold into Colors as label-* if you want them tied) |
| Device | 2 x 4 | 9 (Devices page 5, Live 2, approval workflows 2) | TOSS | Plain widths 400, 1000, 1920, 3440 and heights; the four page frames already say it |
| TEST Pad (throwaway) | 1 x 3 | 52, all on Grids (4 explicit modes) | TOSS | Test leftover; the Grids demos can use Scale modes (repoint first, not 0 uses) |
| Size (demo, Pill) | 5 x 6 | 0 | TOSS | Unused demo |
| Card strategy test | 1 x 1 | 36, all on the Card strategy test page | TOSS | Test leftover |
| ZZ scratch dir | 2 x 2 | 0 live (19 on the Cut list) | TOSS | Test leftover |

## Flagged variables

- **Bar fill = Selection bg in every mode** (Plain=Off transparent, Tonal=Hover black 6%, Floating=On surface). One could be dropped from Bar.
- **Scale gap-y** aliases gap in 6 of 7 modes; only Mobile differs (24 vs 16). 11 uses. Toss candidate.
- **Scale content-max** (1680, 400, 2400, 1600...) does not match the 1600 and 2880 areas the resolution pages use; **toolbar-pad-x** has 9 uses. Do not change values without the owner's go.
- **Button label** equals Scheme text in 4 of its 5 modes (aliased, fine).
- **Scheme muted**: White and Light gray are the same value.
- **Icon size**: Body and Label are both 16, so one mode is a duplicate.
- **Colors ink** has 0 direct uses (only Scheme on-accent in Prime). **ok** and **warn** have 1 use each and no alias; keep only if the site needs them.
- **Flow arrow-gap** is 0 and **fork-half-row** has 0 uses.
- **Orphan mode**: collection id `41:159` appears as an explicit mode on 21 nodes of the file's root page but is not a local collection (deleted). Harmless; clear it when touching that page.

## What a change costs

- Deleting a variable keeps each bound node's last value, so a TOSS never moves a pixel; it removes the binding.
- MERGE into Scale or Scheme is a rebind on the master (`8:5`, `153:1779`, the Scheme aliases), not hundreds of edits; check every Card and Panel preview after.
- Order of work once confirmed: rename the kept nine with the "Lew42 · " prefix (a rename keeps every binding), then the demo pages, then the merges and tosses.
