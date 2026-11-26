# Figma Lew42 v3 vs the web: measured tokens (2026-11-25, read only)

Web read with headless Playwright on `/framework/ui/controls/` at 400 / 1000 / 1920, resolved with `getComputedStyle`; colours and type read inside the page content, where the lew42 theme applies (bare body values in measure.json `tokens`). Figma Scale modes are 500 / 1000 / 1920. Raw numbers: [measure.json](./measure.json).

**Body font-size at 1920:** measured 16px; `framework.css` line 411 clamp(0.875rem, max(0.82rem + 0.15vw, 0.58rem + 0.35vw), 1.125rem) gives max(16, 16) = 16px. They agree. Figma `size/1` at 1920 is 20, so Figma desktop text is 25% larger than the web's.

| Figma name | Figma values | Web name | Web (400 / 1000 / 1920 or L / D) | Match? | Mismatch |
|---|---|---|---|---|---|
| Colors/prime | #ff7950 | --prime | L rgb(255, 143, 96) · D rgb(255, 143, 96) | no | web (lew42 theme) #FF8F60 in both modes; bare body #FF6157; Figma #ff7950 matches neither |
| Colors/light | #f5f5f5 | --light | L color(srgb 0.94 0.94 0.94) · D color(srgb 0.14 0.14 0.15) | no | web L ~#f0f0f1 (8% dark over white), D ~#252427; Figma #f5f5f5 has no dark |
| Colors/dark | #433e37 | --dark | L rgb(63, 63, 63) · D rgb(74, 74, 74) | no | theme L #3f3f3f, D #4a4a4a; bare body #42404B; Figma #433e37 |
| Colors/error | #cc0000 | --error | L rgb(204, 0, 0) · D rgb(255, 123, 114) | yes | light same; web dark #ff7b72, Figma has one mode |
| Colors/ok | #15803d | --ok | L rgb(21, 128, 61) · D rgb(74, 222, 128) | yes | light same; web dark #4ade80 |
| Colors/warn | #a16207 | --warn | L rgb(161, 98, 7) · D rgb(251, 191, 36) | yes | light same; web dark #fbbf24 |
| Colors/master | #8b5cf6 | - | - | web lacks | no web token |
| Colors/tint | black a0.05 | --wash | L rgb(242, 242, 242) · D rgb(23, 23, 23) | no | web wash is solid #f2f2f2 / #171717 (themed); Figma black .05 |
| Color Mode/text | L black a.8 · D #fff | --ink | L rgb(63, 63, 63) · D rgb(230, 230, 230) | no | themed web #3f3f3f / #e6e6e6; Figma black .8 reads ~#333 |
| Color Mode/muted | L black a.55 · D white a.7 | --subtle | L rgb(106, 106, 106) · D rgb(168, 168, 168) | partly | web themed #6a6a6a / #a8a8a8 (solid); Figma .55 / .7 alpha |
| Color Mode/fill | L #fff · D #433e37 | --surface | L rgb(255, 255, 255) · D rgb(38, 38, 38) | partly | light same; web dark #262626, Figma #433e37 |
| Color Mode/lighten | L #fff · D #fff a.5 | --lighten-1..3 | (paper-a08/a16/a32, not measured) | no | different scale |
| Color Mode/darken | L black a.05 · D black a.2 | --darken-1..3 | (shade-a08/a16/a32, not measured) | no | different scale |
| - | - | --line | L rgb(230, 230, 230) · D rgb(51, 51, 51) | web only | no Figma token |
| Scale/width | 500 / 1000 / 1920 | viewport | 400 / 1000 / 1920 | note | web 400 is the narrow test, not 500 |
| Scale/size/1 = body | 14 / 16 / 20 | body font-size | 14px / 14.62px / 16px | no | web 14 / 14.62 / 16; Figma 20 at 1920 |
| Scale/pad | 42 / 64 / 80 | --pad | 14px / 14.60px / 32.31px | no | web is a clamp, ~half of Figma |
| Scale/gap | 28 / 32 / 60 | --gap | 14px / 14.60px / 24px | no |  |
| Scale/text-gap | 14 / 16 / 30 | --flow | 28px / 29.23px / 39.67px | no | closest analogue, not the same meaning |
| - | - | --radius | 7px / 7.29px / 8px | web only | 0.5em; no Figma radius variable |
| h1 Montserrat Black | 48 / 48 / 60 (size/3), ls 0 | h1 | 42px w900 ls -0.84px / 43.86px w900 ls -0.87px / 48px w900 ls -0.96px | no |  |
| h2 Montserrat Bold | 32 / 32 / 40 (size/2), ls 0 | h2 | 31.5px w700 ls -0.31px / 32.89px w700 ls -0.32px / 36px w700 ls -0.36px | no |  |
| h3 Montserrat SemiBold | 24 / 24 / 30 (size/1-5), ls 0 | h3 | 21px w600 ls normal / 21.93px w600 ls normal / 24px w600 ls normal | no |  |
| h4 Montserrat Bold UPPER | 14 fixed, unbound, ls 7% | h4 | 12.25px w700 ls 1.10px / 12.79px w700 ls 1.15px / 14px w700 ls 1.26px | no |  |
| small Montserrat SemiBold | 12 (size/0-75) / 11 / 15 | small | 11.66px w500 ls normal / 12.18px w500 ls normal / 13.33px w500 ls normal | no |  |
| label Montserrat Bold | 16 (size/1) / 14 / 20 | label | 14px w500 ls normal / 14.62px w500 ls normal / 16px w500 ls normal | no |  |
| code JetBrains Mono | 14 fixed | code | 12.25px w700 ls normal / 12.79px w700 ls normal / 14px w700 ls normal | no |  |
| body Montserrat Medium | 16 (size/1), lh 180% | body font-family | system-ui, -apple-system, sans w400 | no | web body is system-ui, w400 |
| - | - | input (height/pad/radius/fs) | 33.59h 2.8px 11.2px r3.5px 14px / 35.07h 2.92px 11.69px r3.65px 14.62px / 38.39h 3.2px 12.8px r4px 16px | web only | no Figma control |
| - | - | button.prim (h/pad/radius/fs) | 33.59h 2.8px 11.2px r3.5px 14px / 35.07h 2.92px 11.69px r3.65px 14.62px / 38.39h 3.2px 12.8px r4px 16px | web only | bg rgb(255, 143, 96) ink rgb(26, 26, 26) |

Notes: web `button.prim` and `input` share one grammar (height 33.6 / 35.1 / 38.4). Web h1/h2/h3/h4/small/label/code follow the body size as em multiples (3 / 2.25 / 1.5 / 0.875 / 0.83 / 1 / 0.875 of 16 at 1920), so web 400 is the 14px floor, not Figma 500 Mobile (14 also). Web `small` and `label` are Montserrat 500; `code` is Consolas 700 here, not JetBrains Mono. Figma `h4` is unbound 14px, not bound to `size/0-75` as the Scale doc says.
