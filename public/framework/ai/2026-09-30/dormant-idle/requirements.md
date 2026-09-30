# Dormant idle agents and the working cap: requirements

Budget: $15

The owner's ask (2026-09-30, about 18:10, top priority), measured by the VS Code tab: 20 Servex-agent claude.exe processes hold 7.9 GB (about 400 MB each, more for big contexts) with 4.3 GB free of 32; 11 are WORKING (the cap is 5) and 10 IDLE, each idle one still holding its whole process (mastermind-page 281k, voice-sessions-2 304k, review 210k, cards-and-logs 174k, icon-system 130k). Idle must cost about 0 MB.

## Deliverables
1. **Dormant idle agents.** Any agent (every role: mastermind, task-mastermind, minion, reviewer, clarity, assistant pairs) idle for more than about 3 minutes has its claude process EXIT. Servex keeps its row and session id, state `dormant`. It is RESUMED by session id (`claude --resume`, same cwd, same model and tools) the moment anything wakes it: a child finishing, a message, the heartbeat, a card reply. Nothing the agent could do before is lost; a dormant agent answers to its id exactly as an idle one did, just a few seconds later. This is the idle-lifecycle item from recursive-pairs and the generalisation of node-reliability-2's idle-release (382e918f, task masterminds waiting on a child only): read `Servex/agents/` for what that release does today and extend it, rather than a second mechanism.
2. **The working cap in code.** At most 5 agents WORKING at once (`SERVEX_WORKING_CAP`, default 5); a spawn above it is queued the way the memory gate queues today, and a minion's own children count against its parent's slot (a task mastermind with two working minions holds three of the five). The heartbeat and the dashboard show `working N/5`.
3. **Proof on a private Servex** (`proof.txt` + the numbers): start a private Servex on another port with 4 agents; let 3 go idle; after 3 minutes `tasklist` shows one claude process; message a dormant one and it answers within 15 s with its context intact (ask it something only its earlier turn knew); spawn 8 minions and see 5 working, 3 queued, then the queue drain as they finish. Memory before and after on the live machine once merged.
4. Tell mastermind-servex-8 (or the highest mastermind-servex-N) one line when merged; a Servex restart follows (do not restart yourself).

Fence: Servex/agents/, Servex/Heartbeat.js, Servex/doc/. Worktree required (take_worktree); commit early. MSYS_NO_PATHCONV=1 for merge.mjs from Bash. One minion at most at a time; memory is the problem you are fixing.

## Added by the VS Code tab (the owner, 2026-09-30 about 2:05 PM)

- **Automatic COMPACTION for growing agents:** when an agent's process passes about 500 MB, or its context passes a threshold (e.g. 200k), compact it automatically: through the SDK's compaction if it offers one, otherwise a checkpoint-and-restart (write its state, then resume fresh from it). Measure the memory before and after on one real agent.
