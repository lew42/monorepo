# System: meaning, beat, future

## What it is
A System is a README system: an on-demand skill for a directory. Its `readme` is what an AI loads first; `check()` is the code that proves the readme's promises. A human can run or use one just as well (layout, content). The base class is generic and isomorphic (no `fs`); node-only subclasses read files.

Each field and method is explained on the page, from `System.api`, so the card cannot drift from the class.

## One instance per module
AI systems are named individually (Sessions, Servex, Transcription so far) and each lives with its module: `system.js` beside `page.js`, `root` = that module. They reuse `ReadmeSystem` for now; a module that needs its own check subclasses `System` next to itself. Still to add: Accounting, Prompt refinement, Page tool, Inbox, Skills.

## The beat
`node Server/systems-beat.mjs` runs every check once and appends to `results.jsonl` (skips when `node Server/usage-now.mjs` exits 2). Report-only: `heal()` fixes nothing yet on the real systems.

## Future (not built): a compositor
A canvas where system cards plug into each other by drag and drop: wire Navigation's findings into Readmes' inbox, or chain a heal after a check. It needs the cards (above) and a stable `report()` shape first, which is why those come first.
