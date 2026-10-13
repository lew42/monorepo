# Report: Video · Kit and Video · Storyboard · The Twelve (2026-10-12)

Brief: [brief-video.md](brief-video.md). Owner's notes: [video-kit.md](/framework/ext/Figma/doc/video-kit.md). File `QYN0G2URSBHYH5I06MOjxU`. Everything below is also in the Notes box at the top of each page.

## Pages
- `Video · Kit` (`187:1062`, root `189:1063`): safe-zone frames, 8 component sets, 1080 / 1920 text register, 16:9 layout grid, Rules box.
- `Video · Storyboard · The Twelve` (`189:1062`, root `192:1062`): 16 scenes (11:10), 6 Shorts, a clickable 16-frame prototype (flow `The Twelve · long form`, starts at S01, loops).
- `Claude · Overview` design-system card: two linked lines added (`194:23989`, `194:23990`).

## Components (all `Format = 16:9 / Shorts`, `Tone = Dark / Light`)
Frame / 16:9 `187:1075`, Frame / Shorts `187:1086` (both have a hideable `Guides` layer). Title card `188:1117`, Chapter card `188:1170`, Lower third `188:1223`, Quote card `188:1272`, Caption `188:1313`, End card `188:1374`, Stat card `188:1423`, Location tag `188:1484`. Background is a slot; text sits on a scrim (72%) or a text background (88%).

## Shorts overlay measurements (1080×1920)
Top bar 180 px, bottom caption and channel block 390 px, right action column 120 px, left margin 60 px; clear zone 900×1350 at x 60, y 180. Sources: hopperhq.com/blog/youtube-shorts-dimensions and imagevideofit.com/guides/youtube-shorts-safe-zone. They differ by a few px; the kit uses the safer value. 16:9: action-safe 93%, title-safe 90%.

## generate_image
10 images (gemini-3.1-flash-image, the cap), painterly, no text, no living artist named; placed with `upload_assets` + `curl`. They fill every scene except the map (15, a labelled placeholder). Wikimedia public-domain art was not used (generation was faster); it is the better choice if the owner wants real classical paintings. The Thomas image has a painted easel and frame baked in. The supper image shows Jesus.

## Changed outside my pages
Kit scrims now dim with node opacity 72% instead of paint opacity (see [use-figma.md](/framework/ext/Figma/doc/use-figma.md) Traps).

## Open questions
- Show Jesus at all? Some traditions avoid it.
- A photoreal generator (Fal or Higgsfield MCP) for the apostle scenes.
- Premiere export (Final Cut XML) from the storyboard is not built.
- Values no token gives: the Video text styles, 24–40 px text-background padding, 72% and 88% opacities.

## Still looks off
The 72% scrim makes paintings dim; the Shorts end-card thumbnail slot is a grey box. Chapter, Quote, Caption and Layout grid sections of the kit were not re-viewed after the opacity fix.
