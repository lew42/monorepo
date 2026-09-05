# Minion rules — every brief in this program assumes you read this first

Three laws (CLAUDE.md): **less is more** (as simple as possible, fastest working version first, show don't tell) · **clarity is the one exception** · **prioritize** (most important first, everything reads as a quick scan). CLAUDE.md outranks this file and every brief.

## Two laws from the owner, 2026-09-04 — they outrank the length budget in your brief
- **Clear beats brief, by far.** Explain like the reader is five. Start with the basics in full, plain sentences; say the one thing a page is for at its top; a demo or a snippet must make its takeaway obvious. Detail that can move somewhere better moves there with a link. Clipped fragments, undefined words and jargon standing in for an explanation are defects.
- **Resolve, don't park.** A problem you find is yours to fix the best way you can now, kept easy to change, with its caveat written beside it. "Left open" needs a reason a reader accepts (an owner's decision, a fence, a missing fact) — never "out of scope".

## Before the first edit
- Run the `new-task` skill. Your task dir already exists at `public/framework/ai/2026-09-04/<your-slug>/` with this brief beside it; write `task.jsonl` there (group `platform`), append the day line to `public/framework/ai/2026-09-04/day.jsonl`. Timestamps come from `date -Iseconds`, called right before each append, never typed from memory.
- Findings go in your `task.jsonl` as `log` lines. Never a `findings.md`.

## Never
- **Never kill, restart or start the dev server on port 80.** None is running today; the owner starts it in their own terminal. If you need a server to verify a page, start a PRIVATE one from the repo root — `PORT=8092 node server.js` (pick a free port: `netstat -ano | grep LISTENING | grep -E ":80(8|9)[0-9]\s"` lists the taken ones) — and kill that pid when you land.
- **Never drive the owner's browser tabs.** Headless Playwright only (`file:///C:/...` import form).
- **Never `git stash`, `git checkout --`, `git reset`, commit or push.** The tree is shared with other agents in flight. Diff, don't stash.
- **Never `find /`** or any search outside the repo — scope Glob/rg to the repo. Two orphaned root scans burned a core for hours each.
- **Never spawn background sub-agents** to search or dig for you — their completion routes to the main session, never to you, and you park forever. Dig in the foreground with your own WebSearch/WebFetch.
- **Never write a secret anywhere.** If you meet an API key or bearer token (there is a fal.ai one in a neighbouring project's config), do not copy it into any file, log or page.
- Never write in another agent's dir. Your fences are in your brief.

## Waiting
- If you must wait on something, loop in chunks under the Bash tool's 120 s default (`timeout: 600000` on the call, or `Start-Sleep 15` in a loop) — a wait that exceeds the timeout backgrounds and ENDS your turn.

## Landing
- One line in the misled skill's `improvements.md` when a skill let you down (the `skill-improvement` skill; thirty seconds). Mandatory when it happened, forbidden when it did not.
- `finish-task` skill to land: landing line with `outcome`, every deliverable in `links`, day log closed.
- Report tokens honestly; "none found" is a valid, complete result.
