# Dictation, per page

The microphone lives in the drawer — [`ext/drawer`](/framework/ext/drawer/) — the same
component on every page, opened with the same ☰ button. Its **Dictation tab** embeds the
[Dictate](/framework/ux/Dictate/) playground (one shared instance, so the words said
there are the same words the playground's own page shows). Its **AI tab** is the actual
send box: a typed message and a dictated one arrive there the same way and go out the
same way — dictation is just one more way to fill that one message box.

- The tab: `public/framework/ext/drawer/tabs/dictation.js`.
- The capture, cleanup and speech-to-text: [`ux/Dictate`](/framework/ux/Dictate/).
- Where a message goes next (a card, or this page's own thread) is the
  [Fast assistant](/framework/core/Page/ai/doc/assistant/) page.

## Why not dictate into a VS Code tab

Stopped on 2026-10-24: the owner chose website dictation going straight to a Servex SDK agent, so no message was ever sent into a tab and no hook was built. **Checked:** every running Claude session, VS Code tab or SDK agent alike, writes a file `~/.claude/sessions/<pid>.json` holding its `sessionId` (the uuid), its `name` (the name `ListAgents` shows) and a `messagingSocketPath` (a Windows named pipe, `\.\pipe\LOCAL\cc-msg-…`). That file is how a uuid maps to a peer name: the tab e00f55c9 was pid 42428, `name: "monorepo-b9"`, `entrypoint: "claude-vscode"`. The name is derived from the folder and has a `nameSince` time, and the bracketed ref ListAgents shows (`[db99e0]`) is not a prefix of the uuid, so a sender has to look the name up fresh every time. Servex SDK agents show up as peers too (`entrypoint: "sdk-ts"`). **Checked, from the tool's own description:** the only way in is `SendMessage`, a tool the model calls, so each delivery costs an LLM turn on the sending side. A message waits until the tab's next tool round. A tab in a different permission mode from the sender holds the message for the owner's approval and may let it expire. A successful send means the message arrived, not that it was read. An SDK agent is different: Servex holds its input stream and pushes a prompt into it from node, with no model turn and no approval step. **Unchecked:** whether the pipe protocol could be spoken straight from node (the code is bundled inside `claude.exe`, and no public API for it was found), and whether a delivery actually lands in an idle VS Code tab. **Not tested here, from how Claude Code hooks work:** a `UserPromptSubmit` hook can only add text to a prompt the owner is already sending, so it cannot wake an idle tab. Resuming the tab's uuid from a second process was ruled out, because two writers would share one transcript.
