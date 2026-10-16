# Round 4: the session pipeline, built from the raw transcripts (now the priority)

Asked by the owner on 2026-10-16 (question a416d115), relayed by mastermind-voice-20261016. This replaces the earlier inventory framing. The owner has switched to text mode: work on your own, don't wait on him, and report short.

## The principle
The raw Claude SDK session transcripts (`C:\Users\mike\.claude\projects\*lew42*\*.jsonl`) are the most trustworthy and most complete source: the owner's prompts, the outcomes, and the real token and cost accounting. Everything else is a lossy copy of them: task.jsonl, the stale indexes, the spend files. Lean back on the raw data.

## The pipeline (pure Node; no AI in the structural pass). Build it as a class, e.g. a `SessionDigest`, in its proper home. Name and home it first (law 8).
1. Walk every raw transcript. Strip the tool calls, tool results and thinking blocks. The owner's hypothesis is that this takes most sessions from over 100k tokens to well under 100k. VERIFY it: report the token sizes before and after (the distribution, not one example).
2. Extract the facts: the owner's user prompts, the final outcome or result, and the exact input, output and cache token counts and cost per session, taken from the transcript's own `usage` fields. That is also the token-accounting audit the owner asked for and never saw confirmed. Reconcile against the existing spend files and AISessionIndex `usd`/`tree_usd`, and flag the discrepancies.
3. Write the condensed result back into the matching session folder, so old data lines up with new. Add files; never overwrite.
4. Tagging. First a cheap procedural pass: lowercased word-frequency weighting across sessions. Transcription mangles spellings, so exact matching is weak, and the reliable step is a cheap Haiku minion summarising each session in about 4 chunks, focused on references and tags. Keep it bounded and run it newest first. Write the tags into the empty `tags` field.
5. Sub-tags: within a system, tag the sub-problem. Example: the chat-bubble DEDUPLICATION bug, under the dictate/whisper-to-chat pipeline.

## CRUCIAL: repeated asks
When the same thing is asked many times across sessions (the owner's example: "deduplicate the chat bubbles — still showing duplicates", asked about a hundred times and never done), the pipeline must DETECT the repetition and ESCALATE it to top priority, never silently re-file it. Output: a ranked list of what was "asked N times, still open", with links to the source sessions.

## First deliverable, cheap and concrete
- Strip and measure the last few days of sessions, and confirm the token drop with numbers.
- The ranked repeated-asks list.
- The chat-bubble dedup bug's actual status: what was asked, what was tried (commits), whether it is fixed, and where the code is.
Then report short to mastermind-voice-20261016. Commit each working step. Haiku spend stays bounded (at most $2 for this first deliverable).
