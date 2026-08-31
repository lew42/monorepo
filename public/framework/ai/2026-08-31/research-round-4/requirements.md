# research-round-4

Verbatim ask:

> Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more. 2. Clarity is the one
> exception. 3. Prioritize. Final report <=10 lines. HARD RULES: never
> kill/restart the :80 dev server (private `$env:PORT='8099'; node server.js`
> for render checks, torn down after); never stash; never commit. Run the
> `research` skill FIRST -- dig in the FOREGROUND, never background
> sub-agents. Then `new-task` (slug `research-round-4`, group `pages`).
>
> TASK -- the research program's round 4. The capstone (`/imagine/research/`
> -- find the synthesis/capstone page and its round-4 questions; two are
> already done: the reflexive audit and the citation repairs, 08-31) left
> open questions. Pick the TOP TWO by what would most change a credence, and
> dig them: web searches in the foreground, credence-disciplined entries
> (established/contested/fringe/speculation) appended via
> `node public/framework/ext/Research/entry.mjs` to the right topic's
> `log.jsonl`, both-sides documentation, every entry closing with "what would
> settle it". ~8-15 new entries total across the two questions -- depth over
> count. Then: update the affected topic pages to surface the new findings,
> and append a short round-4 addendum to the capstone page (what moved, what
> didn't, one honest line on whether the cheap-permitted-unperformed thesis
> survived the round).
>
> URL DISCIPLINE (the audit's lesson): every citation url is the SPECIFIC
> article you actually read, never a domain root or a search page; ~3%
> invention rate was found last round -- verify each url returns the content
> you cite before appending.
>
> VERIFY: --check clean on touched logs, pages render on the private port
> (torn down), zero console errors. Report: the two questions chosen + why,
> entries appended per topic, what moved (credence up/down, named), the
> capstone addendum's verdict line.

## Questions chosen

Five open in `theories/log.jsonl` (kind:question, "ROUND 4 Q1"-"Q5"). Q4 (the
audit) is already done via research-audit + research-repairs. Picking the top
two by how much they could move a *load-bearing* claim already on the
capstone page:

- **Q1** -- "why has nobody pointed an instrument at the object?" directly
  tests the capstone's own central thesis (section 2, the one-measurement
  problem: "cheap, permitted and unperformed"). If funding/permit attempts
  turn out to have been made and specifically refused, or the access is not
  as cheap as claimed, the thesis itself moves.
- **Q3** -- "is the recency signature a signature, or is it what every
  tradition looks like?" directly tests section 1's invented-tradition
  pattern (four for four, "the paper trail alone is the tell"). Finding
  genuinely ancient traditions with the same documentation gap would
  downgrade that claim from a clean signature to a base-rate artifact.

Q2 needs a pre-registered content-analysis study that cannot be run by
digging (no test to find, only literature about whether one exists). Q5 is
about internal vocabulary consistency, not a specific external fact -- lower
credence-swing potential than Q1/Q3.

## Scope / fences

- Appends only, foreground WebSearch/WebFetch, `entry.mjs` writer only (no
  hand-written JSON lines).
- Entries land in whichever topic log already holds the underlying subject:
  `stone/log.jsonl` (Serapeum/Giza coffer access), `disclosure/log.jsonl`
  (Nimitz data release), `theories/log.jsonl` (YD replication funding, the Q3
  base-rate findings, the two round-4 `finding`/`opinion` wrap entries).
- Page edits: only the topic pages that already surface the relevant finding,
  plus the synthesis page's round-4 addendum.
- Every url is the specific page fetched and re-verified, never a root/search
  page.
