# Brief: how real Figma UI kits organize their files (research, no Figma edits)

Budget: $3. Load the `minion` skill first. Web research only (WebSearch / WebFetch); do NOT touch Figma, the dev server, or any repo file except your one notes file.

For EACH kit you are given, answer these four questions from current (2025–2026) sources: the kit's own docs/site, its Figma Community page, changelogs, YouTube/blog write-ups.

1. **Pages:** are the file's pages by element type (Buttons, Cards, Inputs…) or by size/breakpoint? Where do sections / blocks / page templates / example screens live vs atoms? Is there a cover / index / overview / getting-started page? List the page names if a source shows them.
2. **Responsive:** do they draw Desktop / Tablet / Mobile versions of sections or screens? As variants (e.g. `Breakpoint=Desktop`), separate components, or separate pages? How many breakpoints, which widths?
3. **Swapping:** how does a designer change content inside a card/section, or swap a section for another: nested instances + native instance swap, instance-swap properties, Figma slots, "placeholder/slot" components to swap, or detach?
4. **Variants:** roughly how many variants per component (a 300-button grid, or few + properties)? Naming: slash names (`Button/Primary`) vs frames/sections, and how that shows in the Assets panel and swap menu.

Mark every claim **[verified]** (you read it in a source; give the URL) or **[reported]** (second-hand, or inferred). "Not found" is a fine answer; never guess. Prefer numbers (page count, component count, breakpoint widths).

Output: write your findings to the notes file named in your prompt: one section per kit, the 4 answers as short bullets with URLs, then a 3-line "what they have in common". Under 1200 words. Then end your turn with one line naming the file.
