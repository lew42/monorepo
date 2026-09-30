---
name: content
description: Invoke before writing anything the owner will read — a card, a report, a task outcome, a readme, a page's text, a chat reply. How to make it understood at a glance: show the structure with layout and widgets, then add as few words as it takes. Thirty seconds; re-read it whenever a reply is getting long.
---

# Content: seen first, read second

The owner, 2026-09-25: "I don't want to read things. I want to see the thing I was asking about.
Some words are okay: a title that makes it evident, a caption. When I see a three-page response,
it makes me want to throw up."

**A title is 5–8 words and starts with the familiar concept** (the owner, 2026-09-30): "Page: the card system", "Dictation: clean mode", never a sentence. The reader recognises the concept first, then the specific thing.

## Let the layout say it

The reader should understand the structure from where things sit: hierarchy, proximity,
grouping. Sentences explaining the structure come second, if at all.

Not this (words describing a folder, then a separate table):

> A card is a folder: `public/framework/ai/…/my-card/`. Inside the folder: page.jsonl is the log…

This (the path above its contents, so it is obvious what is inside what):

```
public/framework/ai/2026/09/25/my-card/
├── page.jsonl   the card: one line per event
└── about.md     its text
```

The same goes everywhere:

- **Files** → a tree, or the `ext/files` widget (click a file to see its code).
- **An object** → its live instance or hierarchy, not a paragraph about it.
- **A task** → its checklist, done ticked and next unticked.
- **A layout** → a screenshot.
- **A code or data shape** → a short code block with one-line labels beside it.
- **The first thing on a page: what it is made of, its core concepts as linked icon tiles** (the `Concepts` module in `ux/Content`; each concept is a child page with a name, slug and icon).


**Structured content** (icon card, section, outline, background or not): the guide is in the `page` skill, because every piece of content is a page.

## Words, when they earn it

- A title that says exactly what the thing is.
- A caption of one line under a picture.
- The one sentence that the picture can't say.
- Name each concept once, the same way every time, and link it.

## Connect the dots

Clarity comes from familiar structure (the owner, 2026-09-29). When a text mentions a concept that
has its own page (a class, a method, a named system), link it there, so simple statements connect
familiar concepts rather than re-explaining them. Link where the link helps the reader, not every
mention.

- **Document where the code lives.** A method is explained on its class's page; a Servex system on
  the Servex page. Other pages state the fact in one line and link.
- **The tip of the iceberg comes first.** The most important thing leads, and very often that's the
  list of subtopics: what is this made of, as linked items. Detail sits one click down.

## The length check

Before sending, ask: could the owner get this in ten seconds? If not, cut it until they can, and
move the rest one click down (a linked doc or a folded section). A reply to the owner is one screen
at most, and usually a few lines.

Review questions for this system: [questions.md](questions.md) (the review skill asks them).
