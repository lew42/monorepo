# Cheaper models, round 2: the rest of the most-asked AI cluster

**The asks:** [ai/doc/asks.md](/framework/ai/doc/asks.md) **models-openrouter-cost** (#1, asked 34x; [openrouter-gap](../../session-fb77ab71/openrouter-gap/STATE.md) closed the accounting gap and ran a first $0.03 test) and [ux/Dictate/doc/asks.md](/framework/ux/Dictate/doc/asks.md) **voice-model-policy** (3x: the voice assistants must not run on Anthropic models; best non-Anthropic model for the smart one).

## Done when
- [ ] Extend `quick.mjs` into a real known-answer suite: 20+ tasks in the shapes our minions actually do (a code edit with a test, readme check, card classification, transcript clean, a refine step), each with a checkable answer; 5 models incl. 2 Claude for reference, two thinking levels. Under $5 total. Results table on `/framework/ai/models` with pass rate, time and real cost per task.
- [ ] From the table, a one-line recommendation per job shape (which model for which role) in `ai/doc/models.md`, and the voice fast/smart assistants switched to the best non-Anthropic model that passes, with a fallback if OpenRouter is down.
- [ ] The rest of the cluster's "Open" points built or written up with the real blocker; asks entries updated with commits.

Sonnet 5.5, medium. Respect Servex's OpenRouter spend guard. Worktree; one batched Servex restart proven on a private port if needed. Commit each step; merge. `STATE.md`; land with `finish-task`.
