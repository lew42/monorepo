# Minion brief: the ☰ drawer's chat — one clear AI view and one composer panel

Load the `minion` skill first. Your parent is **task-mastermind-one-dictation**. Work only in your served worktree (your parent names it and its port in your first prompt).

## The owner's words (2026-10-02, verbatim)
"this sidebar drawer that has the AI tab and the sessions tab and the dictation tab and settings, is this a global session? I feel like the AI and the sessions should be kind of the same thing. The UI needs to be very clear what's actually happening structurally in the data. Which session we're on should be abundantly clear. Which agents are listening should be abundantly clear. Creating a new session definitely should be a button on the main AI page here. The bottom bar still has this text area that probably needs a different background color to separate it from the chat area, the whole panel area where the controls are. The microphone and send and settings buttons are kind of just floating awkwardly down there."

The screenshot is `drawer-1920-owner-2026-10-02.png` in this task's parent folder (`one-dictation/`). In it, six tiny tabs wrap onto two lines, nothing names the session or the agents, the composer is a bare box with the mic, Send and gear floating under it, and most of the chat is empty space.

## Do
1. **AI and Sessions become one tab, "AI"** (`ext/drawer/tabs.js`'s `list`, `tabs/ai.js`, `tabs/sessions.js`). At its top is one header strip:
   - **The current session:** its name (the `session_summary` title), whether it's global or scoped to this page or card, and a link to its log (the session's `.jsonl` page).
   - **The agents listening:** the session's fast and smart assistants, as small chips with live state (working, idle, asleep). Read the state from what Servex already reports. Don't poll a new endpoint if one exists.
   - **A session switcher** (the list the Sessions tab shows today, folded into a dropdown or a short list) and a **"+ New session"** button, which is `ux/Dictate/chat.js`'s existing `new_session_button()` (law 6: never a second one).
   - An old `?drawer=sessions` link opens the AI tab.
2. **"+ New session" on `/framework/ai/`** (the Inbox dashboard), beside "+ New card": the same `new_session_button()` component, not a copy.
3. **The composer becomes one panel** (`ux/Dictate/Widget.css` and the composer markup it styles, shared by every surface): its own background token, different from the chat feed's, plus a top border. Inside it go the textarea and ONE toolbar row: mic on the left, then the gear, and Send on the right, on the same grid as the textarea's edges. Pick the colour tokens with the `color` skill, and check them in light and dark.
4. **The tabs fit on one row** at the drawer's default 19rem width. Move Admin and Files under Settings (as sections, or a sub-tab), unless they fit on one row without that.

## Prove (headless only, never the owner's tabs; stub every Servex call)
- At 1920 (the ☰ drawer open on the AI tab) and at 400 (the ✦ sheet): shoot the header strip with a stubbed session and two agent chips, the composer panel, and the tab row on one line. Put the shots in `minion-drawer-chat/shots/`.
- The "+ New session" button on `/framework/ai/` and in the drawer: clicking it starts a new session (a stubbed `session/new` POST is seen), and the header's name changes.
- The Dictate page demo and the ✦ sheet show the same composer panel; they are the same widget.

## Rules
- Commit by exact path; never commit `.jsonl` files. Don't merge; your parent reviews, smoke-tests and merges.
- End your turn with the commit hash and the shot paths.
