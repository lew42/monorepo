---
name: figma
description: Before any Figma design work (drawing, editing or reviewing frames with the Figma MCP). Points at the strategy, the file and the recipe; details live in ext/Figma.
---

# Figma design work

We design in Figma before we build when a view is new or disputed: the owner sees, edits and approves there, and the build matches it ([design-first](../../../public/framework/ai/sessions/doc/design-first.md)).

**Read first:** the **Rules** section at the top of [ext/Figma/readme.md](../../../public/framework/ext/Figma/readme.md#rules), the owner-approved rules; they beat anything older, including this skill. The readme's Files table lists the current files. Then [doc/use-figma.md](../../../public/framework/ext/Figma/doc/use-figma.md) (tokens, text styles, modes, the recipe, traps), and [doc/troubleshooting.md](../../../public/framework/ext/Figma/doc/troubleshooting.md) only when something goes wrong. Load the plugin's `figma-use` skill before the first `use_figma` call. **Before your first edit in any Figma file, read its AI page** (the first page; the file's CLAUDE.md, owner 2026-11-17). Spawn a Figma agent with `path: public/framework/ext/Figma/` so the readme loads into its system prompt.

## The basics

- **The files:** Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`) is the design system being built; Lew42 Design System (`hbolzQ3Xnc78rhxAPj8xK2`, was "November 2026") is the old published library; Claude November 2026 (`woCZQDoXKJW3GcJPZukW7f`) is the scratch file for experiments. Look pages up by id or name; they get renamed. Say the node id in your log.
- **Edit the master, never an instance;** never edit what the owner is working on right now. Re-read the nodes right before each edit.
- **Explain on the canvas, not in chat:** a kicker, a title and one plain line per group, clear layer names.
- **Screenshot, then wait for approval.** The Lew42 Design System page is the approved set; build only from it. Always screenshot after building and after a fix; look for clipped text, cramped space and reading order.
- **Use the file's system:** bind colours to `Colors`/`Scheme`, text to the approved text styles (never raw font settings), spacing to `Scale` (the old `Resolution`). Modes for themes and sizes; variants only for differing structure.
- **Widths:** a 4-scale plan is proposed and awaits approval: Mobile 400, Default 1000, Desktop 1920 (1600 content area), Mega 3440. Use FILL plus max width, not fixed widths.
- **No Figma Sections:** group frames in an auto-layout frame instead.
- **Real data:** fill designs from real records so the fields match the build.
- **Cloud chats** do doc and repo edits through a spawned local SDK agent, never by running shell commands themselves.
- **Rate limit:** about 10 screenshots a minute and 200 a day for the whole account, shared by every agent. Don't run many Figma agents at once; shoot once per finished fix.

## Keep the system improving, lightly

A lesson that applies every time: one line in `use-figma.md`. An edge case: a dated entry in `doc/troubleshooting.md`. Never grow this skill into a rule book. Old versions of this skill are in git history.
