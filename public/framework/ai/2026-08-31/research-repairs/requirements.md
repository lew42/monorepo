# research-repairs

Verbatim ask:

> Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more. 2. Clarity is the one
> exception. 3. Prioritize. Final report <=8 lines. HARD RULES: never
> kill/restart the :80 dev server (private `$env:PORT='8095'; node server.js`
> if needed, torn down after); never stash; never commit. Run the `research`
> skill FIRST (foreground digging only). Then `new-task` (slug
> `research-repairs`, group `pages`).
>
> TASK -- execute the repairs the self-audit demanded
> (`ai/2026-08-31/research-audit/audit.json` + the synthesis's "The audit"
> section): (1) the 2 genuinely-suspect entries -- the Saqqara Bird
> wind-tunnel claim (named engineer, 2006, balsa copy -- find the REAL
> provenance of that claim or mark the entry's credence down with a
> correction entry via `node public/framework/ext/Research/entry.mjs`; also
> fix the depictions saqqara page if it repeats it) and the Dogon-Sirius
> "mundane channel" citation (find the actual source for the 1893-expedition
> channel theory or correct); (2) re-pin the 6 wrong-url citations the audit
> lists (true facts, lazy urls -- find the specific articles and append
> correction entries with the precise urls; update the topic pages where
> those urls render). Every correction is an APPEND (the log is append-only
> history -- never rewrite old lines); pages update to cite the corrected
> entries.
>
> VERIFY: --check clean on all touched logs, the 8 corrections each carry the
> old claim + the fix + the new url, affected pages render (private server,
> torn down). Report: 2 suspect resolutions (found-provenance vs downgraded),
> 6/6 re-pins, pages touched.

## Scope / fences

- Appends only, one topic log at a time, matching where the flagged entry
  already lives: `stone/log.jsonl` (2), `depictions/log.jsonl` (3, incl. the
  2 genuinely-suspect), `disclosure/log.jsonl` (1), `theories/log.jsonl` (2).
- Page edits: only where the wrong/suspect url actually renders --
  `depictions/saqqara-bird.md`, `depictions/invented-traditions.md`,
  `stone/unfinished-obelisk.md` (no render found -- log-only),
  `stone/serapeum.md`, `depictions/tassili-najjer.md` (url renders but for a
  different, correct claim -- log-only), `disclosure/*.md` (no render found
  -- log-only), `theories/lost-civilization/page.js`.
- Not touching the audit.json or the research-audit task dir (read-only
  input).

## The 8, resolved

1. **Saqqara Bird** (depictions:19, suspect) -- Gregorie's own site confirms
   his balsa replica (primary); the Sanderson wind-tunnel/lift claim is real
   but only secondary-sourced (no primary doc, no confirmed year); Wikipedia
   cites a 2023 CFD study finding it unstable. Re-pinned + credence context
   added, not just downgraded -- provenance found, mixed quality.
2. **Dogon-Sirius** (depictions:44, suspect) -- the 1893-eclipse-expedition
   theory is Noah Brosch's (2008, *Sirius Matters*), not Sagan's; Sagan's
   real (already-correctly-cited) claim is the 1930s-40s visitor theory.
   Found provenance, corrected attribution.
3. stone:52 Engelbach fissure quote -> primary 1922 text (Gutenberg), exact
   match found.
4. stone:72 Dunn "different question" framing -> neuralgrimoire.com, makes
   the explicit distinction.
5. depictions:63 Lhote "Great Martian God" -> Wikipedia's own Henri Lhote
   page (not Round_Head_Period), exact quote confirmed.
6. disclosure:71 West Nimitz radar -> the actual tracking-glitch Metabunk
   thread (12740, not the radar-jamming one); Kevin Day's fictionalized 2008
   account separately confirmed real.
7. theories:42 Karahan Tepe pillar face -> the specific karahantepe.net
   article (not the /news listing).
8. theories:43 Gobekli Tepe wall statue -> earth.com's coverage (not
   timesofisrael.com).
