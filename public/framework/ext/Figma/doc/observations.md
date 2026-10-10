# Observations: how the Figma MCP behaves (2026-10-10, kept current)

- **No file listing.** `whoami` gives plans and teams; nothing lists files. Every call needs a file key from a URL.
- **`get_metadata` without a node id** lists only the page names and ids (cheap). With a page id it returns an XML tree of the whole page: Page 1 cost about 4k tokens, so ask for it only on a page you will rebuild.
- **`get_screenshot` on a page id works** and returns a PNG at most 1024 px on the long side, however large the page (Page 3 is 29443 wide). A short-lived URL; download with `curl -L`. The 8 pages of Sept-2026 came to 1 MB total. The image also shows in the agent's context, so batch the calls.
- **`get_design_context` returns React + Tailwind with exact tokens.** On Page 7's dark card it gave the real values (`rgba(0,0,0,0.1)`, `rgba(255,255,255,0.1)`, `rgba(0,0,0,0.5)`, text/prime/muted variables, 14px/16px Montserrat, 16/32/36 gap and padding). Cost: one card, about 3k tokens. It is the right tool for tokens; screenshots are the right tool for previews.
- **Page 7 verdict: the nested shades are alpha overlays**, black or white at 10% / 25% / 50%, not fixed greys. The Prime card is `#72c4ff` with a 25% darken card inside so white text keeps contrast.
- **Contrast** (computed in `colors/page.js`): white text on Prime alone is 1.9:1, so the 25% darken (3.3:1 for black text, white text is better on it) is what makes the card usable. Light mode nests as deep as dark mode as far as the numbers go; see the page.
- **Metadata nodes**: `symbol` is a component, `instance` a use of one. Instances show no children in `get_metadata`; `get_design_context` expands them.
- **`generate_figma_design` works on a local page** (headless Chromium + capture script, poll by id): viewport only, 429 frames for one screen, layout frozen; details in [capture.md](./capture.md). `get_design_context` over ~90 KB returns metadata only.
- **Sept-2026 Palette sections use real auto layout** (`flex flex-col gap-[var(--gap,16px)]`, `flex-[1_0_0]`, variables like `--section-pad-x`), so `get_design_context` maps them to flex directly; the Colors capture of our site had none. Overlays arrive as stacked `linear-gradient(rgba..)` backgrounds, base colour last.
- **Not yet checked:** Figma embed responsiveness (the owner thinks embeds are not responsive; screenshots in our own grid make it moot), rate limits, a `use_figma` write.
- The dev server's `jsonl-guard` hook blocks any shell command that writes a `.jsonl`; generate those through a node script (`track.mjs`), as the repo intends.
