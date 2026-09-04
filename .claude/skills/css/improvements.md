# css — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

- (applied 2026-08-27 by the mastermind → caveats.md "Paint order is not the cascade")

- (2026-08-29) Silent about a SIZING trap, not a cascade one: a **block** box with `aspect-ratio` AND `max-height` transfers the height cap back through the ratio to its **width**. A 16/9 canvas capped at 62vh sized itself 992px inside a 1279px row and left grey beside it — `width` computed as `992px` with `max-width: none`. Worth one line beside the `container-type: size` warning: before giving a box a ratio, ask what caps its other axis.

- 2026-08-30 (blog-arch): the skill's silent-failure list covers a class that does not exist and a token with no class, but not an INVALID DECLARATION. `grid-template-columns: [a-end] [b-start] …` — two adjacent line-name groups — is a parse error, the whole track list is dropped, and the grid still renders because named placements fall through to implicit lines. Track 1 measured 0px and nothing was logged. Worth one line under §1: after writing any multi-value track list, read `getComputedStyle(el).gridTemplateColumns` back and count the tracks.

- 2026-08-30 (critique-fixes): silent about the unit inside a CONTAINER query. `@container page (min-width: 130em)` resolves `em` against the CONTAINER's font size, not the root's — 16px at 1920 and 18px at 3440 on this site, so the two readings are not the two screens' ratio and a threshold picked by dividing viewport widths lands in the wrong place. Measured: the same box read 96.4em and 165.9em. Worth one line: a container-query breakpoint has to be MEASURED with `getComputedStyle` on the container, or written in `px`.

- 2026-08-30 (color-stacks): nothing in the skill says where `light-dark()` RESOLVES, and it is the whole reason mode-aware tokens work. It reads `color-scheme` at the element the value is USED on, not where the custom property was declared — so `--x: light-dark(a, b)` declared once on a wrapper gives two different answers inside two children with different `color-scheme`, and a box that is dark in BOTH modes fixes every token inside it with one line (`color-scheme: dark`) rather than a parallel set of tokens. Verified on one page: the same `--fill-a08` read `rgba(0,0,0,0.08)` and `rgba(255,255,255,0.08)` simultaneously. Worth one line under §1, beside the "verify a word by reading a computed style back" rule.
- 2026-09-01: spacing defaults are no longer constants — `:root` carries `--pad-default: clamp(1em, 1.3%, 2em)` and `--gap-default: clamp(1em, 0.4em + 0.5vw, 1.6em)`, and every `var(--pad, …)`/`var(--gap, …)` fallback reads them. Never write a new `var(--gap, 1em)` literal; and never a % inside a GAP token (percentage row-gap is undefined against auto height — vw there, % only in padding).
