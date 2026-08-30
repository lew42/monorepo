# css — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

- (applied 2026-08-27 by the mastermind → caveats.md "Paint order is not the cascade")

- (2026-08-29) Silent about a SIZING trap, not a cascade one: a **block** box with `aspect-ratio` AND `max-height` transfers the height cap back through the ratio to its **width**. A 16/9 canvas capped at 62vh sized itself 992px inside a 1279px row and left grey beside it — `width` computed as `992px` with `max-width: none`. Worth one line beside the `container-type: size` warning: before giving a box a ratio, ask what caps its other axis.
