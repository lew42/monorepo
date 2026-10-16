# AI cleanup items

Things the owner noticed that are worth fixing, but not urgent. Do each one with a script (`git mv`, a dry run first, a manifest), never by deleting.

## Near-duplicate task folders (the owner, by voice, 2026-10-16)
- [voice-20261015/ai-system](../sessions/2026/10/15/voice-20261015/ai-system/) and [voice-20261015/ai-systems](../sessions/2026/10/15/voice-20261015/ai-systems/).
- [voice-opus/past-work-audit](../sessions/2026/10/15/voice-opus/past-work-audit/) and [voice-opus/past-work-audits](../sessions/2026/10/15/voice-opus/past-work-audits/).

The fix: decide which of each pair is the real one, nest or link the other inside it, and stop new ones forming. The new-task step could warn when a slug is one letter off a sibling.

## Session folder names are not clickable (the owner, by voice, 2026-10-16)
On the site, a session's folder name shows as plain text. It should be a link to the session's page, through the mention system ([ext/Mention](/framework/ext/Mention/)).
