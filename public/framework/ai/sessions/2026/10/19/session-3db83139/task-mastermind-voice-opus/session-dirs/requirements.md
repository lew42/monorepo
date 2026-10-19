# Voice sessions: one dated folder each (Servex)

Load the `minion` skill first. Parent: task-mastermind-voice-opus, task dir public/framework/ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/

## The owner's words (via the voice assistant, cleaned)
> Why is this voice session saved flat at public/ai/v-timqv56.jsonl instead of a dated session folder? Even for a voice session there should be folder structure. The right shape is ai/sessions/<year>/<month>/<day>/<session name>/session.jsonl, so every session has its own directory for any extra data it needs to save. Dumping every voice session flat in public/ai/ means a thousand files there soon.

(The owner's suggestion, "seems like the right shape to me", not yet a hard rule.)

## Cause (found)
`Servex/agents/Sessions.js` `create()` line ~695: ``const file = `${home}ai/${id}.jsonl` ``; home "/" gives `public/ai/v-*.jsonl`. `summary_file()` derives `<file>.summary.json` from it.

## Deliverables
1. New sessions write to `/framework/ai/sessions/<YYYY>/<MM>/<DD>/<id>/session.jsonl` (local date), the summary beside it (`session.summary.json` or `summary.json`; pick one, say why). `home` keeps its meaning (where the owner stood, or the card).
2. Find every other reader/writer that assumes `<home>ai/<id>.jsonl` or globs `ai/v-*.jsonl` (Servex, Server, public/framework/ux/Dictate, ext/Session, the ai/sessions grid) and make it work with both old and new paths. Old sessions in sessions.json keep their stored `file` (never move them by hand).
3. The new folder is reachable on the site (the dated day page lists it, or a link from ux/Dictate's readme). A page.js per session is not required.
4. `node --test Servex/agents/layers.test.mjs` (and any Sessions test) green; update the `Servex/doc/` and ux/Dictate readme lines that name the old path.
5. Optional, separate commit: a dry-run-first `git mv` script for the existing flat files (manifest, --undo). Do NOT run it for real; v-timqv56 is live.

## Fence
Work in a worktree: `node Server/worktree-up.mjs voice-session-dirs`. Files: Servex/agents/Sessions.js and whatever deliverable 2 finds. Do NOT restart Servex and do NOT merge: a restart drops the owner's live voice call. Commit in the worktree, then report the branch, the diff stat and the test output to your parent and stop. Every spawn sets windowsHide: true.

## Budget
Sonnet, about 45 minutes.
