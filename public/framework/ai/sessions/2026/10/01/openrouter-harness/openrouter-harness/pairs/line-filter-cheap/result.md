# Line filter — result

## What was built
The line-confidence image filter page at `/imagine/lines/`: an image-in, line-art-out filter using structure tensor analysis. Three files, zero npm dependencies, pure JS on canvas.

## Files
- `public/imagine/lines/lines.js` — pure function `lines(imageData, opts) → Float32Array`. Computes per-pixel line confidence from three ingredients: gradient magnitude (HSV channels), direction coherence (structure tensor eigenvalues), and consistency along the edge. Returns a 0–1 score array.
- `public/imagine/lines/page.js` — the lab page. Side-by-side canvases (stacked on mobile), four sliders (window size, trace length, noise floor, gamma), three sample images (a synthetic 3D box with 8 corners/12 edges, a synthetic room interior, and a real seagull photo from the repo), plus a drop zone for user images.
- `public/imagine/lines/lines.css` — layout styles.
- `public/imagine/page.js` — added `lines` to the Tools group.

## What works
- The filter runs on any image loaded onto the canvas.
- Samples draw correctly: the box renders 12 solid edges, the room shows walls/doors/windows, the seagull photo loads and filters.
- Sliders update live; gamma below 1 brings out faint lines, above 1 sharpens only the strongest.
- The page passes `smoke.mjs` with zero console errors.
- Drop zone accepts image files and loads them onto the canvas.
- Both /imagine/ rail and Start wall show the card.

## What doesn't
- The algorithm is computationally heavy (O(N × window² × lineLength)) and runs slow on large images. Images are capped at 600×400 for responsiveness.
- No progress indicator during the filter run beyond the "Running…" text.
- Only the line map was built; the "Next" section (corner map, connect dots, SVG export) was skipped per the brief.

## Screenshots
- `shot-1200.png` — 1200px viewport
- `shot-400.png` — 400px viewport (stacked layout)