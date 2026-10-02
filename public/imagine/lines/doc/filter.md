# The line-confidence filter

[Try it](/imagine/lines/) with the faint seam sample: a small grey step runs down the image, with loud random texture below it. The map rewards the steady seam rather than the brightness of the noise.

The filter looks for colour changes that keep the same direction and strength along a line, rather than changes that scatter in every direction.

## Three ingredients

1. **Change:** compare the pixels on either side of each pixel, horizontally and vertically. Do this for hue, saturation and brightness. Hue wraps at red and matters less in nearly grey pixels. Transparent pixels are laid over white first.
2. **Direction:** gather these changes in a small square. If they mostly point the same way, the direction score is high; mixed directions make it low. This agreement score is called **coherence**. The calculation uses a structure tensor, a small table that combines the horizontal and vertical changes.
3. **Consistency:** follow the possible line, at right angles to the colour change. Nearby pixels support it when their direction agrees and their change stays strong. This gives **along-line support**. Compare change strength with the noise floor and locally mixed directions to get **relative signal strength**: a steady faint edge can beat loud random texture.

Confidence multiplies Direction's coherence by Consistency's along-line support and relative signal strength. It stays between zero and one. Display grey is `255 × (1 − confidence^gamma)`; smaller gamma makes weak responses darker without changing the map.

## The four sliders

- **Window size:** pixels used to estimate direction; larger windows suppress texture but soften corners.
- **Line length:** distance used to check continuity; longer spans reject short flickers but can weaken short real edges.
- **Noise floor:** minimum meaningful channel change; lower values reveal faint seams and more noise.
- **Gamma:** only the white-to-black display curve.

## Limits

This is a deterministic confidence heuristic, not a probability or an object recogniser. Straight texture, lettering and silhouettes can still score. Corners often lose coherence; the corner map is a separate later rung. A wireframe box sample draws all 12 edges and 8 vertices, including hidden edges, to provide a known input, not a detected geometry count.

The interactive tool resizes to at most 640 pixels on its longer edge and keeps every image in your browser. The pure function has no resize limit. Tensor windows use summed-area tables; continuity cost grows with pixels × line length. This first version runs on the main thread, so large batches belong in Node or a future worker.

The photo is the existing [paving and gull image](/edric/image/seagul.jpeg). Samples are drawn locally, without network or packages. There is no 3D, corner detection or SVG extraction yet.
