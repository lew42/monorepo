# What `.flex.auto` measures, at four widths

The owner's question, 2026-08-30: *"the flex.auto system that breaks at a specified place
might not work so well for 3440 2 and 3 columns."*

Measured, headless Chromium, at 400 / 1280 / 1920 / 3440 on
[the matrix](/framework/styles/layouts/cols/matrix/). Zero console errors, light and dark.

**The suspicion is half right, and the half that is right is the worse half.** The ratio is
fine — `--grow` holds it exactly at 3440. The *place* is not a place, and there is no
ceiling anywhere in the vocabulary.

## 1. The ratio: `--grow` holds, the old workaround decays

Two tracks meant as 2:1, at the page's own width.

| said as | 400 | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| per-child `--column` (30em / 15em) | stacked | **1.551** | **1.336** | **1.187** |
| `--grow: 2` | stacked | 2.000 | 2.000 | 2.000 |
| `cols-two-one` | stacked | 2.000 | 2.000 | 2.000 |

The `--column` pair is off by 22%, 33% and **41%**, worse the wider the screen — the decay
`wire/doc/bento.md` predicted (it read 1.45 / 1.30 / 1.17 in a different container). It is
still in the repo: `wire/specs.js` carries `flex: "2 1 30em"` twice.

`--grow` is exact because its basis scales with the weight. Nothing to fix here.

## 2. The place is not a place

`.flex.auto`'s stack point is `--column × --grow`, summed, in **`em`** — and `em` on this
site is `body { font-size: clamp(...) }`, a *viewport* clamp: 14px at 400, 15.04 at 1280,
16 at 1920, 18 at 3440. So the threshold moves 28% while the container does not move at all.

The same **460px box**, rendered at four viewport widths:

| host viewport | body `em` | `.flex.auto`, 2 tracks | `.flex.auto`, 3 tracks | `cols-half` / `cols-thirds` |
|---|---|---|---|---|
| 400 | 14px | 217 + 217, **one line** | 2 lines (orphan) | stacked · stacked |
| 1280 | 15.04px | 216 + 216, **one line** | 2 lines (orphan) | stacked · stacked |
| 1920 | 16px | **stacked** | stacked | stacked · stacked |
| 3440 | 18px | **stacked** | stacked | stacked · stacked |

Same markup, same container, opposite layout — decided by how wide the window happens to
be. A component dropped into a 460px column of a 3440 dashboard stacks; the identical
component in a 460px phone-width page does not.

It also lands uncomfortably close to the commonest phone width: two tracks need 28em, and
28em is **392px** at 400. A real 400px page keeps its two columns by 8px — 196px each.

## 3. No ceiling — this is the 3440 failure

Nothing in the flex vocabulary caps a track. `.flex.auto`, `.all-1`, `.three`, `.flex-1`
all grow without limit; `.basis` is fixed, which is the opposite problem.

An aside meant as 32%, at the page's own width:

| | 400 | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| `.flex.auto` + `--grow` | stacked | 334px | 534px | **1010px** |
| `cols-main-aside` | stacked | 307px | 416px (capped) | **416px** (capped) |

The ratio holds at 2.125 in every cell of the first row — that is exactly the trouble. The
vocabulary has no way to say *stop*, so a nav list gets 1010px at 3440 and spends 600px of
it on nothing. `core/Page/doc/findings.md`: of the five content kinds, only a nav LIST does
not scale, and a list is what an aside holds.

The same at three tracks: `cols-rail-main-aside`'s aside caps at 352px where its share
would have been 804px, and the main track takes the difference.

## 4. Three tracks wrap 2 + 1

`.flex.auto` breaks a line when the bases stop fitting, so three tracks pass through a band
where two fit and one does not — an orphan on a second line at full width. Measured at 400
(196 / 196 / 400) and in the 460 box at both 400 and 1280. There is no width at which that
is the layout anyone asked for.

## Where `.flex.auto` is right, and stays

- **A wall of tiles.** A wrap threshold is exactly the correct mechanism, and `--column` is
  exactly the correct dial. Nothing here argues against it.
- **Two peers, 50/50.** Exact at every width measured — 1.000 at 1280, 1920 and 3440.
- **A weighted seam via `--grow`,** if you can live with a stack point that moves with the
  viewport and a track with no ceiling.

The verdict: **not a bug, a different question.** `.flex.auto` answers *when does this
row run out of room*. A 2- or 3-column layout asks *what shape is this row, and where does
it stop being one* — which needs a share, a ceiling, and a floor that is a fixed place.
