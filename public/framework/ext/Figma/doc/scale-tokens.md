# Scale tokens: what the cards on the Scale page show, and a corrected table (2026-11-16, proposal only)

File ADpu9u2V0BlEZfR3rrMfER. Nothing was edited. Read from the variables API and 1:1 screenshots of the Scale page (5:5: the Row of seven Size frames 9:3 to 9:43) and Showcase "Block · Scale" (109:21). Background: [scale-proposal.md](./scale-proposal.md), [think-layouts.md](./think-layouts.md), [owner-words-2026-11-16.md](./owner-words-2026-11-16.md).

## Conclusion

1. **The values are close; the way they are used is the problem.** Scale (13 variables x 8 modes, all raw numbers, no aliases) gives a card 4 to 5% padding when the card is as wide as its mode, which looks right (the Mega hero card, 2400 wide, 128 pad, is fine). But a grid inherits **one** mode for all its cards, so a 464-wide card in the LG row gets LG padding (13.8% of its width) and a 574-wide card in the XL row gets 80 (13.9%). Big Sloppy's cards sit at 9 to 12%, a 750 card in Mega would sit at 17%. A bigger token cannot fix that; **a card needs the mode of its own width.**
2. **Rule to use while the tokens stay one set: pick the card's mode so that pad is about 6% of the card's own width (allowed 4 to 11%).** Lookup by card width: up to 325 XS, 325 to 460 Mobile, 460 to 650 SM, 650 to 920 Default, 920 to 1350 LG or Desktop, 1350 to 1850 XL, over 1850 Mega. So the owner's 750-wide Mega cards are **Default** (6.4%), the LG row's 464 cards are **SM**, the XL row's 574 cards **SM** and 781 cards **Default**.
3. **Fix the table where it is plainly wrong** (about 35 of 104 cells, below): `section-pad` is the same as `pad` in every mode; five tokens go up and down (`gap` Mobile 24 then SM 22, `button-pad-x` Default 32 then LG 24, `text-gap` Default 12 then LG 10, `radius` Mega 6 under XL 8, `pad-y` Mobile 32 against `pad-x` 24). Keep Desktop 1920 as decided.
4. **Text does not scale at all:** 14 / 16 / 24 in every mode. So pad over body text goes from 1x (XS) to 8x (Mega), and the Mega card is a big white slab with a small paragraph (screenshot of 109:21). Optional fix: two type tokens, last section.
5. This corrects [scale-proposal.md](./scale-proposal.md) in three places: Mega `pad` stays **128**, not 160 (the owner says it works on the hero card; think-layouts called it too big, but that is the grid problem again, not the value); `gap`/`button-pad`/`radius` rise gently (72, 48, 12), not 96/56/18; `card-min` stays as it is.

## The mismatches, with numbers

| Where | Seen | Why it is off |
|---|---|---|
| Scale page, LG row | 3-up cards 464 wide, pad 64, gap 40 | 13.8% pad; SM (32 = 6.9%) fits |
| Scale page, XL row | 4-up cards 574 wide (pad 80, 13.9%), 3-up 781 (10.2%) | card of that width is SM / Default |
| Scale page, Mega row | hero card 2400 (pad 128, 5.3%, good); second section is forced to Default: 7 cards of 450, **section pad 48** | page margin 48 on a 3440 screen is 1.4% while the hero floats in 520 of side space; two rows, two margins |
| Showcase 109:21 | Desktop, XL, Mega cards are as wide as the screen (1920, 2600, 3440), pad 3.1 to 3.7%, a 450-wide text block in 3184 of white | the Scale page caps the same Mega card at 2400 by `squeeze`; the showcase does not, so the same mode reads differently on two pages |
| every mode | `section-pad-x/y` = `pad-x/y` (Mobile `x` aside) | a section has no more room than a card inside it; Big Sloppy has 120 beside 48 |
| every mode | text 14 / 16 / 24 fixed | pad over body 1.1x at XS, 8x at Mega |
| `gap` | 12, 24, 22, 32, 40, 44, 48, 64 | Mobile 24 is bigger than SM 22 and gap/pad falls from 1.0 to 0.5 |
| `button-pad-x` | 12, 14, 18, 32, 24, 24, 28, 36 | Default 32 is bigger than LG 24; LG = Desktop |
| `text-gap` | 4, 6, 6, 12, 10, 12, 12, 16 | Default 12 is bigger than LG 10; flat for three steps |
| `radius` | 3, 4, 4, 4, 6, 8, 8, 6 | Mega smaller than XL; 3 is an odd number (reference uses 4) |
| `pad-y` Mobile | 32 (x is 24) | the only mode taller than wide |

Line length is **not** a problem: `measure` is 720 in every mode and the card text is short (the XS card wraps at about 40 characters, Mega at one line of 97).

## Corrected table (current, then proposed; bold is a change)

One column per mode, in width order. Steps are smooth and rise every step except where two modes are close in width (LG 1600, Desktop 1920).

| token | 360 XS | 400 Mobile | 600 SM | 1000 Default | 1600 LG | 1920 Desktop | 2600 XL | 3440 Mega | reason |
|---|---|---|---|---|---|---|---|---|---|
| pad-x | 16 | 24 | 32 | 48 | 64 | 68 | 80 → **96** | 128 | XL is only +12 on Desktop, then +48; 96 makes every step x1.3 to 1.5 |
| pad-y | 16 | 32 → **24** | 32 | 48 | 64 | 68 | 80 → **96** | 128 | same as x; Mobile was the one taller than wide |
| gap | 12 | 24 → **16** | 22 → **20** | 32 | 40 | 44 | 48 → **56** | 64 → **72** | gap about 0.65 of pad, so a gutter is smaller than an inset, and it never dips |
| radius | 3 → **4** | 4 | 4 | 4 | 6 | 8 | 8 → **10** | 6 → **12** | rises by 2 every step above Default; 4 is the reference radius |
| section-pad-x | 16 | 16 | 32 → **40** | 48 → **80** | 64 → **112** | 68 → **120** | 80 → **160** | 128 → **240** | page margin about 6 to 8% of width and above card pad; 120 at Desktop is Big Sloppy |
| section-pad-y | 16 → **24** | 32 | 32 → **40** | 48 → **64** | 64 → **80** | 68 → **96** | 80 → **128** | 128 → **192** | 96 at Desktop is the reference's section spacing |
| button-pad-x | 12 | 14 | 18 | 32 → **24** | 24 → **28** | 24 → **32** | 28 → **40** | 36 → **48** | rises every step; text stays 16, so slower than pad |
| button-pad-y | 6 | 8 | 10 | 12 | 14 | 16 | 16 → **20** | 20 → **24** | half of x, no flat step |
| text-gap | 4 | 6 | 6 → **8** | 12 | 10 → **14** | 12 → **16** | 12 → **20** | 16 → **24** | was dipping and flat; about a quarter of pad |
| card-min | 280 | 280 | 280 | 320 | 400 | 432 | 500 | 600 | unchanged: it already rises, and the mode of the card, not card-min, fixes the grid |
| squeeze | 1600 | 1600 | 1600 | 1600 | 1600 | 1600 | 1800 | 2400 | unchanged (decided) |
| width, measure | | | | | | | | | unchanged (width = the mode's name, measure 720) |

Check at the card's own width, using the lookup above: Mobile card 358 with pad 24 is 6.7%; SM card 536 with 32 is 6.0%; Default 904 with 48 is 5.3%; LG 1472 with 64 is 4.3%; XL 1800 with 96 is 5.3%; Mega 2400 with 128 is 5.3%. Grid cards by lookup land at 6.4 to 8.4%.

## How to apply (the owner's cascade problem, short)

- **No new variable is needed to start:** set the Scale mode on each Card instance's outermost frame (the [modes rule](./modes.md)) from the lookup, and leave the grid on its layout mode. Multi-select the cards and set the mode once.
- **If that is too fiddly,** add `card-pad` and keep `pad` for sections and hero cards: card-pad about 6% of `card-min`, so a grid in any mode gets right-sized cards by itself. Cost: two more variables and rebinding every Card.
- Both are cheaper than splitting "content mode" from "layout mode", which Figma cannot do on one frame.

## Optional: two type tokens (a separate decision)

| token | XS | Mobile | SM | Default | LG | Desktop | XL | Mega |
|---|---|---|---|---|---|---|---|---|
| text-body | 14 | 15 | 16 | 16 | 18 | 20 | 24 | 28 |
| text-title | 22 | 24 | 24 | 28 | 32 | 36 | 44 | 56 |

Today the three sizes are typed (14 / 16 / 24). Pad over body text would run 1.1x to 4.6x instead of 1x to 8x. Do this only if the owner wants type to follow the mode; it is the biggest visible gain in Mega and the largest rebind.

## Before this is applied

Applying the table moves the bindings behind every Card, Section and the Page master at once (see [scale-proposal.md](./scale-proposal.md), "Before this is applied"); `radius` reaches cards through `surface-radius` in the Surface collection (Card mode follows Scale, Section mode is 0).
