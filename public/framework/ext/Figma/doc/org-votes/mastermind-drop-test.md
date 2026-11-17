# Vote: mastermind-drop-test (2026-11-16, from what the drop test showed; no new Figma calls)

Evidence: [drop-test.md](../drop-test.md). An Auto master (Card, Button, Navigation) takes the mode of whatever container it lands in; a master with an explicit root mode (every layout, template, Res.* and preview) is pinned and never rescales; widths never adapt.

**Q1. Hybrid, but resolution-first for anything that has a width.** Layouts, pages and templates are pinned to one size, so a swap only "just works" among masters of the same width: one page per width makes the swap menu a list of valid answers. Atoms (Card, Button, text, Navigation pieces) should be ONE Auto master each, not one per size, because Auto already follows the container: no per-size copies, nothing to swap.

**Q2. Per resolution page, in order:** Preview (instances only), Layouts, Sections, Containers (cards, panels), Content (text, buttons, media). Yes, build every demo screen from that page's own masters, as instances, so swapping inside a demo is a real test; no masters inside the Preview (a live preview cannot hold them).

**Q3. Top-level folder frames on the page are the real folders** (what Assets groups by), with one tidy `Preview` frame at the top for the single screenshot of the page. To get both: name the components with slash paths (`Layouts/Sidebar + Main`) as well, which should also give folders inside Assets whatever the nesting (not tested here); a single `Root` per page would hide every master under one Assets heading, so avoid it.
