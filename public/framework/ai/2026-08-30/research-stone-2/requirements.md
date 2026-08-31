# research-stone-2

Verbatim ask (research round 2, CARVED STONE):

> Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more. 2. Clarity is the one
> exception. 3. Prioritize. Final report <=8 lines. HARD RULES: never
> kill/restart the :80 dev server; never stash; never commit. Run the
> `research` skill FIRST -- it is the round's discipline. Then `new-task`
> (slug `research-stone-2`, group `pages`).
>
> TASK -- round 2 on CARVED STONE: deepen `public/imagine/research/stone/`
> (round 1: 65 entries, 6 subjects -- read its log.jsonl + pages first;
> append via `node public/framework/ext/Research/entry.mjs`, never
> hand-rolled). Dig the open questions round 1 recorded, foremost: the Dunn
> 1995/2001 Serapeum measurements never independently re-verified -- find
> ANY independent metrology (published scans, photogrammetry, museum
> surveys), or document authoritatively that none exists (who could do it,
> what it would take). Also: experimental archaeology replications with
> numbers (granite drilling rates, Stocks' experiments), the predynastic
> vase scanning controversy (recent structured-light claims and their
> critiques), one new subject if the digging surfaces one that earns a
> page. >=20 new validated entries, >=10 new sources; update the subject
> pages + index where findings move a credence. VERIFY: `entry.mjs --check`
> clean, pages render on a private `$env:PORT='8099'; node server.js` (torn
> down), links resolve. Report: new entries/sources, credences moved (which,
> why), the Dunn answer.

## Scope / ownership
- Files owned: `public/imagine/research/stone/**` only.
- `public/framework/ai/2026-08-30/research-stone-2/**` (this task's own log).
- Read-only elsewhere.

## Steps
1. Read round 1 log.jsonl + all subject pages; list open questions to chase
2. Dig the Dunn/Serapeum independent-metrology question specifically
3. Dig experimental archaeology replications with hard numbers (Stocks etc.)
4. Dig the predynastic vase scanning controversy (recent claims + critiques)
5. Scout for a possible 7th subject; decide go/no-go
6. Append entries via entry.mjs, running --check as I go
7. Update subject pages + index where a finding moves a credence
8. Verify (entry.mjs --check, render at private port, links) and land
