---
name: figma
description: Before any Figma design work (drawing, editing or reviewing frames with the Figma MCP). Points at the file, the page convention and the how-to; the details live in ext/Figma/doc.
---

# Figma design work

We design in Figma before we build when a view is new or disputed: the owner can see, edit and approve there, and the build then matches it ([ai/sessions/doc/design-first.md](../../../public/framework/ai/sessions/doc/design-first.md)).

**Read first, in this order** (short): [ext/Figma/readme.md](../../../public/framework/ext/Figma/readme.md) → [doc/use-figma.md](../../../public/framework/ext/Figma/doc/use-figma.md) (the file's tokens, text styles, Resolution modes, the recipe) → [doc/troubleshooting.md](../../../public/framework/ext/Figma/doc/troubleshooting.md) only when something goes wrong. Load the plugin's `figma-use` skill (and `figma-generate-design` for composed views) before the first `use_figma` call.

## The basics

- **The file:** the September 2026 file `QYN0G2URSBHYH5I06MOjxU`. Agents cannot create files; make or reuse a page in it, named for the work ("Sessions and tasks"), and say its node id in your log.
- **Who draws:** a minion or task agent with the Figma MCP, not the mastermind. The mastermind reviews by screenshot (cheap) and sends notes.
- **Responsive, always:** draw at 400 (phone) and 1200, and at 1920 and 3440 when the view is a page; multi-column only where the width earns it.
- **Use the file's system:** bind colours to the `Colors`/`Text` variables, text to the `h1`–`h4`/`body` styles, spacing to `Resolution` (page root `Mega`, narrow columns `Mobile`, cards `Default`). Reusable pieces become components once; frames use instances. Edit the master, not the instances.
- **Real data:** fill designs from the real records (session.jsonl, task.jsonl) so the fields are the ones the build will have.
- **Check:** one screenshot after composing, one after a fix. Look for clipped text and wasted or cramped space.
- **Rate limit:** several agents calling `use_figma` at once hit the Figma call limit; one Figma agent at a time.

## Keep the system improving, lightly

A lesson that applies every time: one line in `use-figma.md`. An edge case: a dated entry in `doc/troubleshooting.md` (problem, cause, fix). Never grow this skill into a rule book.
