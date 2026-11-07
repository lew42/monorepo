# Session truth: make sessions, tasks and completion true, enforced by code

The brief is the spawn prompt from voice-app, line 1 of [session.jsonl](session.jsonl), plus [brief-common.md](brief-common.md). This page only points at it and at the sub-briefs.

## The seven asks, and where each went

1. **Auto-file asks:** every owner prompt on every channel is filed by code. Brief: [asks/requirements.md](asks/requirements.md). The owner later refined it via voice-app: use the `{refined:{sentences,sections}}` shape, and no new "ask" line.
2. **Log commits:** a post-commit hook writes a commit line to the session record, plus a `Session:` trailer. Brief: [commits/](commits/).
3. **Honest score:** a session with no tasks reads "needs review". Brief: [score-endings/requirements.md](score-endings/requirements.md).
4. **No silent endings:** a close under 100% files a task waiting on the owner. Same brief. Built, but off behind a switch (task t12).
5. **Fold the twins:** [truth/requirements.md](truth/requirements.md). The fold already ran at 20:00; keeping or undoing it waits on the owner (task t11).
6. **Truth page:** [/live/truth/](/live/truth/), the same brief.
7. **Close ey63ll66 and n3q1hy16** with evidence.

## Added by the owner later (via voice-app)

- **Flat route:** remove the old bare-uuid session route and the text that points at it ([flat-route/requirements.md](flat-route/requirements.md)).
- **Children link:** [children-link/requirements.md](children-link/requirements.md).
- **The caution (about 22:57):** small additive steps only. A behavior change is proposed with a dry-run first.

## Added 2026-11-07 (via voice-app; pace 75%, keep each cheap)

- **t13, shell commits:** a commit voice-app makes through the Servex shell lands on its session record (it has no `CLAUDE_CODE_SESSION_ID`). Small and tested. Branch `worktree/shell-commits`.
- **t14, calibration:** the first prompt-refinement calibration ([doc/prompt-refinement-and-tasks.md](/framework/ai/doc/prompt-refinement-and-tasks.md), "Next" step 1). 3–5 of the owner's prompts from the cloud transcript `cloud-8849dcc6.jsonl`, Haiku then Sonnet on the same fixed instructions, judged by Opus. For each prompt: the asks, questions, mentions and coverage against the 24 tasks of the voice-app record. Write no tasks into that record; suggestions go on a /live/ sub-page. A transcript reader named for Claude Code transcripts. About $5 in all. Files: [calibration/](calibration/).

The tasks themselves (t1–t14) are in the session record. Read them with the item tool.
