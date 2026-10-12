# Result — line-filter-sonnet

Built the line map at `/imagine/lines/` in the worktree `C:/Code/lew42/worktrees/lt-sonnet` (branch `worktree/lt-sonnet`), not merged — that's the mastermind's call per the pairs trial.

**Files:** `public/imagine/lines/lines.js` (the pure scoring function, `lines(imageData, opts) → Float32Array`, no DOM — runs in node later for batch work), `page.js` (the UI: sample picker, four live sliders, two canvases), `lines.css`, `readme.md`. Also touched `public/imagine/page.js` (one word, added `lines` to the Tools group) and `public/blog/ai/lines-to-3d/post.md` (one link in its own "Next" section).

**The score:** a multichannel structure tensor (Di Zenzo) summed over four channels — brightness, saturation, and hue as a saturation-scaled unit vector, so an unstable hue on a near-grey pixel barely counts. Its eigenvalues give coherence (direction agreement); its eigenvector gives the line's own tangent, which is then walked a few pixels each way and normalised by the local noise — the brief's own formula, coherence × consistency-along-the-line × (gradient size / noise).

**What works:** both synthetic samples (a wireframe box, a one-point-perspective room — 8 corners, 12 edges each) trace clean in the line map, a scattered noise patch in the corner stays visibly fainter than the real edges, and two real UI screenshots (already in the repo) pick out panel borders and text blocks correctly. All four sliders redraw live. Drag-and-drop and click-to-upload both work for a reader's own image. `node Server/smoke.mjs` on `/imagine/lines/` is clean, and a headless Playwright pass at 1200 and 400 wide shows zero console or page errors.

**What doesn't (yet):** this is the line map only, per the brief — no corner map, no vector export, no 3D (that's the brief's own "Next" section, explicitly out of scope here). Processing runs on a fixed 420px working square for speed; a much larger photo is scaled down first, so very fine detail in a huge image is lost.

Screenshots: `shot-1200.png`, `shot-400.png` (both in this folder).
