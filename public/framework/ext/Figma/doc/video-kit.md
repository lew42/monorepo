# Video kit: planning videos in Figma (owner, 2026-10-12 night)

The idea: use the Figma file to plan videos the way it plans pages. A rough draft first (scenes, titles, graphics, motion notes), worked on together, then handed to editing.

## What the owner asked for
- A **video kit** for two formats: long form at **1920 × 1080** (documentary, standard HD) and **Shorts** at **1080 × 1920**, where buttons, captions and channel info cover the edges, so text and key imagery must stay inside a safe zone.
- **Responsive graphics**: one title card, lower third or quote card designed once, with a 16:9 variant for the long form and a 9:16 variant for Shorts.
- **Storyboards**, AI-drafted. First example: **Jesus and the twelve apostles**.
- Every long-form video gets re-cut into many Shorts, each linking back to the long form (YouTube's related-video link). The storyboard should mark which scenes become which Short.

## Decisions so far
- Kit and storyboard live in the Sept-2026 file on pages `Video · Kit` and `Video · Storyboard · The Twelve` (brief: [brief-video.md](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/brief-video.md)).
- Safe zones follow the broadcast convention for 16:9 (action-safe 93%, title-safe 90%) and the YouTube Shorts overlays for 9:16 (right-hand button column, bottom caption and channel block, top bar); measured values are recorded on the page.
- Images: placeholders first, then Figma MCP `generate_image` where it works; a dedicated generator (Fal, Higgsfield) is the owner's call — see below.

## Images: what works (verified 2026-10-12)
- **Generate**: Figma MCP `generate_image` works (plan `Michael's Starter team`, `team::1558244461354989578`; models gemini-3.1-flash-lite-image default, gemini-3.1-flash-image, gpt-image-2.5-sunburst). Each call spends Figma AI credits; the URL expires in 7 days, so download it.
- **Find**: Wikimedia Commons serves real photos and public-domain art (e.g. Leonardo's Last Supper) by direct URL with a descriptive User-Agent; its API searches without a key. Credit the author and licence on the frame. Unsplash's search needs an API key (not set up).
- **Place**: `use_figma` cannot fetch (`createImageAsync` is unsupported). Path that works: `curl` the image to the scratchpad, `upload_assets` with `nodeIds` to get a single-use URL per frame, then `curl -F file=@img.jpg` to it; the image becomes that frame's fill.

## Open, for the owner (also on the Figma Overview's "For you" card)
- **Image generator**: Figma's `generate_image` works and is in use (it spends Figma AI credits). A Fal or Higgsfield MCP is only needed for video clips or higher-end photoreal stills.
- **Premiere**: Claude cannot drive Premiere's UI, but Premiere imports a **Final Cut Pro XML** (or EDL) timeline. A node script can turn a storyboard (scenes, durations, stills, titles exported from Figma as PNG) into that XML, so the rough cut opens in Premiere ready to edit. Premiere's UXP scripting is a later option. Not built yet.
