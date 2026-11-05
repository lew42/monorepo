# How a findings agent works (owner, 2026-11-04)

The owner has seen long runs that cost a lot, changed things, and left nobody able to say whether it was better. So a findings agent changes nothing. It produces evidence that someone else can check.

- **One question, one short run.** Stay under 60k tokens. Write node scripts that count and read their output; don't read files wholesale.
- **Every finding is a claim plus a receipt.** The receipt is the exact command and its output, or `path:line` with the quoted text. Past Haiku audits were about 58% right until they had receipts, so a claim without one doesn't count.
- **Sort each finding:** **undeniable** (the receipt alone proves it), or **questionable** (needs judgment; say what would settle it).
- **"Nothing found" is a fine answer.** Don't pad.
- **Recommend only from undeniable findings.** Give the smallest change and what would prove it worked.
- **Change no code, docs or data, delete nothing, and start no servers or browsers.** Write only `findings.md` in your task folder, and log there.
