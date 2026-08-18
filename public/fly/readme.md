# fly

A three.js flight demo: a ship, a thousand towers, and a drag-stick. Ported from
`lew42com/public/fly/` on 2026-08-17.

**This page is outside the SPA.** `/fly/index.html` is a real file, so the static
host serves it directly and the app in `/app.js` never boots — which is what a
full-window canvas wants. It still imports `core/View`, so the HUD and the stick
are framework views and `framework.css` is in the cascade. **Link it as `/fly/`
with the trailing slash** — the dev server runs `express.static` with
`redirect: false`, so `/fly` falls through to the SPA fallback and renders a 404.

## Files

| | |
|---|---|
| `index.js` | scene, world, camera follow, the animation loop |
| `joystick.js` | the drag stick — writes `roll`, `pitch`, `boost` onto the control object it is handed |
| `fly.css` | body reset, HUD, stick |
| `three.js`, `three.core.js` | three r0.181.2, minified module build, vendored |
| `GLTFLoader.js`, `BufferGeometryUtils.js` | the loader and its one dependency |
| `spaceship.glb` | the model |

## Traps

- **The vendored files had their specifiers rewritten.** `three.module.min.js`
  imported `./three.core.min.js` **twice on one line** (the import and the
  re-export), so a `sed` without `/g` fixes one and leaves the other — the page
  then 404s for a file that is right there under another name. `GLTFLoader.js` and
  `BufferGeometryUtils.js` both imported bare `'three'`, which LAW#3 forbids and no
  importmap here would satisfy; both now name `./three.js`.
- **`clock.getDelta()` runs before the pause check.** Skipping it lets the delta
  accumulate for the whole pause, and the ship jumps a mile on resume.
- **The model's facing is baked into the geometry**, not left on the transform, so
  `ship.position` and `ship.quaternion` are pure flight state and the camera can
  read `ship.matrixWorld` without unwinding a correction.
- **Pointer listeners live on `document`**, not on the knob — a fast drag outruns a
  100px circle and would silently stop steering mid-gesture.

## Deliberately not done

The source's commented-out second-window viewer, `OrbitControls`, the forward-vector
debug line and the axes helpers are dropped rather than ported. Device-orientation
steering on mobile was stubbed there and is still unbuilt.
