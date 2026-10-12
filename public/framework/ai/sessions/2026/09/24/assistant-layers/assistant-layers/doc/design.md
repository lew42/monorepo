# Assistant layers: the design

You open the AI dashboard and start talking. Whatever card you speak on, **that card's own
assistant** answers within seconds and turns your words into something on screen. The moment
something needs doing, it hands the work to **that card's manager**, which plans it and starts
minions. Two agents watch across all cards: the **master assistant** points things out, and the
**Servex mastermind** keeps the whole system coherent.

## Two agents per card

| agent | id | model | starts with | what it does |
|---|---|---|---|---|
| Card assistant | `assistant-<card>` | Sonnet, low effort | the card's log, plus a one-screen brief | The card's chat. Turns a prompt into UI straight away: names things, makes sub-cards, changes a card's type, answers. The second something needs doing, it writes a request, question or task into the card (with the right part of your words) and hands it to the manager. |
| Card manager | `manager-<card>` | Opus, medium effort | the card's log and the request | Like a small mastermind for one card. Looks at the scope, splits it, starts minions with the right model and fence, and reports on the card. One good agent, not a council, unless the work is architecture and important. |

The manager's session is **recycled for the card's whole life**: every earlier question, every
piece of work and every bit of context on that card is there when the next request arrives.
That is its *session*, not a running process. Between requests the process is stopped and only
the session id is kept; the next message resumes it by that id.

## Idle agents cost memory, so they are stopped

Every running agent holds a `claude` process of about 250 MB, even while it waits. On 2026-09-24
finished agents that nobody stopped took the machine down to 1.5 GB of free memory. So:

- **Stop when idle, resume on the next message.** Card assistants and managers are stopped after
  10 minutes of quiet, and the master assistant and `mastermind-servex` after 15. A message to a
  stopped agent resumes its session under the same id, then delivers.
- **The session id is recorded when the agent starts**, not after its first turn, so a restart
  can always resume it.
- **The reaper**: every minute, a minion, helper or fork that has finished its work (its parent has
  already been woken) and has been idle for 3 minutes is stopped.
- **One gate for starting anything**: `spawn_agent` asks a list of checks before a process starts.
  One says the machine is hot (servex-monitor's). One is memory: nothing starts while less than
  4 GB is free. One is a ceiling of 30 live processes, which a child of a live parent skips, so
  parents waiting on their children can never block them. A refused start waits in a queue and
  starts when every check passes. Card assistants skip the queue, because you are waiting on them.

## Two agents across all cards

| agent | id | model | what it does |
|---|---|---|---|
| Master assistant | `master-assistant` | Sonnet, medium effort | Hears every card's prompts and every landing, with a little context about everything. Writes a short recommendation or a small fix into a card when two cards overlap or something failed. Launches nothing. |
| Servex mastermind | `mastermind-servex` | Opus, medium effort | The systems architect. Keeps the claims list honest, audits how the agents are working, and settles anything that crosses cards. It launches nothing. |

Servex keeps both running. It starts the master assistant at boot and resumes the existing
`mastermind-servex` session under the same id. Card agents start when you first speak on a card.

## Starting work, exactly once

- **Only a card's assistant starts that card's manager**, and there is only one id per card, so a
  card can never have two managers.
- **A manager starts minions**, never another manager or task mastermind.
- **Two cards asking for the same thing**: when a manager starts, it claims its topic on the
  claims list. If another manager already holds that topic, the claim is refused, and the manager
  asks the Servex mastermind, which decides who does it.

## Who may message whom

Every message carries `from`. For an agent Servex runs, `from` is **stamped by Servex** from the
agent's own connection, so no agent can pretend to be another or to be you. A message from outside
Servex (a VS Code tab, the dashboard) is from you, the owner.

| from | may message |
|---|---|
| the owner (a tab, the dashboard) | anyone |
| a card assistant | its own card's manager, the master assistant, the Servex mastermind |
| a card manager | its own card's assistant, its own minions, the Servex mastermind |
| the master assistant | any card assistant, the Servex mastermind |
| the Servex mastermind | anyone Servex runs |
| a minion | its parent only (the automatic wake) |
| anyone | whoever messaged them in the last 30 minutes, so a reply always goes back |

Nothing goes sideways: two managers never message each other; they go through the Servex
mastermind. This matches [the concurrency design](/framework/ai/2026-09-24/concurrency/).
`send_to_agent` checks the table. A refused message is not delivered, the sender is told why in
one sentence, and the refusal is logged. The live table and the last refusals are at `/api/policy`.

## What each agent knows, and how much

Each card shows its agents: how many tokens each one's context holds, and what percentage of its
window that is, with two buttons.

- **Compact**: the agent writes the important details into the card's log as one `summary` line,
  then restarts from that line plus the card's log. Our own compaction, so what matters is logged
  where it belongs instead of vanishing into an automatic summary.
- **Recycle**: the agent restarts fresh from the card's log alone.

## Roles, in one table, for any provider

A role is four things: its **skill** (the instructions), its **tier** (how fast and how deep), its
**effort**, and its **tools and permissions**. A tier maps to a model id in exactly one place
(`Servex/agents/tiers.js`), so moving a tier to another provider, such as OpenRouter, is a one-line change.

| tier | model today | used by |
|---|---|---|
| fast | Sonnet | card assistants, the master assistant, minions that build |
| manager | Opus | card managers, task masterminds |
| architect | Opus | the Servex mastermind |
| scan | Haiku | minions that only scan |

| role | skill | tier | effort | tools |
|---|---|---|---|---|
| card assistant | `card-assistant.md` | fast | low | card tools only |
| master assistant | `master-assistant.md` | fast | medium | card_reply, send_to_agent, list_claims |
| card manager | `sub-mastermind` | manager | medium | everything, repo in a worktree |
| Servex mastermind | `mastermind-servex.md` | architect | medium | read-only repo, claims, messages |
| minion | `minion` | fast | high | everything, inside its fence |

## The one-screen brief

Every agent starts with at most one screen of global context, built by code, not by a model: the
claims list, the agents running right now, and today's focus line (the last `focus` the Servex
mastermind wrote). That is how a card assistant knows "someone is already building that" without
reading anything.

## Keeping every turn short

- A card assistant makes three to five tool calls and stops. It has card tools, no repo tools.
- The master assistant stays silent unless it has something worth one or two sentences.
- Managers and the Servex mastermind only read, decide and send. A slow read or a side decision
  goes to `fork_self` or a node job, so their own session is always free to answer.

## Decisions, with the alternative

- **A manager per card, recycled** (the owner, 2026-09-24). Before: one Servex mastermind was the
  only launcher and started a fresh task mastermind per request. Replaced: a fresh mastermind per
  request loses everything the card already knows, and one global launcher becomes a queue.
- **One assistant per card, not one for everything.** Alternative: one fast assistant with a
  per-card memory. Rejected: its context grows with every card and it slows down.
- **The card assistant may act on its card** (sub-cards, type changes, names), but not on the repo.
  Alternative: give it file tools for scaffolding. Held back: repo writes belong to a manager's
  minions, in a worktree, where they can be reviewed.
- **Identity is stamped from the connection, not typed by the model.** Alternative: trust `from`.
  Rejected: a model can type any name.
- **The master assistant listens to card events; it is not attached to cards**, so it never
  receives every card's whole log at once.
- **The architect is `mastermind-servex`, and it launches nothing** (the owner, 2026-09-24). It
  audits; managers do the launching for their own cards. Alternative: the architect as the single
  launcher, which was the first version of this design.
- **A kept session, never a kept process** (mastermind-servex, 2026-09-24). Alternative: keep
  card agents alive for the card's life. Rejected: 250 MB each.
- **Admit by free memory (4 GB) with a ceiling of 30**, children of live parents exempt from the
  ceiling (mastermind-servex, 2026-09-24: about 17 agents work at a normal moment on 32 GB).
  Alternative: a flat cap of 12 live processes. Rejected: it starves parents waiting on children.
- **Managers are Opus at medium effort.** Alternative: Sonnet, faster and cheaper. Opus medium is
  what task masterminds already run on, and the owner has said it works well.
