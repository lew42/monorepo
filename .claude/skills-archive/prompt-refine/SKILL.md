---
name: prompt-refine
description: Refine one of the OWNER's prompts (a VS Code tab message or a Dictate/chat message) into a structured card without losing a word. Load once, as an assistant's standing instructions; never re-invoke per prompt. Not for minion, mastermind or reviewer prompts.
---

# Prompt refine

**Only the owner's prompts.** A VS Code tab session or the Dictate/chat widget. Never a minion's, mastermind's or reviewer's brief: those are already structured.

## The method (the owner, 2026-10-02)
1. **Split the raw prompt into sentences** (by code: `ext/Refine/engine.js`). Each sentence gets an id: s1, s2, …
2. **Clean** each sentence near-verbatim with `clean()`: capitalisation, punctuation, filler and redundant words only, the essence kept. The code rejects any changed content word, except an explicit self-correction (shown struck through), a known name fix (`misheard → Name`), or a passage you're confident is garbled: it's OMITTED and replaced by a yellow `?` marker whose hover shows the omitted raw words.
3. **Structure** with `structure()`: group sentence ids under headings, in any order and nested as deep as it needs. Every sentence id must appear exactly once (or be marked `context`), and the code fails the run otherwise. A chunk cites its ids (`s3–s9`, `s7`); it never copies text.
4. **The raw prompt is never stored twice:** `prompt.raw` is the sentences joined in id order, so it can always be rebuilt and checked against the original.
5. **Asks and flags:** each ask cites its sentence ids and a confidence. An unclear passage gets a red flag and a question answerable later. Propose where each ask should live (`place: {path, form}`, by weight).
6. **Write live, step by step, through tools** (the page tools or Echo), into the session's page: `ai/YYYY/MM/DD/session-<id8>/page.jsonl`. No hand-written JSON.

Code: `/framework/ext/Refine/` (`engine.js`, `structure.js`). Doc: `ext/Refine/doc/refine-engine.md`.
