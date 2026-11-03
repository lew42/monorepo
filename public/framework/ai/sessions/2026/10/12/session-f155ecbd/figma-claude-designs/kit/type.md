# Foundations · Type & spacing (2026-10-14)

Figma page `Foundations · Type & spacing` (`297:105636`, after Foundations · Layouts), file `QYN0G2URSBHYH5I06MOjxU`. Frame `297:105637`, 1920 wide, white (Light BG), Default. Brief: [brief-type.md](brief-type.md).

## What is on it
1. **Text styles in use** (`297:105645`): h1 Title, h2 Section, h3 Subhead, body Text, h4 Label, each as a real sentence (body at a 640 measure) with its spec and a file-wide node count (computed by script over all 54 pages): body 13,777, h4 9,610, h3 2,231, h2 912, h1 398, code 0.
2. **Pairings** (4 components, `Type / …`, text properties, light master + dark instance): Heading + body, Kicker + heading (prime pill), Label + value, Specimen + caption.
3. **Article** (`297:106723`, component `Article · 720 measure`): kicker, h1, intro, h2, two paragraphs, list, quote, code line; 720 text measure on white.
4. **Responsive** (`297:106926`, `297:106942`): the article as instances at 400 (Resolution Mobile) and 1000 (Default).
5. **Spacing ladder** (`297:106741`): 10 Resolution tokens x Mobile / Default / Mega, 30 instances of 10 `Ladder / <token>` masters; bars bound to the variables (width, radius). The figures are stamped from the variable values by the script (Figma cannot bind a number to text).

## Notes (also on the page)
- No token values changed, nothing deleted.
- 22,680 of 50,565 text nodes (45%) have no text style: many are Material Symbols glyphs, scaled previews, and ~330 hand-made h4 lookalikes (Montserrat Bold 14).
- `code` (Consolas) is used 0 times and can't load in Figma: owner's call to swap to an available mono. The first 18 pages hold imported copies of h2/h3/h4/body/code (272 nodes). Video / … (20 styles) are used only on the Video pages.
- Proposals: `h2-size`, `h3-size` (at Mobile a 36 px h2 is close to the 32 px h1); a caption/small style; a quote style.
- Doc drift: [use-figma.md](/framework/ext/Figma/doc/use-figma.md) lists Resolution values that differ from the file (file: pad-x 48/16/56, pad-y 48/24/64, section-pad-x 120/16/80).
- The code line in the article uses Cousine Bold 14 by hand (the code style can't load).
- Caption, quote and lead paragraph borrow body-muted / h3 for lack of styles.
