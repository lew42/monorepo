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

[Try the line-map prototype](/imagine/lines/): drop a photo, compare the original with line art, and tune how strongly faint, steady edges show up. Corners, vectors and 3D come after this first map works.

## Part 2: refining the idea (same day)

### Why bother
Turning ordinary images into 3D quickly and deterministically matters. The first target isn't perfect accuracy: it's rough, useful shapes. A shipping box is 8 corners and 12 edges, and a custom product shape would otherwise take hours of 3D modelling.

### What "linear" really means
The line score isn't how big the colour jump is. Two adjacent walls can differ by a whisker. It's three things:
- **Length:** how far the line holds.
- **Straightness:** how little it bends.
- **Signal strength and consistency:** how steadily the change repeats along its length. A faint change that holds for a long stretch, in the right place, is a strong line. A random flicker isn't.

Under the hood it's a derivative: for each pixel, the change to its neighbours in hue, saturation and brightness, **and the direction** of that change. A gradient is a steady flow in one direction, like the start and end points you drag out in a drawing program. A line is where many neighbouring pixels agree on the same direction of change.

### The filter
Output a mostly white image where the more confident a line is, the darker it draws. The result is **line art** of the photo. Text gets traced as outlines like everything else.

### From lines to a scene
- **Objects:** an LLM can help recognise regions ("this is a table") so its parts stay linked. Their boundaries come out of the line pass anyway.
- **The camera first:** placing the camera is the key step. A wall whose four edges are visible pins it down, even if something hides an exact corner: extend the lines.
- **Scale:** near things look bigger, so solve for real-world units. You need a unit system anyway to place points in 3D.
- **A solver:** try numbers, wiggle them, keep what helps. Each object gets an anchor point and rough heights and widths, refined until its render matches the line art.

## Part 3: the pipeline, end to end

1. **The line map.** The filter from part 2: line art where darker means more confident. It works on any photo, and on video too, even in real time. There can be more than one layer, from different formulas.
2. **The corner map.** A second map scores where lines END, TURN or CROSS: endpoints, corners, intersections. (The classic tools are corner detectors, like Harris or Shi–Tomasi, run on the same gradients.)
3. **Connect the dots.** For every pair of nearby corner points, ask the line map: is there darkness along the straight path between them? How confident? Draw the strong ones as edges.
4. **2D vectors.** Points plus edges make a vector drawing (an SVG). Check it by rendering the SVG and comparing it pixel by pixel with the line map. They're the same size and the same frame, so a plain difference (or a distance-to-nearest-line score) shows what's missing or invented. Iterate until they agree.
5. **3D: the hard part.** Run several strategies side by side and keep what agrees:
   - **Start with the easy geometry:** floors, walls, ceilings, cabinets, tabletops. Big, straight, mostly at right angles.
   - **Place the camera from the lines:** parallel edges in the world meet at vanishing points in the photo. Two or three vanishing points give the camera's angle and focal length, and then where every plane must sit.
   - **Then size and scale:** known things (a door, a counter height) set real-world units.
6. **Beyond shape:** textures, materials, lighting, then sound and time on a timeline. A walkthrough with a 360° camera could scan a whole space.

**One rule: don't invent.** Where the scan has no data (a room you never walked into), leave it empty, or fill it but mark it clearly as imagined. A scan has to stay honest to be trusted.

## Why this is bigger than scanning

Turning what a camera sees into 3D is the foundation for much more than models of rooms:
- **Robots that navigate:** knowing where the walls, floors and doorways are is how a robot moves through a space.
- **Obstacle avoidance:** what's in the way, how far away it is, and how big.
- **Measuring things:** real-world sizes from an ordinary photo.
- **Object recognition:** a table is its lines and planes, so shape helps say what a thing is.
- **Scanning spaces:** see [a fleet of drones that scans a home in minutes](/blog/ai/drone-scans/).

Lines, corners and planes are cheap to compute and easy to check. That makes them a strong first layer for all of it.
