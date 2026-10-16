# AI Inbox: why 133 items say "waiting on you"

Asked by the owner by voice on 2026-10-16 (question 912a73f8). Counted with a node script that applies the list's own rule to the real files. Not estimated.

**Answer: about 1 of the 133 is a real open question. The rest are agents' reports, labelled "waiting on you" because the list counts every unopened `owner_note` card as waiting.**

- **Where the list comes from.** "Waiting on you" is `WaitingOnYou` (`core/Page/ext/Inbox/WaitingOnYou.js`), pinned at the top of the AI Inbox. A card lands in it when the card is open and any one of these is true:
  - it has an `owner_note`;
  - its status is `needs-you`;
  - its text says "for you" or "decision".
- **The 133 today:**

  | Kind | Count |
  |---|---|
  | `owner_note`, kind `decision` | 68 |
  | `owner_note`, kind `risk` | 11 |
  | `owner_note`, kind `needs-you` | 11 |
  | Status `needs-you`, no note | 41 |
  | Matched on the words | 2 |
  | Asks from `asks.jsonl` | 0 |

  78 of the 133 are from the last three days.
- **Who writes them.** Agents, through the Servex `owner_note` tool. The mastermind and sub-mastermind skills tell every mastermind: "tell the owner through owner_note, never chat". Its default kind, `decision`, means "a decision I made for you", which is an FYI. So landing reports such as "X decided 1 thing for you" pin as if they waited on you. The 41 `needs-you` cards include 7 page-down alerts from `Server/health.mjs` (health-watch).
- **Real asks are a different, smaller list.** Servex `/waiting` (`NeedsRule`, the "Needs you" tab) finds real open Decision and Question widgets, 37 of them. Of those, 11 are spend-gate pauses, which the system handles itself. Only 1 of the remaining ones sits on one of the 133 cards.
- **The one change.** `WaitingOnYou.waits()` should count an `owner_note` only when its kind is `needs-you`. Kinds `decision` and `risk` are FYIs: they belong in the normal feed, or in a separate "For you to read" list. The fix is one line, plus making the `owner_note` tool's description say that `decision` means FYI. The alternative is to have the list use `NeedsRule`, so that it and the "Needs you" tab are one list (law 6: one of everything). That is the bigger fix.
