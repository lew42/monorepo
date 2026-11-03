# Voice sessions keep working when Claude logs out

## The owner, 2026-10-05
> the smart mastermind kept saying failure to log in ... I'm not sure why Claude kicked us out ... we don't want roadblocks. Like our whole system shuts down if the authentication fails, right? So, I mean, I guess OpenRouter could take over certain things

## Facts
- Task dictate-without-claude (2026-10-04) made session-fast/session-smart fall back to OpenRouter when a Claude call is **refused for usage limits** (it reads the agent's `last_error`).
- A Claude **login/auth failure** (expired token, "failed to log in", 401) is a different error and does NOT trigger that fallback today.

## Do
1. Treat an auth failure exactly like a usage refusal: the voice session's assistants switch to the OpenRouter pair at once, and the owner sees one short line ("Claude logged out, answering on OpenRouter").
2. Post one card on the AI inbox when Claude auth fails (once, not per call), with the fix in one line (re-login).
3. Prove with a stubbed auth error. Worktree → merge.mjs; restart Servex; commit any files merge.mjs leaves in the main tree.

Budget: $2. Sonnet, ONE agent, short session.
