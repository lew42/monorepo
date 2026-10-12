# Figma phase 2: state (2026-10-12)

Brief: [requirements.md](./requirements.md). Everything below is in `ext/Figma` ([/framework/ext/Figma/](/framework/ext/Figma/)).

1. **Layout findings fixed** on the browse and Palette pages (em units, wrapping columns, full-width card). Merged.
2. **Capture proven** at 400/1200/1920: flex survives as auto layout, one breakpoint per capture. Verdict: [doc/capture.md](/framework/ext/Figma/doc/capture.md).
3. **Mapping table:** [doc/figma-to-framework.md](/framework/ext/Figma/doc/figma-to-framework.md).
4. **One more design:** Page 8 as [Auto layout](/framework/ext/Figma/autolayout/), spec by Sonnet, built by Haiku first try ([hits and misses](/framework/ext/Figma/doc/haiku-builds.md)).
5. **Owner feedback done:** Figma in the ext nav, all nine Palette sections declared, cards show Built page and Compare, thumbnails and lazy images, own-click redraw (the "lag"), `visibility.mjs` run in `Server/merge.mjs` when a branch touches ext/Figma.

Open: Figma grid layout and component variants are unconfirmed in the mapping (no example in the files). Pages 3 to 6 of Sept-2026 are still unbuilt.
