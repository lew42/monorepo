# Minion brief: the AI 2 card's own chat becomes the one chat

Load the `minion` skill first, then `code` and `css`. Your parent is **task-mastermind-one-dictation**; its task dir is `public/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/`. Read its `owner-words.md` and `requirements.md` first.

## The owner's words (2026-09-30)
"this UI is so much different than what it was before, and it's not really what I asked for... I think the framework... UX dictate is the spot it currently lives. Maybe this is the same UI the Dictates overview tab."
"the chat bubbles before were actually pretty good. These chat bubbles are... There's like an orange border around some of them."
Law 6: "One of everything; don't repeat yourself." Every chat sidebar gets the same UX, the full-height desktop sidebar and the mobile sheet alike: update one and all of them update.
The card page has "a card-specific right sidebar with a 'talk into this card' text area" (a third chat), and "you can't tell it belongs to the card."

## Before you start
`ux/Dictate/chat.js` exists now (minion-chat's work, in this worktree): `chat(el, {path, card, placeholder})` draws the one chat, on the global fast/smart session, and every mount redraws the session's history. The ✦ sheet and the ☰ drawer's AI tab already use it. Read it, and don't change its API: send a note to your parent if it needs a change.

## Build (worktree `C:\Code\lew42\worktrees\one-dictation`)
1. **Find every chat an AI 2 card page draws for itself**: `ai2/card.js` `content()` (`chat_v1()` → `chat()` + `composer()` in `.ai2-foot`), `ai2/page.js` around line 1060 (`foot()`, the Live card's "Assistant: ask it about what is running"), and anything else that says "talk into this card". Shoot a card page at 1920 and 400 to see which of them the owner actually sees today: `http://monorepo.localhost/framework/ai2/2026/09/30/now/` and `/framework/ai2/2026/09/24/ai-dashboard/ui-doesn-t-match-what-was-asked-should-l/`.
2. **Each of those becomes a `chat(el, {path, card})` mount**, the same component, sized by its box: in the card's own sidebar column on desktop, at that column's full height. Keep the old path reachable behind the existing `chat_v1()` switch (or a named v1), but not as the default. The card chat must read as the card's own: it sits in the card's column, and its head names the card.
3. **The bubbles:** make them look like the [Dictate Overview](/framework/ux/Dictate/)'s, and the earlier ones (`git show a7050005^1:public/framework/ext/Chat/Chat.css`, and `ext/Chat` before it). Find what paints the orange border on some bubbles, and remove it or make it quiet. My suspects: `.ux-dictate-widget-bubble-assistant { box-shadow: inset 0 0 0 1px var(--prime) }` in `ux/Dictate/Widget.css`, and `.chatbox-sec-open-able:hover/.open` in `ext/Chat/Chat.css`. Prove which one it is with a shot.
4. The font is Montserrat on the card chat (computed `font-family`).

## Prove it
Headless Playwright only (a scratchpad script named `od-card-probe.mjs`). Never drive the owner's tabs, and never `say()` into a live session. Seed `sessionStorage["lew42-voice-session"]` with `{"session":"v-gck9buj","file":"/framework/ai/2026/09/30/now/ai/v-gck9buj.jsonl","card":"2026/09/30/now"}`. The file isn't in git, so copy it into the worktree at the same path, and never commit the copy. Take before and after shots of both card pages at 400, 1920 and 3440×1440, with the bubbles visible. Save them in your task dir.

## Fence
`ai2/card.js`, `ai2/page.js`, `ai2/ai2.css` (removals and the chat column only), `ux/Dictate/Widget.css`, `ext/Chat/Chat.css` (the orange border only), and your task dir. Other tasks edit ai2/ too: run `git merge michael/dev` in the worktree before you start, keep the diff small, and commit by exact path (another minion shares this worktree).

## Land
**Don't merge.** End your turn with the shots listed in your task.jsonl, plus one line per item.

