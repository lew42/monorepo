# research-audit

Verbatim ask:

> Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more. 2. Clarity is the one
> exception. 3. Prioritize. Final report <=10 lines. HARD RULES: never
> kill/restart the :80 dev server; never stash; never commit. Run the
> `research` skill FIRST (note its foreground-digging warning -- no background
> sub-agents). Then `new-task` (slug `research-audit`, group `pages`).
>
> TASK -- research round 4, question #4: audit the program's own inputs. The
> capstone (`/imagine/research/theories/synthesis/`) asks: how much of what
> this program read was machine-invented? Two fabricated citations were caught
> by accident; the denominator is unknown. You produce the denominator.
>
> METHOD: sample 60 entries across the four logs
> (`public/imagine/research/{stone,depictions,disclosure,theories}/log.jsonl`
> -- stratified: 15 per topic, mixed kinds/credences, seeded selection you
> document so it's reproducible). For each sampled entry: fetch its `url`
> (WebFetch); classify: VERIFIED (the page exists and supports the entry's
> summary), EXISTS-BUT-WEAK (page exists, claim only partially supported),
> UNREACHABLE (404/paywall/bot-blocked -- note which), or WRONG (page exists
> and does not say what the entry says / the source itself is fabricated).
> Two numbers that must agree: sampled count vs classified rows in audit.json
> (in your task dir). Then: append the results as validated entries via
> `node public/framework/ext/Research/entry.mjs` into `theories/log.jsonl`
> (kind: finding, credence: established -- these are measurements), and add a
> short "The audit" section to the synthesis page with the rates + what they
> mean for the program's claims (if the WRONG rate is material, say which
> entries are now suspect; if it's near zero, say the program's sourcing
> held).
>
> FENCE -- your task dir, the entry.mjs appends, the one synthesis section.
> VERIFY: --check clean, synthesis renders (private
> `$env:PORT='8096'; node server.js`, torn down), audit.json counts match.
> Report: the four rates, the verdict line, any entries flagged suspect.

## Scope / fences

- Mine: this task dir (`audit.json`, `sample.mjs`, notes); appends to
  `public/imagine/research/theories/log.jsonl` via `entry.mjs`; one new
  section ("The audit") in `public/imagine/research/theories/synthesis/page.js`.
- Read-only: the other three topic logs (`stone/`, `depictions/`,
  `disclosure/`) -- sampled from, never written to.
- Not touching any other page or module.

## Method notes

- Sampling: deterministic seeded PRNG (mulberry32, seed documented in
  `sample.mjs`), 15 entries per topic drawn from that topic's `log.jsonl`
  (0-indexed lines), reproducible by re-running the script.
- Classification done by fetching each entry's `url` with WebFetch and
  comparing the page content to the entry's `title`/`summary`.
