# The error colour: too close to prime, and unreadable on dark (owner, 2026-10-13)

The owner checked Figma's `error` (`#CC0000`) on the Dark ground and found it almost invisible (about 1.1:1) and jarring. It is also close to prime (`#FF6157`), so a delete button and a primary button could be confused.

## What the numbers say (the contrast script, run 2026-10-13; re-run it, don't trust these later)
- **No single red works on both white and our Dark (`#675F56`).** Dark is a mid-tone, so a red dark enough to read on white is too dark for Dark, and a red light enough for Dark is too light for white. That is arithmetic, not a matter of choosing well. The same mid-tone is why black text on Dark is weak.
- Deep reds (`#B3261E`-like) read well on white and gray and stand apart from coral prime by lightness. Light pinks (`#FFB4AB`-like) read on near-black, and only as large text on Dark.

## Recommendation (not applied: the tokens are the owner's call)
1. **Make `error` mode-based**, like `accent`: one value per Text mode (a deep red on Light/Gray, a light red on Dark/Near-black, dark ink on Prime). Then every ground gets a readable error with no per-use choice.
2. **Darken Dark** (the owner's own idea; site `#42404B` vs Figma `#675F56` is already an open question). It fixes black-on-Dark and error-on-Dark together.
3. **Keep error unmistakable from prime by shape as well as hue:** an error always carries an icon and words; a destructive action is an outline or ghost button in error ink, never a filled red that looks like the primary. Prime stays the only filled coral.

Alternative considered: a non-red error (magenta or purple). It avoids the clash with prime, but red is what people expect an error to look like, so it is kept as a fallback only.
