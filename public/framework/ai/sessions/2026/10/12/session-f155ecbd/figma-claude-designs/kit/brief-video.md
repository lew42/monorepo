# Brief: video kit + a storyboard (owner, 2026-10-12, night)

The owner's words and decisions: [ext/Figma/doc/video-kit.md](/framework/ext/Figma/doc/video-kit.md). Read it, then [brief-ds.md](brief-ds.md) (tokens only, text styles, prime as a splash, hug or fill, Specimen tiles, Rules box). File `QYN0G2URSBHYH5I06MOjxU`. Load the figma-use skill first.

**The owner reads the Figma file, not chat.** Put every summary, finding and open question on the pages themselves (a short "Notes" box at the top of each page) — not only in the report.

## 1. Page `Video · Kit`
- **Safe-zone frames** as components: `Frame / 16:9` (1920×1080) with action-safe (93%) and title-safe (90%) guides; `Frame / Shorts` (1080×1920) with the YouTube Shorts overlay zones drawn as labelled, semi-transparent blocks (right-hand action column, bottom caption + channel block, top bar) and the clear centre zone. Look up current Shorts overlay measurements (WebSearch is fine), cite the source in the Notes box. Guides on a hidden-able layer (`Guides`), so a frame exports clean.
- **Responsive graphics**, each a component set with `Format = 16:9 / Shorts`: title card (big title + kicker over a background slot), chapter card, lower third (name + role), quote card, caption/subtitle style, end card that links the long form (Shorts) / subscribe + next video (16:9), a "big number / stat" card, a map-or-location tag. Background is a SLOT (image or video still); text sits on a scrim or text background for contrast, light and dark versions. Text sizes are a register for 1080 and 1920 heights (readable on a phone), named.
- **Layout grid** for 16:9: thirds, and where text goes over imagery.
- Rules box: what goes where, the safe zones, minimum text size, one accent colour.

## 2. Page `Video · Storyboard · The Twelve`
A respectful, historical documentary about Jesus and the twelve apostles (about 10–12 minutes long form). 
- One row per scene: scene number, title, duration, the 16:9 frame (kit instance with image + text), narration (2–3 sentences, historically careful — present it as the Gospels' account where needed), shot / motion note (slow push-in, map animation, etc.), music/sound note.
- Scenes, roughly: cold open, the calling of the first disciples at the Sea of Galilee, one card per apostle or grouped (Peter, Andrew, James, John, Philip, Bartholomew, Thomas, Matthew, James son of Alphaeus, Thaddeus, Simon the Zealot, Judas Iscariot) with a "big fact" each, the ministry, the Last Supper, the arrest and Peter's denial, the aftermath and where tradition says each apostle went (a map card), closing.
- **Shorts cut**: a second column (or row below) showing 4–6 Shorts cut from the long form, each a 1080×1920 frame from the kit using the same graphic in its Shorts variant, with its hook line and the end card pointing at the long form. Mark on each long-form scene which Short it feeds.
- **Images**: try Figma MCP `generate_image` for a few key scenes (painterly, classical-art style, no text in images). If it fails or looks poor, use labelled placeholders that describe the intended image, and say so in Notes. Never imitate a living artist.
- A **▶ PROTOTYPE** to click through the scenes in order (16:9) with a big badge.

## 3. Then
Update `Claude · Overview`'s design-system card with links to both pages. Report `kit/video.md`: components + ids, Shorts overlay measurements and source, what generate_image did, open questions; commit by path.
