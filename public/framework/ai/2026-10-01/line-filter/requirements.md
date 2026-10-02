# Line art: an image filter that scores how "line-like" every pixel is: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md), and the idea is in the blog post [/blog/ai/lines-to-3d/](/blog/ai/lines-to-3d/). Build a working filter page; no 3D yet.

## What it does
Input: any image (drop a file, or pick a sample). Output: a mostly WHITE grayscale image where each pixel is DARKER the more confident it is part of a LINE. That's line art.

## The score (the owner's three ingredients)
1. **Change, in every channel:** for each pixel, the derivative to its neighbours in hue (circular), saturation and brightness. Combine them, so a whisper-faint wall seam still registers.
2. **Direction:** use the gradient's ORIENTATION, not just its size. The standard tool is the **structure tensor**: average the gradient outer products over a small window. Its eigenvalues give a **coherence** of (λ1−λ2)/(λ1+λ2): near 1 where neighbours agree on one direction (a line or edge), near 0 for noise or texture.
3. **Consistency along the line (length and signal strength):** reward a response that keeps going in its own direction. Integrate the coherent response along the edge direction for some distance, which also suppresses short flickers. Normalise by the local noise level, so a faint but STEADY seam beats a loud random speckle.

Line confidence = coherence × consistency-along-the-line × (gradient size relative to local noise). Map it to darkness, with a gamma slider.

## The page: /imagine/lines/
- The original and the line art side by side (stacked on mobile).
- A few sliders: window size, line length, noise floor, gamma. Live updates on a canvas.
- 3 or 4 samples: a synthetic box or room drawn on a canvas (known answer: 8 corners, 12 edges), plus 1 or 2 real photos (find any photo already in the repo, or the owner drops one).
- **Plain JS on canvas** (ImageData), no npm packages. Keep the core a pure function, `lines(imageData, opts) → Float32Array`, in its own file, so it can run in node later for batch work.

## Rules
Model Sonnet, no minions. Use a pool worktree, then `merge.mjs`. One screenshot at 1200 (one tool view), plus one at 400. Link the page from the blog post's "Next" section, and from /imagine/ if it lists its labs. Land it and stop.


## Next, after the line map works (the owner, 21:20; see the blog post, part 3)
- **A corner map:** endpoints, corners and intersections (Harris or Shi–Tomasi on the same gradients), shown as an overlay.
- **Connect the dots:** for nearby corner pairs, sample the line map along the segment and keep the strong ones.
- **Export as SVG,** plus a pixel comparison of the rendered SVG against the line map (a difference image and one score).

These are later rungs on the same page. Do the line map FIRST and land it.
