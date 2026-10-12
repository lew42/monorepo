# research-disclosure — research round 1: the modern UAP/disclosure arc

## The ask (verbatim)

Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more — curated beats exhaustive. 2. Clarity is the one exception. 3. Prioritize. Final report <=10 lines. HARD RULES: never kill/restart the :80 dev server; never stash; never commit. You are a RESEARCHER: web work + writing in YOUR dir only.

TASK — research round 1: the MODERN UAP/DISCLOSURE arc. First: run `new-task` (slug `research-disclosure`, group `pages`).

Your dir: `public/imagine/research/disclosure/` (create it). THE CONTRACT (fixed): append to `disclosure/log.jsonl`: `{"at":"<ISO>","topic":"disclosure","kind":"finding"|"source"|"theory"|"opinion"|"question","title","summary","url","credence":"established"|"contested"|"fringe"|"speculation"}` — Write tool line 1, byte-safe appends. Curate into `disclosure/page.js` + md subject pages.

THE ARC (WebSearch/WebFetch — this topic MOVES; get the current-through-2026 state and date every claim): the 2017 NYT AATIP story and the Navy videos (what the videos actually show per rigorous analyses — both the anomaly claims and the parallax/sensor explanations); the 2021 ODNI report; the hearings (Grusch 2023 — claims vs what was substantiated; AARO's findings and its critics); NDAA UAP provisions and the records act; the "Age of Disclosure" documentary (2025) — who's in it, what it claims, reception; the current official state of play (what AARO/agencies actually say now) vs the advocacy narrative. FOR EACH: the claim, the evidence made public, the skeptical analysis, the credence — the strongest sober case that something unexplained persists AND the strongest mundane accounting, both cited. End sections with "what would settle it".

>=25 log entries across >=5 threads with >=12 distinct sources (news of record, primary documents, named analysts — not aggregator slop); then curate and land. A sibling's presentation reads your log.

VERIFY: log parses, pages render 400/1920 on a private `$env:PORT='8091'; node server.js` (torn down after), links resolve. Report: entries by kind/credence, threads, the most interesting open question.

## Fences

- MINE: `public/imagine/research/disclosure/**` only.
- NOT MINE: any other `public/imagine/research/<topic>/` dir, `public/imagine/research/page.js`, `public/imagine/page.js`, `ext/Research/**`.
- Never kill/restart the :80 dev server. Never stash. Never commit.
