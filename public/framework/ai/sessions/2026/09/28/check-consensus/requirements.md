# Step C: a cheap sanity check by default, and consensus when it's unclear

Design: [/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md](/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md) (④ and ⑤). Owner's words: `2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words.md`. Start after the fresh-eyes review task lands; reuse its spawn code in `Server/review.mjs`, and do not fork it.

1. **`check(claim, context)`**, with a Servex tool `check` and a node module: 2 fresh checkers from different families where possible (Haiku and Sonnet today). Each gets only the claim, the owner's words and the files it names, and answers: could this be wrong, what are the alternatives, agree or doubt, in 5 lines at most. It writes one `{"check":{claim, verdicts, cost}}` line on the card, which shows as a ✓✓ or ✓? chip.
2. **When it runs by itself:** after a manager or task mastermind writes a decision line, and on a landing outcome. Never on the fast assistant's quick replies. One line in the sub-mastermind skill says so.
3. **`consensus(question, options)`:** 5 models at 3 price levels vote, and a tally shows on the card. Before harness step 2 lands, use the Claude tiers; after it, OpenRouter models, chosen in one config table with their prices.
4. **Cost:** a check under $0.01 and consensus under $0.05, measured, in the card's cost line.
5. **Docs:** `Server/doc/check.md`, one screen.

**Proof:** check 5 real decisions from today's task logs. Show the verdicts, and name at least one the checkers doubted correctly, or say plainly that none was doubted. Run one consensus on a real open question, and give the cost of each.
