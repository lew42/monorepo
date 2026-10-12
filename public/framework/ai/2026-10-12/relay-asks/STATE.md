# relay-asks: state (2026-10-12)

Ask: [mastermind-assistant-relay](/framework/ai/doc/asks.md), 21x. Three open points, each checked against the code.

| Point | Verdict | Proof |
|---|---|---|
| Per-directory / per-page mastermind | **Built.** Not convention: a mechanism. | `ask_directory` tool, `Servex/agents/directory.js` (wired at `Servex/Servex.js:895`, doc `Servex/agents/doc/directory.md`); page pairs in `Servex/agents/Layers.js:42` (two agents per page, ASSISTANT_TEXT `:77`). |
| Review diffs before spawning reviewers | **Built at the gate, convention before it.** | `Server/merge.mjs:12` refuses a branch with no review newer than its head; `Server/review.mjs` reads brief + diff first. The "read the minion's diff yourself first" step is `mastermind` skill §76 (convention, and cheaper than a mechanism). |
| An assistant in front of every mastermind relaying every prompt | **Partly built; the gap is real.** | Page/card pairs and the drawer send go through the assistant (`Layers.js:590`), and `Servex/agents/policy.js:78` limits who may message whom. Not enforced: the owner's VS Code tabs and `send_to_agent` from a tab reach a mastermind directly. |

## Why the third is not built tonight
It needs a Servex change (route owner-to-mastermind messages through the card's page-assistant in `policy.js` / `Layers.js`), and a Servex change waits for one batched restart proven on a private port. Doing that blind overnight risks locking the owner out of a mastermind.

**Smallest next step:** in `policy.js` `message()`, when `from` is the owner/external and `to` is a task-mastermind with a card, log a `relay-bypass` line (no refusal) so the count of bypasses is measured first; then decide whether to enforce. Add it to the next batched Servex restart.

No code changed; nothing destructive.
