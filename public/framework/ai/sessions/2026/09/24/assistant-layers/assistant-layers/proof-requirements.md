# Minion brief: wire the layers into Servex, and prove them end to end

Load the `minion` skill first, then the `code` skill.

## The owner's words

"Whenever I go to the AI dashboard, I want to just start talking and have it figure out the right way to handle everything. [...] I'd like each card to have its own fast assistant instance. [...] If Servex starts all three by default and we get a solid system where they communicate effectively, they need to use their own identifier when talking, so it's clear whether it's me or one of them, and who."

The acceptance test, from the task's brief: **speak on two cards → two separate assistants answer; the master assistant notes something across both; a request for work reaches a manager, exactly one starts, and a collision between two cards reaches mastermind-servex.**

Design: `C:/Code/lew42/monorepo/public/framework/ai/2026-09-24/assistant-layers/doc/design.md`.

## Where you work

Worktree `C:/Code/lew42/worktrees/assistant-layers`, branch `worktree/assistant-layers`. It already contains card-folders' `Servex/cards/` (with `cards.on`), concurrency's resume, fork and revive (commit ac8b1e25), `policy.js`, `Layers.js`, `Global.js`, `claims.js`, `brief.js` and `tiers.js`. Read `Layers.js` and `Global.js` first.

**Two pieces are not in yet**, and their siblings are still building them: concurrency's `?as=` caller stamping, spawn-time session ids and wake-on-send; and servex-monitor's `servex.checks`/`admit()` gate. So: without `?as=`, `ctx.caller` is null and the policy treats every tool call as the owner's. Record that the identity checks are PENDING, and do not fake it. Without `servex.checks`, broken case (c) (the cap queue) cannot run; call `global.admit(spec, free_mb)` directly to show the reasons, and mark the queue part PENDING. Everything else must run for real. I will rerun the pending parts after those merges. Never touch the main tree, and **never restart or stop the live Servex** (port 8090, and port 80 through the gate). Commit your own files only (`git add <files>`).

## Deliverables

1. **Wire into `Servex/Servex.js`**: after `this.cards` is built and the assistant and dispatcher are installed, add `this.layers = new this.constructor.Layers({ servex: this }).install();` and `this.global = new this.constructor.Global({ servex: this }).install();`, both skipped when `SERVEX_NO_LAYERS` is set, with `Servex.Layers = Layers; Servex.Global = Global;` beside the other statics. Keep the diff to those lines and the two imports.
2. **`roles.js`**: add a `tier` field to every row (`fast`, `manager`, `architect`, `scan`), import `model` from `./tiers.js`, and make each row's model come from its tier. Add rows for `manager` (skill `sub-mastermind`, tier `manager`, effort medium, bypassPermissions) and `card-assistant` if the table has none. Run every test script in `Servex/agents/*.test.mjs` afterwards.
3. **The proof script, `Servex/agents/layers-proof.mjs`**. It boots a PRIVATE Servex from this worktree in a child process, with its own data and ports so nothing touches the live one: `LOCALAPPDATA=<a fresh dir under the session scratchpad>`, `SERVEX_PORT=8190`, `SERVEX_PROXY_PORT=8189`, `SERVEX_PROXY_INTERNAL=8188`, `SERVEX_NO_GATE=1`, `SERVEX_CARD_IDLE_MS=90000`, `SERVEX_MASTER_BATCH_MS=5000`. Read `Servex/index.js` and the constructor first, and confirm nothing else (whisper, a project auto-start) binds a port the live Servex holds; turn it off by env if it does. Then, against `http://127.0.0.1:8190`:
   1. `POST /card/create` two cards, titles "Proof header blue" and "Proof header red".
   2. On the first, `POST /card/append?id=<A>` `{"prompt": {"text": "Make the site header blue."}}`; on the second, `{"prompt": {"text": "Make the site header red."}}`.
   3. Wait (poll `GET /api/card-agents?card=` and `GET /agents` every 3 s, at most 120 s) until each card has its own assistant, with **different ids and different session ids**, and each card's log (`GET /card?id=`) has a reply `by` its own assistant.
   4. Wait up to 90 s for the master assistant to say something that names both cards: a `message` on either card `by: master-assistant`, or an `agent_msg` from `master-assistant` in `mastermind-servex`'s log. The two prompts contradict each other, which is exactly what its brief tells it to point out.
   5. On card A: `{"prompt": {"text": "Please look into how many lines Servex/agents/policy.js has, and tell me on this card. Nothing else."}}`. Wait until `manager-<A>` exists, and check that exactly ONE manager was spawned for card A (the registry has no `manager-<A>-2`).
   6. On card B, the same words. Its manager's `claim_topic` must collide with A's. Wait until mastermind-servex receives a message about it (its agent log's `agent_msg` lines), or the claim refusal appears in the `policy`/`servex` log. If the managers name the topic differently so nothing collides, record that as a finding. Do not force it.
   7. **Broken cases.** (a) Stop card B's assistant, delete its session file (the Claude session store under `%USERPROFILE%/.claude/projects/<the cwd's dashed name>/<session_id>.jsonl`; locate it, never guess), then speak on card B again: a fresh assistant must answer on the card, same id, and the failure must be logged, not thrown. (b) Two claims on one topic at the same moment: `Promise.all` of two `claim_topic` calls from two different managers (call `servex.claims.claim` through a tiny test route or the tool with two callers): exactly one wins. (c) Set `SERVEX_AGENT_CAP=3` in a second short boot (or call the check directly): show a spawn with no live parent queued with its reason, then started when a slot frees; and show that a child of a live, idle parent is admitted even at the ceiling. Set `SERVEX_MIN_FREE_MB` above the machine's free memory and show a spawn refused with the memory reason. (d) With `SERVEX_REAP_MS=20000`, a finished minion is stopped by the reaper.
   8. Print a one-screen summary: each check, pass or fail, and the evidence (ids, session ids, the line that proves it). Save the same as JSON in `public/framework/ai/2026-09-24/assistant-layers/proof.json`.
   9. Stop the private Servex and every agent it started (`POST`/tool `stop_agent` on each, then kill the child). Delete the two proof card folders it created in the worktree's `public/framework/ai/2026/…`. Nothing it made may be committed.
4. Run the proof. If a check fails because of a bug in `Layers.js`, `Global.js`, `policy.js` or the wiring, fix the smallest thing, say what in your report, and rerun, at most three runs. Spending is real (Opus managers): keep the work requests as small as written.

## Done means

Every check passes, or each failure is explained with evidence. `proof.json` is written. Committed: Servex.js wiring, roles.js, layers-proof.mjs, any fixes. Your last words: the commit hash, each check's pass or fail, and the total cost from the agents' cards. Never write the owner's name.
