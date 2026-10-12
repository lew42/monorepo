# research-depictions — requirements (verbatim)

Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more — curated beats exhaustive. 2. Clarity is the one exception. 3. Prioritize. Final report ≤10 lines. HARD RULES: never kill/restart the :80 dev server; never stash; never commit. You are a RESEARCHER: web work + writing in YOUR dir only.

TASK — research round 1: ANCIENT DEPICTIONS rumored to show aliens or anomalous craft. First: run `new-task` (slug `research-depictions`, group `pages`).

Your dir: `public/imagine/research/depictions/` (create it). THE CONTRACT (fixed): append to `depictions/log.jsonl`, one line per entry: `{"at":"<ISO>","topic":"depictions","kind":"finding"|"source"|"theory"|"opinion"|"question","title","summary","url","credence":"established"|"contested"|"fringe"|"speculation"}` — Write tool for line 1, byte-safe appends. Curate into `depictions/page.js` + md subject pages.

THE SUBJECTS (WebSearch/WebFetch, cite everything): the famous claimed depictions — Val Camonica "astronaut" petroglyphs, Wandjina figures (Kimberley), Hopi/Anasazi star-being iconography, the Saqqara "bird"/model glider claims, Dendera "lightbulb" reliefs, Pacal's sarcophagus "rocket", medieval/renaissance art UFO claims (The Madonna with Saint Giovannino etc.), Nazca lines' intended audience question. FOR EACH: the artifact itself (what, where, when — established), what the culture's own context says it depicts (ethnography, art history — established), the alien interpretation and who advanced it (labeled fringe/contested), and what a fair reader keeps as genuinely odd or open. BOTH the rumor AND the scholarship, each with sources and credence labels. End each subject with "what would settle it".

≥25 log entries across ≥5 subjects with ≥12 distinct sources; then curate and land. A sibling's presentation page reads your log.

VERIFY: log parses (N = N valid), pages render 400/1920 on a private `$env:PORT='8093'; node server.js` (torn down after), links resolve. Report: entries by kind/credence, subjects, the most interesting open question.

## Plan
1. Scope + open task, create dir, log contract
2. Research: Val Camonica, Wandjina
3. Research: Hopi/Anasazi star-beings, Saqqara bird
4. Research: Dendera reliefs, Pacal sarcophagus
5. Research: medieval/renaissance art claims, Nazca lines
6. Write log.jsonl (all entries, byte-safe appends)
7. Curate page.js + subject md pages
8. Verify: parse count, render at 400/1920 on :8093, link check
9. finish-task
