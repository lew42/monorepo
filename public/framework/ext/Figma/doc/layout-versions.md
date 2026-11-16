# Layout version: what the Plugin API can and can't do (2026-11-16)

Figma has two auto-layout versions, **Latest** (default for new frames since July 2026) and **Legacy** (switchable back only until January 2027). Full list of the six differences: [design-system-notes.md](design-system-notes.md).

## The API has no `layoutVersion` property

Tested on the Lew42 v2 file (`ADpu9u2V0BlEZfR3rrMfER`): looped `for (const k in node)` plus `Object.getOwnPropertyNames(Object.getPrototypeOf(node))` on both a brand-new auto-layout frame and an existing one ("Embedded cards", node 34:506), filtered for any key containing "version" or "layout". No match. Tried the three likely names directly (`autoLayoutVersion`, `layoutVersion`, `layoutGridVersion`) — each throws `no such property '<name>' on FRAME node`. Confirmed against Figma's own Plugin API docs (`developers.figma.com/docs/plugins/api/properties/nodes-layoutmode/`): `layoutMode` only takes `NONE` / `HORIZONTAL` / `VERTICAL` / `GRID`, and nothing documents a version property.

**Consequence: it cannot be read, and it cannot be set.** A new frame is Latest by default (Figma's own rule, not something the API confirms) — there is no way for an agent to tell Latest and Legacy frames apart, or to force either one.

## What this means for the Explore pages

- **Legacy vs Latest counts for Big Sloppy or v2: not available.** Any count would have to be a human reading each frame's own right-click menu in the Figma app; the plugin API gives no signal.
- **The "Legacy vs Latest" Explore page cannot show a real Legacy frame.** Every frame Claude creates is Latest. The six edge cases are shown as a labelled comparison against the browser's own CSS behaviour (the HTML twin), marked "documented, not reproduced" rather than faked as an actual Legacy frame.
- **Practical effect: always Latest.** Since no file can be forced to Legacy through the API, and Latest already matches CSS border-box, there is nothing to switch — [design-system-notes.md](design-system-notes.md) already says to use Latest everywhere.
