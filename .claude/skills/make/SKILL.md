---
name: make
description: Run BEFORE creating anything new in this repo — a file, a folder, a page, a class, a doc, or a name for any of them (class, method, CSS class, card, tool, concept). Four questions in order — name it, place it, class it, show it — then the page mechanics (`create_page`). Replaces the `naming` and `new-page` skills (2026-10-13). Trigger skill; one minute, and the most important minute of the task.
---

# Make: name it, place it, class it, show it

What a new file is called, where it goes and what goes in it are the most important questions in this repo (the owner, 2026-10-13: "there are so many random files everywhere that nobody knows what they are, where they came from, or what they do"). Answer all four before you write the file.

## 1. Name it

Say the thing in one plain sentence: what it is, and what a newcomer would call it. For a name the owner will see (a class, a page, a module), brainstorm before you pick: 3–5 cheap agents (Sonnet, low effort), each given the sentence, the neighbours' names and one angle (plain English · what the user sees · what it does · what a rival library calls it · the shortest), 5 names each. **Pick for clarity, not wit:** rule out a name that needs explaining, clashes with a neighbour or a reserved CSS prefix (`new-css-class`), or names how it is built instead of what it is. Log the pick as a `decision` with the runner-up (the `decide` skill, for a name the owner will see).

- A class's folder, file and name are one capitalised word: `ext/JSONL/JSONL.js` holds `class JSONL`.
- **Folders:** plural when the folder holds many of one kind (`ai/sessions/<id>/`), singular when it is one thing (`ai/system/`, every class folder). Don't rename an existing folder only to fit this.

## 2. Place it

**Ask "which module is this about?" and put it inside that module's folder.** A module is portable: everything about it moves with it.

- **A file about a module lives in that module's folder:** its docs in `<module>/doc/`, its decisions in `<module>/doc/architecture.md`, its data beside its page (`page.jsonl`, never a global `/data/`). Never a doc about a module in some other folder.
- **A strictly AI class lives under `public/framework/ai/`**, the way `ext/`, `ui/` and `ux/` each hold a family of related modules. A class that only uses AI belongs with what it does.
- **A task's records** go where `node Server/TaskDirs.mjs --new <slug>` puts them (`ai/sessions/YYYY/MM/DD/…`), never a dated folder you type. **Scratch** (probes, transcripts, temp JSON) goes in the session scratchpad, never the repo.
- No module fits? Then the thing may be a new module: name it (step 1) with its own `readme.md`. Never a loose file at a root.
- **Link it from where a reader already is** (the parent's `children:` or readme index). A file nobody links does not exist. Moving existing files is a scripted move with a dry run (CLAUDE.md), not part of making a new one.

## 3. Class it

Anything with state or behaviour is a class: one class per file, named for the file; helpers are methods or statics; a page is a class that extends `Page`, a view extends `View`; `page.js` only imports and instantiates. Before more than one class, write each one's name, one-line job and what extends or holds what in the module readme's `## Architecture`. The rules and the view pattern are in the `code` skill.

## 4. Show it

Every class ends up with a view of its own live state, so the owner can watch instances change as they use it. A page about a class shows the class first (name, icon, core API, key properties, who calls it). Where it has a UI, the demo shows two things side by side: the rendered view, and the live instance as a debug tree that updates as you click. Use the shared instance view, never a page-specific debug UI (`code` skill, "A system's logs and debug view belong to its class").

## If it is a page

1. Load the `page` skill (what it is, where it lives, its layout), then answer `layout`'s questions in one line.
2. **Call `create_page`** (Servex MCP tool). It makes the folder, `page.jsonl`, a `readme.md` stub and the parent link; `description` (one sentence) is required.
3. Hand-writing `page.js` instead, the trap list, routing every view and `doc/`: [`page.md`](page.md).

Improve this skill: append to [`improvements.md`](improvements.md).
