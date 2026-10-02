An idea, written down before it gets lost. It isn't a result, and it isn't a priority yet.

## The starting point: Gaussian splats

Gaussian splatting rebuilds a 3D scene from photos as millions of soft, coloured ovals ("splats"). It looks great. But an oval is a strange building block for a world that is full of **straight lines**: the edge of a table, the fold of a box, a door frame.

So: what if we started from lines instead of blobs?

## Step 1: score how straight every edge is

Run the image through a filter that writes a new channel: for each region, **how much of a line is here?**

- **Straightness:** a perfectly straight edge scores high. A slight curve scores a little lower. It's probably still a line, just a less certain one.
- **Length:** a line that holds for a long way is stronger evidence than a short one.
- **Sharpness and confidence:** a colour change is just a very abrupt gradient. A soft gradient over several pixels (the fold of a box) is an edge too, only a blurrier one. Even a subtle line counts if it's statistically real.

Each line ends up with a **weight**, from those three together.

Two extras fall out of the same pass:

- **Gradients have shapes too.** Detecting where a gradient runs is the same job as detecting an edge, and gradients often outline a surface.
- **Distortion analysis.** If many lines that *should* be straight all bend the same way, the lens is warping the picture. Measure that warp, and undo it before trusting any line.

## Step 2: lines to 2D vectors

From the line channel, draw the image as simple **2D vector shapes**: segments, corners and closed outlines, generalised as far as they'll go. Most of a man-made scene collapses into very few shapes.

## Step 3: 2D to 3D, by guess and check

This is the hard part. Here's the simplest approach I can think of:

1. **Guess.** Put an origin point down, and give every corner a rough depth.
2. **Render.** Draw the current 3D model back into a 2D picture from the camera's point of view.
3. **Compare.** Line the render up against the line channel from step 1.
4. **Nudge.** Move the 3D points to shrink the mismatch, then repeat from 2.

This is an optimisation loop: keep adjusting the model until its render matches the edges in the photo. With more than one photo, the guesses pin down much faster. An LLM could probably make a decent first guess at step 1.

## Why lines might beat blobs

- **Far fewer pieces:** a box is 12 edges, not a cloud of ovals.
- **A real model at the end:** editable geometry, not just a pretty point cloud.
- **Confidence built in:** every line keeps its weight, so the weak ones can be dropped or revisited.

## Next

People have surely worked on this (line-based structure from motion, wireframe reconstruction). The next step is a small research pass: what exists, what works, and whether a quick prototype on a photo of a box is worth trying.
