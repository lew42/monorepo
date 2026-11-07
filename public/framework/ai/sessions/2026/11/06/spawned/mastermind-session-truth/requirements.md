# Session truth: make sessions, tasks and completion true, enforced by code

The brief is the spawn prompt from voice-app, line 1 of [session.jsonl](session.jsonl), plus [brief-common.md](brief-common.md). This page only points at it and at the sub-briefs.

## The seven asks, and where each went

- [x] **1. Auto-file asks:** every owner prompt on every channel is filed by code. Brief: [asks/requirements.md](asks/requirements.md). The owner later refined it via voice-app: use the `{refined:{sentences,sections}}` shape, and no new "ask" line. Proof: merge 6bce85be6, task t1.
- [x] **2. Log commits:** a post-commit hook writes a commit line to the session record, plus a `Session:` trailer. Brief: [commits/](commits/). Proof: task t2.
- [x] **3. Honest score:** a session with no tasks reads "needs review". Brief: [score-endings/requirements.md](score-endings/requirements.md). Proof: merge e153db27d, task t3.
- [ ] **4. No silent endings:** closing a session below 100% files a task waiting on the owner. Built (merge 2b33794ff, task t4) but switched off until the owner turns it on (task t12, waiting on the owner).
- [ ] **5. Fold the twins:** merge duplicate session records ([truth/requirements.md](truth/requirements.md)). The merge already ran at 20:00 (6d06f90e1); whether to keep or undo it waits on the owner (task t11).
- [x] **6. Truth page:** [/live/truth/](/live/truth/), the same brief. Proof: task t6.
- [x] **7. Close the two open tasks** with evidence: n3q1hy16 is closed; ey63ll66 (orphan processes not reaped) stays open with a log line saying why. Proof: task t7.

## Added by the owner later (via voice-app)

- [x] **Flat route:** remove the old bare-uuid session route and the text that points at it ([flat-route/requirements.md](flat-route/requirements.md)). Proof: merge 10093a23e.
- [x] **Children link:** [children-link/requirements.md](children-link/requirements.md). Proof: merge 16f525fdb.
- **The caution (about 22:57):** small additive steps only. A behavior change is proposed with a dry-run first.

## Added 2026-11-07 (via voice-app; pace 75%, keep each cheap)

- [x] **t13, shell commits:** a commit voice-app makes through the Servex shell lands on its session record (it has no `CLAUDE_CODE_SESSION_ID`). Proof: merge 397c6d72d; live after the next Servex restart.
- [x] **t14, calibration:** the first prompt-refinement calibration ([doc/prompt-refinement-and-tasks.md](/framework/ai/doc/prompt-refinement-and-tasks.md), "Next" step 1). 3–5 of the owner's prompts from the cloud transcript `cloud-8849dcc6.jsonl`, Haiku then Sonnet on the same fixed instructions, judged by Opus. For each prompt: the asks, questions, mentions and coverage against the 24 tasks of the voice-app record. Write no tasks into that record; suggestions go on a /live/ sub-page. A transcript reader named for Claude Code transcripts. About $5 in all. Done: [calibration/results.md](calibration/results.md), [/live/calibration/](/live/calibration/); reader: `Server/ClaudeCodeTranscript.mjs` (merge 3ac432ec3).

The tasks themselves (t1–t14) are in the session record. Read them with the item tool.
