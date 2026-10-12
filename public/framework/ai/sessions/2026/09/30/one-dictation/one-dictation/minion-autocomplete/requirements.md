# Minion brief: reference suggestions while typing in the chat composer

Load the `minion` skill first. Your parent is **task-mastermind-one-dictation**. Work only in your served worktree (your parent names it and its port in your first prompt). Low priority, so keep it cheap: land a minimal version and write down what's left.

## What it is
Today `ext/Mention` turns `@agent`, `#Page` and `/path` into icon links only AFTER the text is sent. The ask (vscode-mastermind, 2026-10-02) is for suggestions WHILE typing. When you type a trigger character (`@`, `#` or `/`) in the ONE chat composer, a strip of matching names appears. Picking one inserts the reference into the text.

## Do
1. **One composer only.** Find the textarea every chat surface shares (`ux/Dictate/Widget.js` and the composer it builds, plus `ext/Chat/Composer.js`) and add the feature there once, so the ✦ sheet, the ☰ drawer, the Dictate page and the card chats all get it (law 6).
2. **No new map.** The suggestions come from `ext/Mention/Mention.js`'s exported `maps` (`#` → refs, `@` → people). `/` has no map yet. Suggest from the same `refs` URLs if that's simple; otherwise leave `/` out and record it.
3. **Plain textarea plus `input` events.** No contenteditable. Read the word before the caret. If it starts with a trigger, filter that map by prefix, case-insensitive, and show at most about 8 matches.
4. **Mobile first: a strip of chips** directly above the composer's textarea (so it sits just above the keyboard on a phone), scrolling sideways. Not a floating popup. Tapping a chip replaces the typed word with the full reference plus a space, and keeps the focus in the textarea. Escape, or a space, hides the strip. On desktop, arrow keys plus Enter or Tab pick a match, and Enter still sends when the strip is hidden.
5. Use existing tokens and classes (load the `css` and `ui` skills). Name any new class with the composer's own prefix.

## Prove (headless only; stub every Servex call)
- At 400×800 with the ✦ sheet open: type `@`, then `#Pa`. Shoot the chip strip each time, tap a chip, and check the textarea's value now holds the reference. Shots go in `minion-autocomplete/shots/`, at 400 only.
- Sending the text still renders the icon link (Mention's existing path is unchanged).

## Rules
- Commit by exact path; never commit `.jsonl` files. Don't merge; your parent reviews and merges.
- Write what's left (for example `/path` suggestions, fuzzy matching, recent-first ordering) in `minion-autocomplete/left.md`.
- End your turn with the commit hash and the shot paths.
