# The OpenRouter gap: the log is ABOVE the account, not below (found 2026-10-12)

**Finding:** no calls are missing. The handover feared the account showed more dollars than `openrouter.jsonl` explains. Measured today it is the other way: the account has billed **$64.42** since the key began, the ledger records **$110.08**, so the ledger is **$45.66 too high**. Unattributed OpenRouter dollars: **$0**.

Run it yourself: `node Server/openrouter-gap.mjs` (reads the ledger and the key's free `/key` endpoint, makes no model call).

## Why the ledger is too high

Each ledger line has a `source`:

| source | lines | dollars | meaning |
|---|---|---|---|
| `generation` | 134 | $12.15 | OpenRouter's own per-call cost: exact |
| `key_diff` | 241 priced (613 total) | $97.72 | the key's total before and after an agent's turn: an estimate |
| `reconcile` | 2 | $0.22 | a correction line |

A `key_diff` line charges an agent the *whole* change in the key's total during its turn. When two agents run at once, each is charged the same change. 54 groups of lines carry an identical dollar amount; counting each once removes **$18.54**. The two biggest culprits: `mastermind-page-2` and `mastermind-ai-2` both show $17.22 (one real charge, booked twice), and 124 `echo-*` lines add up to $52.88 of overlapping estimates. By model, `google/gemini-3.8-flash` is $97.92 of the $110.08.

By day the ledger shows 10-05 at $42.46 and 10-02 at $35.97 as the heavy days. The account's own per-day figures need a management key (`/activity` answers 403 for this key), so a day-by-day match against the account is not possible; only the lifetime total can be compared.

## What changed

- The Sessions page line (`AISession/AISessionsPage.js`) now says "unattributed OpenRouter $X" when the account is above the log, and "$0.00 ... the log is $N above the account" otherwise, so the gap is stated, not hidden.
- Not changed (a later fix, in the OpenRouter provider): `key_diff` should split a window's delta across the agents that overlapped it, or only use `generation` lines. Until then treat `key_diff` dollars as an upper bound and the account total as the truth.
