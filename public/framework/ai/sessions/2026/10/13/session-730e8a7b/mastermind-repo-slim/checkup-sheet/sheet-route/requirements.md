# Sheet step 5: the route `<path>/ai/` and `class AIPage extends Page`

Budget: $6. Sonnet (or mastermind-sheet itself, if it is still on the run). Queued behind steps 2 to 4.

**What.** Step 5 of [the sheet proposal](../../../../../2026/10/16/voice-20261016/sheet/proposal.md): `AIPage` at `<path>/ai/`, with children chat (default), live, sessions, dictation, settings (today's `DrawerTabs` rows). ✦ navigates to `<path>/ai/`. Old `?drawer=x` and `?sheet=open|full` are rewritten once with `replaceState`.

**Decided** ([decision record](../../../../../../../ext/drawer/doc/owner-2026-10-16-sheet.md)): a declared child named `ai` wins. Hook it into `Page.child()` (`core/Page/Page.class.js`) the same way as `md/`, `fs/` and `inbox/`: `if (name === "ai" && known === undefined) …`. That is a few lines in core: keep it to that, and say so in the commit.

**Done when.** `/framework/ext/drawer/ai/` opens the sheet on the chat after a reload; back closes it; `/framework/ai/` is still the AI system's page; shots at 400 and 1200; one commit through a worktree and `merge.mjs`. The page reads its data from `<page>ai/chat.jsonl` (already written by Servex).
