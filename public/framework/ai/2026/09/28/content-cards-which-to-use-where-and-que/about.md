# Content cards: which to use where

**In short:** the building blocks exist: [Question](/framework/ux/Content/Question/), [Decision](/framework/ux/Content/Decision/), the card outline, and the [dictation playground](/framework/ux/Dictate/playground/). What does not exist yet is the step in the middle, where dictation turns into an outline and a question you ask appears as a card in place, then fills with its answer while you keep talking. And agents rarely reach for modules at all: most cards are plain markdown, because `about.md` is the easy path.

This is an audit and a proposal. Nothing was built.

## 1. Questions in the flow: where are we?

```
You talk
 └─ Dictate: Whisper's raw text                       ✅ built
     └─ Playground: cleaned text, shown as a diff      ✅ built (landed today)
         └─ Outline: headings + items, live            ❌ missing
             └─ A question → Question card, in place    ❌ missing
                 └─ The answer lands inside that card   ❌ missing (the card reads its log once)
```

| piece | what it does today | where |
|---|---|---|
| Question | a question, a text box, and the latest answer shown underneath. Reads its log **once**, when it is drawn | [ux/Content/Question](/framework/ux/Content/Question/) · [Question.js](/framework/ux/Content/Question/Question.js) |
| Decision | a question, options with caveats, one chosen | [ux/Content/Decision](/framework/ux/Content/Decision/) |
| Card outline | a list of items (question, request, sub-question, note, task), shown **apart** from the words that produced them | [ai2/card.js](/framework/ai2/card.js), [ai2/outline.js](/framework/ai2/outline.js) |
| Card `place` line | draws a module (or a card's own `content.js`) in the card, as a block or a tab | [example card](/framework/ai2/2026/09/28/example-a-card-s-content-js/) |
| Playground | raw → cleaned text as a diff (red struck out, green added) → clean text. Step 9, "a structured final version", was deliberately left for later | [ux/Dictate/playground](/framework/ux/Dictate/playground/) |
| Structure | icon cards, sections, outlines: the words drawn as a picture | [ux/Content/structure](/framework/ux/Content/structure/) |

**The gap, as a checklist**

- [ ] **Outline pass:** while you dictate, the cleaned sentences become an outline (a topic becomes a heading, a point becomes an item), updating live like the playground's Live tab.
- [ ] **Question spotting:** a sentence that asks something is marked as a question by the same fast pass that does the cleanup.
- [ ] **In-place drawing:** the question appears as a Question card *at that point in the paragraphs*, not in a separate list or tab. Today the outline and the placed modules sit apart from the text.
- [ ] **A stable id** for each question, taken from where it was said, so a later answer can find its card.
- [ ] **Live answers:** Question reads its log only once. It needs to follow the card's log as it grows (ext/JSONL's live tail already does this) so that an `{"answer": {"question": id}}` line fills the card without a reload.
- [ ] **Someone to answer:** the question is sent to an agent, and the agent writes its answer back as that line.
- [ ] **A look for read-only:** when nobody can type in it (`edit()` is off, or the answer is an agent's), Question shows the question and its answer, with no text box and no dead button. Decision needs the same.
- [ ] **No interruptions:** a card appearing never takes the focus away from the mic, so you keep talking.
- [ ] **Saved into the card:** the finished outline, with its cards, is written into the card's `page.jsonl` as `place` lines, so a reload shows the same thing.

## 2. The content inventory, grouped by what it is for

| for | modules |
|---|---|
| **Words** | [md / md.file](/framework/ext/markdown/) · p() / h1–h6 · [Quotation](/framework/ux/Content/Quotation/) · [Disclosure](/framework/ux/Content/Disclosure/) (a title that opens) · [ui/accordion](/framework/ui/accordion/) · [ui/kbd](/framework/ui/kbd/) |
| **Structure as a picture** | [Concepts](/framework/ux/Content/Concepts/) (what a page is made of) · [Structure](/framework/ux/Content/structure/) (icon cards, section, outline) · [ui/tree](/framework/ui/tree/) · [ux/Tree](/framework/ux/Tree/) |
| **Asking and deciding** ⚡ | [Question](/framework/ux/Content/Question/) ⚡ · [Decision](/framework/ux/Content/Decision/) ⚡ · [ui/decision](/framework/ui/decision/) (static) · [Object](/framework/ux/Content/Object/) (a live instance) |
| **Code and files** | [files](/framework/ext/files/) ⚡ · [highlight](/framework/ext/highlight/) · [demo](/framework/ext/demo/) · [CSSDoc](/framework/ext/CSSDoc/) |
| **Moving around** | [tabs](/framework/ext/tabs/) · [toc](/framework/ext/toc/) · [catalog / browse](/framework/ext/catalog/) · [ui/crumbs](/framework/ui/crumbs/) · [ux/Menu](/framework/ux/Menu/) · [ux/Pagination](/framework/ux/Pagination/) · [ux/Filter](/framework/ux/Filter/) |
| **Numbers and time** | [ui/table](/framework/ui/table/) · [ui/stats](/framework/ui/stats/) · [ui/timeline](/framework/ui/timeline/) · [ext/Timeline](/framework/ext/Timeline/) · [Spend](/framework/ux/Content/Spend/) · [JSONL](/framework/ext/JSONL/) ⚡ (a live log) |
| **Status** | [ui/alert](/framework/ui/alert/) · [ui/badge](/framework/ui/badge/) · [ui/progress](/framework/ui/progress/) · [ui/tags](/framework/ui/tags/) · [ui/tooltip](/framework/ui/tooltip/) |
| **Documenting a module** | [Doc](/framework/ext/Doc/) · [demo](/framework/ext/demo/) · [CSSDoc](/framework/ext/CSSDoc/) · [card catalog](/framework/ux/Content/catalog/) (75 kinds of box) |
| **Apps** (rarely in content) | [Panel](/framework/ext/Panel/) ⚡ · [editor](/framework/ext/editor/) ⚡ · [Dictate](/framework/ux/Dictate/) ⚡ · [Ask](/framework/ext/Ask/) ⚡ · [ux/Wizard](/framework/ux/Wizard/) · [ux/Popover](/framework/ux/Popover/) · [ui/dialog](/framework/ui/dialog/) |

⚡ = it has controls that write somewhere. Without a live backend, those controls do nothing when clicked.

## 3. What agents actually write today

We looked at 17 recent pages and cards.

| method | count | where |
|---|---|---|
| markdown (`about.md`, `md()`) | **11** | nearly every task card |
| real modules | 5 | only on module pages (ux/Content, ux/Dictate) |
| hand-built DOM | 1 | the census page |
| **a module that should have been used, but wasn't** | **5 of 17** | |

The misses:

- **An org chart drawn as ASCII art** in a code block, where [ui/tree](/framework/ui/tree/) should have been used ([who-is-who](/framework/ai2/2026/09/25/who-is-who-every-agent-role/)).
- **A tree built by hand** as a raw `<details>` in HTML ([census](/framework/ai/2026/09/25/readme-indexes-across-the-framework/census/)).
- **"Recommendation" or "do next" written as prose or `- [ ]` bullets** where a Decision belonged: research-process, open-tasks, cards-that-show-the-thing.

**Why it happens:** a card's report is `about.md`, and markdown cannot hold a module. Placing a module means writing a second file (a `place` line, or a `content.js`), and until today's [example card](/framework/ai2/2026/09/28/example-a-card-s-content-js/), no skill showed how. The page skill's table also still says "Disclosure is not built yet". That line is out of date: Disclosure is built.

## 4. Which cards fit which context

| context | reach for | avoid |
|---|---|---|
| **Your dictation, as an outline** | Structure outline · Question ⚡ · Decision ⚡ · Quotation (your exact words) · Disclosure (the full transcript) | long prose; tables in the middle of the flow |
| **A task report** (the card) | a picture first (a screenshot, or [files](/framework/ext/files/)) · a checklist of what was asked · Decision for "what next" · md for the rest | Question cards that nobody will answer; tabs for a single screen |
| **Class documentation** ([Doc](/framework/ext/Doc/)) | Doc tabs · [demo](/framework/ext/demo/) · Concepts · files · CSSDoc · md in `doc/*.md` | Question and Decision (a doc is not asking anything); Spend |
| **A blog post** | [md](/framework/ext/markdown/) · figures · [highlight](/framework/ext/highlight/) · Quotation · Disclosure | ⚡ anything with buttons: they do nothing for a public reader and the site is static |
| **A design proposal** | Decision ⚡ (the options, with caveats) · screenshots · Structure · table (comparisons) · demo | a wall of prose; a Question where a Decision fits (if you know the options, offer them) |

**The rule underneath:** a card with buttons only belongs where someone can press them *and* something happens when they do. In any other place, draw it read-only, or use md.

## 5. The skill shape

Proposal: **`page` stays the one skill everyone loads.** It gets a three-line pointer in place of its content-kinds table. **A new on-demand skill, `content-cards`,** holds the catalog and the context table, and is loaded only for work heavy in documents.

```
page (everyone, every page or card)
 ├─ content        (the words, unchanged)
 ├─ layout · css · new-page   (unchanged)
 └─ content-cards  (NEW, on demand: class docs, dictation outlines,
                    proposals, a report with a decision in it)
```

**`page`: the table becomes these lines**

```md
## Content: reach for a module before writing markup

Most pages need only `md` plus one picture. When the content is a question, a decision,
a file list, a tree, a checklist, or class documentation, load `content-cards` first:
it says which module fits which context and how to place it in a card.
A card's report can hold a module: put a `content.js` in the card's folder and add one
line to its page.jsonl, `{"place": {"module": "content.js"}}`. Example:
/framework/ai2/2026/09/28/example-a-card-s-content-js/
```

**`content-cards`: the first 10 lines**

```md
---
name: content-cards
description: Load before writing class documentation (ext/Doc), turning a dictated prompt into an outline, writing a design proposal, or putting a question, decision, tree, file list or checklist on a page or card. The catalog of content modules, grouped by what they are for, and which fit which context. On demand; the page skill points here.
---

# Content cards: the right module in the right place

First ask what the content IS. A question, a choice between options, a folder, a tree, a quote,
a cost: each already has a module, and it will look better than markdown can. Then ask WHERE
it goes: a card with buttons only belongs where someone can press them and something happens.
| context | reach for | avoid |   ← the table from section 4, then the inventory from section 2
```

**Triggers**

| skill | loaded when |
|---|---|
| `page` | making or reshaping any page, card or view, the same as today |
| `content-cards` | ext/Doc work · a dictation outline · a design proposal · the content includes a question, a decision, a tree, files or a checklist |

The alternative is to fold all of this into `page` itself. Most minions make a quick page and never need the catalog, so that would cost every one of them about 60 lines for nothing. The owner's own words were "a lot of minions could create a quick page without really needing to load the whole library".
