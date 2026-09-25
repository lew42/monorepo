# Assistant layers: which assistants Servex runs, what each knows, how they talk

Task mastermind: `task-mastermind-assistant-layers`. Siblings: `task-mastermind-concurrency`
(fork_self, resume/fork in spawn_agent, surviving restarts) and `task-mastermind-card-folders`
(per-card storage, agents attached to a card, handoff item 7).

## The owner's words (dictated, lightly cleaned)

"Whenever I go to the AI dashboard, I want to just start talking and have it figure out the right way to handle everything. I don't know if the same assistant should do everything for all the cards. Maybe we want a fresh assistant for a fresh card, so the assistant's memory isn't clouded. The only problem is that then we don't have a cross-topic assistant. Maybe the master assistant gets messages from all cards simultaneously and is more passive, making recommendations in the background, maybe helping to fix errors. I don't know if it should launch anything. Launching power means we don't want two masterminds launching the same things, so that needs to be coordinated, so we know who's doing what. But if one of the masterminds has capacity, or could spawn a mastermind of its own to research and fix something, we want our masterminds to be capable; coordinating the effort is what matters.
I'd like each card to have its own fast assistant instance. Maybe it can read some global context in a minimal sense, so it has some updates. We don't want one fast assistant managing all the cards, because it gets context bloat and does way too much. We want each assistant very quick and minimal and not distracted. Each one could have its own session id, and each should be able to talk to a persistent mastermind, like the Servex mastermind: a higher-level systems architect auditing all the processes. And maybe a master assistant, less of a mastermind and more of a cross-card orchestrator, also watching things and figuring out what to do. If there's a mastermind, a fast assistant and a master assistant, they need to talk to each other. If Servex starts all three by default and we get a solid system where they communicate effectively, they need to use their own identifier when talking, so it's clear whether it's me or one of them, and who. And they'd send messages back to the proper session. It's really important for them to keep their workload down so they can respond quickly. They should have the general context preloaded, but they shouldn't do massive reads and writes or architectural deep thinking themselves. They should keep their workload to a minimum and offload those things to masterminds."

## Deliverables (the structure to build)

1. **A fast assistant per card**: `assistant-<card>`, started the first time the owner speaks on a card. It starts with the card's own log plus a global brief of at most one screen. It stops after 30 minutes of quiet and is resumed by session id. It never reads files or builds: it answers, cards, and hands off.
2. **One master assistant**, cross-card and passive. It hears every card's owner prompts and every landing, writes recommendations and small fixes into the relevant card, and messages the mastermind. It has no launching power.
3. **One persistent mastermind**, `mastermind-servex`. It is the only agent that starts task masterminds. A claims list in Servex records which task mastermind owns which card or topic. Task masterminds may start minions, never other task masterminds.
4. **Messages carry `from`**, and a reply goes back to that id. Who may message whom is enforced in `send_to_agent` and visible.
5. **All three start with Servex by default.** Each keeps its own turn short and offloads slow work.

First deliverable: a one-screen design page with a picture. Then build, then prove it end to end:
speak on two cards → two separate assistants answer; the master notes something across both; a request for work reaches the mastermind, and exactly one task mastermind starts.

## Fence (to be agreed with the siblings; see task.jsonl decisions)

- Design page: `public/framework/ai/2026-09-24/assistant-layers/`, plus one `children:` line in the day's `page.js`.
- Code: to be settled with concurrency and card-folders before anything is built.
