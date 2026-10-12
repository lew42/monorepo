# prompt-relay: the owner's words only

## The ask (owner, 2026-10-03)
> we were working on a prompt refinement system ... the fast assistant's supposed to do the prompt refinement ... I'm not sure where it's at.

## Found
The hook (`.claude/hooks/prompt-relay.mjs`) logs every user turn in the owner's VS Code tab as a `Prompt` on the session page and wakes Echo to refine it. A subagent's hand-back (`<agent-message …>`) and a background notice (`<task-notification>`) arrive as user turns too, so they were logged as the owner's words and refined at about $0.35 each, and the owner's real prompt waited behind them.

## Do
Skip turns that open with a harness tag (`<agent-message`, `<task-notification`, `<system-reminder`) in step 1 of the hook. Nothing else changes.

Fence: `.claude/hooks/prompt-relay.mjs`, this dir.
