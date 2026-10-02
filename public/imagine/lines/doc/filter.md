# The line-confidence filter

[Try it](/imagine/lines/) with the faint seam sample: a small grey step runs down the image, with loud random texture below it. The map rewards the steady seam rather than the brightness of the noise.

## Three ingredients

1. **Change:** centred differences in hue, saturation and brightness. Hue wraps at red and is weighted by saturation, because a grey pixel has no useful hue. Transparent pixels are composited onto white.
2. **Direction:** a structure tensor adds the gradient outer products across channels, then averages a square window. Its eigenvalue gap divided by its trace is coherence: close to one for an agreed direction, close to zero for mixed directions.
3. **Consistency:** sample along the tangent (perpendicular to the gradient). Reward neighbours whose direction agrees and whose signal keeps its strength. Divide gradient strength by itself plus the noise floor and incoherent local energy.

Confidence is coherence × along-line support × relative signal strength. It is bounded from zero to one. Display grey is `255 × (1 − confidence^gamma)`; smaller gamma makes weak responses darker without changing the map.

## The four sliders

- **Window size:** pixels used to estimate direction; larger windows suppress texture but soften corners.
- **Line length:** distance used to check continuity; longer spans reject short flickers but can weaken short real edges.
- **Noise floor:** minimum meaningful channel change; lower values reveal faint seams and more noise.
- **Gamma:** only the white-to-black display curve.

## Limits

This is a deterministic confidence heuristic, not a probability or an object recogniser. Straight texture, lettering and silhouettes can still score. Corners often lose coherence; the corner map is a separate later rung. A wireframe box sample draws all 12 edges and 8 vertices, including hidden edges, to provide a known input, not a detected geometry count.

The interactive tool resizes to at most 640 pixels on its longer edge and keeps every image in your browser. The pure function has no resize limit. Tensor windows use summed-area tables; continuity cost grows with pixels × line length. This first version runs on the main thread, so large batches belong in Node or a future worker.

The photo is the existing [paving and gull image](/edric/image/seagul.jpeg). Samples are drawn locally, without network or packages. There is no 3D, corner detection or SVG extraction yet.
