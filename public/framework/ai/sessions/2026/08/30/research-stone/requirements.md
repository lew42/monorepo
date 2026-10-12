# research-stone

Verbatim ask (research round 1, PRECISELY CARVED STONE of ancient origin):

> Your dir: `public/imagine/research/stone/` (create it). THE CONTRACT (fixed): append
> findings to `stone/log.jsonl`, one line per entry:
> `{"at":"<ISO>","topic":"stone","kind":"finding"|"source"|"theory"|"opinion"|"question","title","summary","url","credence":"established"|"contested"|"fringe"|"speculation"}`
> — the Write tool for line 1, byte-safe appends after (no BOM, no torn lines). Curate into
> `stone/page.js` + md pages: an index + 3-6 subject pages.
>
> THE SUBJECTS (WebSearch/WebFetch; dig deep, cite everything): the precision-carving
> corpus — Puma Punku's H-blocks, the Serapeum of Saqqara granite boxes, Barabar caves'
> polished interiors, polygonal megalithic masonry (Cusco/Sacsayhuamán), predynastic
> Egyptian hard-stone vases, the unfinished obelisk's tool marks. FOR EACH: what is
> actually there (measurements, materials, dating — established), the mainstream
> archaeological account of HOW (tools, techniques, experimental archaeology
> reproductions — established/contested), the alternative claims made about it (lost
> technology, machining — labeled fringe/contested honestly), and the open questions a
> fair reader keeps. BOTH SIDES DOCUMENTED — the rumor and the rebuttal, each with
> sources and credence labels. End each subject page with "what would settle it" (the
> evidence that would move the credence).
>
> Keep digging until you have ≥25 log entries across ≥5 subjects with ≥12 distinct
> sources; then curate and land. The presentation page (a sibling builds it) reads your
> log — the log is the record, the pages are the reading.
>
> VERIFY: log lines parse (node one-liner, N lines = N valid), your pages render at
> 400/1920 on a private `$env:PORT='8099'; node server.js` (torn down after), links
> resolve. Report: entries by kind/credence, subjects covered, the single most
> interesting open question you found.

## Scope / ownership
- Files owned: `public/imagine/research/stone/**` only.
- `public/framework/ai/2026-08-30/research-stone/**` (this task's own log).
- Read-only elsewhere.

## Steps
1. Scope subjects, confirm dir contract
2. Research Puma Punku H-blocks
3. Research Serapeum of Saqqara granite boxes
4. Research Barabar caves
5. Research polygonal masonry (Cusco/Sacsayhuamán)
6. Research predynastic Egyptian hard-stone vases + unfinished obelisk
7. Write log.jsonl, curate page.js + md pages
8. Verify (jsonl parse, render at 400/1920, links) and land
