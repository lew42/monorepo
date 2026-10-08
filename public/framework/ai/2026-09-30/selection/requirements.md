# Selection: element-aware AI, on mobile too: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step.

**Queued: start after the 4:50 PM reset.** Foundational, so no cap. Plan first, with a picture, on a card.

## Asks
1. **Selection works on mobile.** Put an inspector button on the rail or sheet. With it on:
   - a tap highlights the item under your finger;
   - a tap anywhere on a card selects the WHOLE card;
   - another tap drills down to a sub-item inside it.

   The rail shows the selection's name, plus a small scrollable menu of actions for it.
2. **It's part of dictation.** The AI knows the page and the selected element. The owner can say "fix this" or "do that", and the selection travels with the prompt, like the nav events in the global session (task-mastermind-audio-consolidate).
3. **Build on what exists; don't rebuild it:**
   - `ext/drawer/select.js`: hover, select and the Element tab, desktop only and only while the drawer is open;
   - the chip that carries a selection into the chat (`tabs.chips`);
   - past element-context work (search the task log for "Element tab", "select", "chips").
4. **Everything is routed:** the nested content (cards inside cards) and the selection have URLs.

## Also from this message: routed elsewhere
- **Task pages** (`/framework/ai/<date>/<task>/`, the Report tab). The grey checkboxes are the landing report's markdown task list (`- [x]`), which marked renders as DISABLED checkboxes. The report items don't link anywhere and are too terse to decode. The full-width progress bars at 3440 are also poor. The owner waits for the System page before redesigning this. Owner: the ui-system brief. A quick visual fix (a done item shows as a green ✓, not a disabled box) can go through the quick-fix pool.
- **Reports:** arbitrary structured content, not a fixed template, because every report has a different shape. Owner: the ui-system brief.
- **Each System has its own inbox,** so messaging a system is easy. The inbox layout is generalized out of ai2.css into ui/ux; page CSS stays minimal, with no ai2.css or ai.css once merged. Owner: the inbox-ext brief.
- **Docs answer with a link.** "What's the mobile rail called?" should be answered by a link to its page in the UI system. The docs replace the need to ask, and the AI stays page-aware and element-aware for the rest. Owner: the ui-system brief.
- **Self-evident is priority one** for writing: logged in `.claude/skills/clarity/improvements.md` for the architect.

