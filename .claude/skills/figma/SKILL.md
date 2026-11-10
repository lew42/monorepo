---
name: figma
description: Before any Figma design work (drawing, editing or reviewing frames with the Figma MCP). Points at the file, the page convention and the how-to; the details live in ext/Figma/doc.
---

# Figma design work

We design in Figma before we build when a view is new or disputed: the owner can see, edit and approve there, and the build then matches it ([ai/sessions/doc/design-first.md](../../../public/framework/ai/sessions/doc/design-first.md)).

**Read first, in this order** (short): [ext/Figma/readme.md](../../../public/framework/ext/Figma/readme.md) → [doc/use-figma.md](../../../public/framework/ext/Figma/doc/use-figma.md) (the file's tokens, text styles, Resolution modes, the recipe) → [doc/troubleshooting.md](../../../public/framework/ext/Figma/doc/troubleshooting.md) only when something goes wrong. Load the plugin's `figma-use` skill (and `figma-generate-design` for composed views) before the first `use_figma` call.

## The basics

- **The file:** system work (tokens, components) goes in the design system file "November 2026" (being renamed "Lew42 Design System"), key `hbolzQ3Xnc78rhxAPj8xK2`; it is the library. The September 2026 file `QYN0G2URSBHYH5I06MOjxU` keeps its existing pages. Agents can create files (`create_new_file`), but reuse a page where one fits; name it for the work ("Sessions and tasks") and say its node id in your log.
- **Your own frame** (the owner, 2026-11-05): everything you build goes inside one top-level frame named `Claude · working area`, headed by a `smart_toy` icon (the file's icon font), an h1 "Claude" and a one-line context note. Edit only inside it.
- **Duplicate before editing:** to change something the owner made, duplicate it into your frame and edit the copy; never edit the owner's nodes in place.
- **Read before every edit:** re-read the page and nodes right before each edit; the owner may have changed them since your last read.
- **Explain on the canvas, not in chat:** every group you make gets a label (h4 kicker, h3 title, one plain line: what it is, why it exists, where it goes) and clear layer names. Answer a question or a status request visually on the canvas (real components, small visuals), not as text notes and not in chat; quick answers are spoken.
- **Doc and repo edits from a cloud chat** go through a spawned local SDK agent, never the chat running shell commands itself.
- **Who draws:** a minion or task agent with the Figma MCP, not the mastermind. The mastermind reviews by screenshot (cheap) and sends notes.
- **Responsive, always:** draw at 400 (phone) and 1200, and at 1920 and 3440 when the view is a page; multi-column only where the width earns it.
- **Use the file's system:** bind colours to the `Colors`/`Scheme` variables (`Scheme` was `Text` in the Sept file), text to the `h1`–`h4`/`body` styles, spacing to `Resolution` (page root `Mega`, narrow columns `Mobile`, cards `Default`). Reusable pieces become components once; frames use instances. Edit the master, not the instances. Masters sit on the root canvas (not nested in frames). No text properties on components (overrides are fine); a `Content` slot holds what changes, shared chrome stays in the master around it ([slot rules](../../../public/framework/ext/Figma/doc/use-figma.md#design-system-file-card-button-page-and-the-slot-rules-owner-2026-11-05)).
- **Modes over variants** (the owner, 2026-11-05): a colour or style switch is a variable mode (`Scheme`, `Button`), not a variant; variants only when a named setup changes many things at once ([why](../../../public/framework/ext/Figma/doc/use-figma.md#modes-over-variants-owner-2026-11-05)).
- **Equal-height cards:** a GRID auto-layout frame (FLEX columns, HUG rows, children FILL; append children after setting GRID; captions and cards in their own rows, never a wrapper child), not the tallest-hugs workaround ([recipe](../../../public/framework/ext/Figma/doc/use-figma.md#grid-auto-layout-equal-height-cards-that-adapt-verified-2026-11-05)).
- **A ground filled with `surface` vanishes on a parent of the same mode:** give it a hairline (10% black, inside) or a different backdrop.
- **No sections** (the owner, 2026-10-21): a Figma Section has no auto layout and must be resized by hand. Group frames in an auto-layout frame instead (superseded work too), unless there is a really good reason.
- **Real data:** fill designs from the real records (session.jsonl, task.jsonl) so the fields are the ones the build will have.
- **Check:** one screenshot after composing, one after a fix. Look for clipped text and wasted or cramped space.
- **Rate limit:** several agents calling `use_figma` at once hit the Figma call limit; one Figma agent at a time.

## Keep the system improving, lightly

A lesson that applies every time: one line in `use-figma.md`. An edge case: a dated entry in `doc/troubleshooting.md` (problem, cause, fix). Never grow this skill into a rule book.
