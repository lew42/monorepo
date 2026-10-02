# Line art — darker pixels mark steadier, straighter edges

[Open the filter](/imagine/lines/): drop an image, or choose the box, room, faint seam or photo. The original and line map sit together; four sliders tune the result.

## Use

```js
import { lines } from './lines.js';
const confidence = lines({ width, height, data }, { window: 5, length: 17, noise: 0.006 });
```

`data` is RGBA bytes. The result is a `Float32Array`, one confidence from 0 to 1 per pixel. The core has no DOM and runs in Node. Gamma changes the display, not the confidence.

## More

- [How the filter works](/imagine/lines/doc/filter/) — channel gradients, direction, continuity and limits.
- [The original idea](/blog/ai/lines-to-3d/) — the later corner, vector and 3D rungs.
- [Task log](/framework/ai/2026-10-01/line-filter/) — tests, review and ongoing work.
