# research-theories — the major theories, summarized and assessed

## The ask (verbatim)

TASK — research round 1: the MAJOR THEORIES, summarized and assessed. Your dir: `public/imagine/research/theories/`. Contract: append to `theories/log.jsonl`: `{"at","topic":"theories","kind":"finding"|"source"|"theory"|"opinion"|"question","title","summary","url","credence":"established"|"contested"|"fringe"|"speculation"}` — Write tool line 1, byte-safe appends. Curate into `theories/page.js` + one md page per theory.

THE THEORIES (WebSearch/WebFetch, cite everything): the Younger Dryas impact hypothesis (proponents' evidence — platinum spikes, nanodiamonds, Hiawatha crater; mainstream critiques; where the journals stand now — genuinely contested science); lost advanced ice-age civilization (Hancock's case, mainstream archaeology's answer, what Gobekli Tepe / Karahan Tepe actually established); the ancient astronaut hypothesis (von Daniken to Sitchin, methodological critiques, why it persists); catastrophism vs gradualism as the meta-frame; the modern interdimensional/psychosocial UAP hypotheses as a bridge to the disclosure topic.

FOR EACH: claim in 3 lines, best evidence, contemporary expert opinion (named, cited, dated), conclusions/implications if true, the credence label, and "what would settle it". Then ONE synthesis page: what the theories share, where they conflict, the aggregate picture — plus, if a genuinely novel connection occurs across the four topics, a clearly-labeled `speculation` entry with its reasoning.

>=25 log entries across >=5 theories with >=12 distinct sources; then curate and land. A sibling's presentation (`research-system` task) reads this log.

VERIFY: log parses, pages render 400/1920 on a private `$env:PORT='8092'; node server.js` (torn down after), links resolve.

## Fences

- MINE: `public/imagine/research/theories/**` only.
- NOT MINE: `public/imagine/research/<other-topic>/**` (stone, depictions, disclosure — three sibling minions write there right now), `public/imagine/research/page.js`, `public/imagine/page.js` (the `research-system` sibling owns the aggregate front).
- Never kill/restart the :80 dev server. Never stash. Never commit. Never drive owner tabs.
