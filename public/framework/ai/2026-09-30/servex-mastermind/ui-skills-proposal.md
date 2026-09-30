# The design and code skill system: the proposal

**Reshaped to the owner’s words (2026-09-30, ai/2026-09-30/design-code/owner-words.md).** The umbrella is called **design**, not ui; the knowledge lives on pages, not in `.claude/skills/`; a skill is a thin pointer. The older ui-umbrella draft is kept below for the overlap table and the CLAUDE.md split, which still hold. task-mastermind-design-code builds this; every skill diff comes to mastermind-servex-9 for approval.

## The shape

```
/framework/design/        design: everything that goes into making anything new (skill: design, was page)
├── layout               space: sizing, wrapping, spacing, flow, the approved layouts, 400 → 3440   (skill: layout)
├── color                colour and contrast, tokens, light/dark                                  (skill: color, split out of css)
├── navigation           the path, how links look, persistent or switching, transitions          (skill: navigation, split out of page)
├── content              the iceberg: level of detail, what is foundational, importance, references (skill: content)
└── ui                   buttons, toolbars, dropdowns, icons, states, targets                     (skill: ui, new — the owner’s word for controls)

/framework/code/          code: the code in this framework, HTML CSS JS                             (skill: code)
├── patterns             parts as static subclasses, imports flow down, resolve against import.meta
├── dos-and-donts        the traps that never throw, formatting, opinions
├── css                  layers, where a declaration belongs, class naming and prefixes            (skills css + new-css-class fold in here; /framework/styles/ stays the vocabulary)
└── objects              object-oriented design: every class ships a view of its state (chip / row / panel)

Companions, unchanged: naming, review, clarity, ui-test.
```

Each page has a readme (level 1: concept tiles, gist, lists) and, beside it, **its review questions** — today’s `questions.md` files move to the pages, so `review` and `/framework/ai/review/` read them from there (one seam for design-code: `Server/review.mjs` and the review skill point at the new paths).

## What a thin skill looks like

```
---
name: layout
description: Space on a page: sizing, wrapping, spacing, flow, the approved layouts, 400 → 3440. Read before laying anything out.
---
Read the readme chain at /framework/design/layout/ (root → design → layout), then its questions.
Overview: three sizing questions before any layout; clamps not constants; spacing doubles at 3440; a declared child without page.js 404s.
```

The description is the awareness; the body is the pointer plus five lines. Nothing else — a rule in the skill body is a rule in two places.

## Where each existing skill goes (line by line, nothing lost)

| Skill today | Becomes | Its rules go to |
|---|---|---|
| page | **design** (the umbrella: kind of page → where it lives → how it’s reached → layout → content → ui) | /framework/design/ readme; Cards + Structured content → content; Navigation questions → navigation; the page-inbox section → /framework/ai/ (it is a Servex fact) |
| content | content | /framework/design/content/ |
| layout | layout | /framework/design/layout/ (+ css’s Spacing questions) |
| css | **color** + code/css | Colour and contrast → design/color; layers, declaration placement, Icons → code/css (Icons’ rules about pressable things → design/ui) |
| new-css-class | folds into code/css | a class name is a step of writing CSS; naming stays the companion |
| code | code | /framework/code/ (patterns, dos-and-donts, objects) |
| naming | naming (companion, unchanged) | stays a skill: it is a thirty-second procedure, not knowledge |
| — | **ui**, **navigation** (new pages, new thin skills) | ui: today’s parked Controls questions (page/questions 23–25) + the icon-system rules; navigation: page’s 10 navigation questions + back / reload / way-in |

## Overlaps and owners

The table under “Where the aspects overlap” below still holds, with the renames: controls → ui, style → code/css (how) + color (what).

## Review questions for the move itself

1. Does every rule in the old skill appear on exactly one page? (diff the skill body against the page, line by line)
2. Does the thin skill fit on one screen and say where to read?
3. Does /framework/design/ and /framework/code/ each render at 400 and 1920 with level 1 above the fold?
4. Does `review` still find every question file?
5. Does a person and an agent read the same page? (no “you are an agent” voice on a page)

---

# Earlier draft: the ui umbrella (kept for its overlap table and the CLAUDE.md split)


The owner (2026-09-30): "it's all UI" — content, layout, controls and navigation are one thing seen four ways, and the skill structure must let each be refined and checked on its own. This is the proposed shape. Nothing is restructured yet.

## The tree

```
ui                      the umbrella: what kind of thing, where it lives, how it is reached, then the four aspects in order
├── content             words and their structure: headings, lists, grids of previews, references (#Page, /path)
├── layout              space: sizing, wrapping, spacing, flow, the approved layouts, 400 → 3440
├── controls            the interactive parts: buttons, toolbars, dropdowns, menus, forms, drag handles
├── navigation          how a reader gets anywhere: routes, tabs, rails, breadcrumbs, back, inbox rows
└── style               the CSS itself: framework.css vocabulary, layers, class names (css + new-css-class merged)

Companions (not aspects, they serve every aspect):
  naming      a name for anything, thirty seconds
  review      one pass, every aspect's questions, proof by screenshot or number
  clarity     the content check on what an agent wrote for the owner (content's questions, run by a fresh agent)
  ui-test     prove an interaction headless (controls' and navigation's proof tool)
```

`page` becomes `ui`: today's page skill already does the top-down job (what kind, where, how reached, layout, content), so it is the umbrella renamed to the owner's word. Its "Cards" and "Structured content" sections move down into `content`; its navigation questions move into `navigation`.

## The table

| Skill | Owns | Links to | Merge / split | Review questions it contributes |
|---|---|---|---|---|
| **ui** | The order of the job: kind of page → where it lives → how it's reached → layout → content → controls. The two tests for every element. Which module to reach for. | every aspect below; `new-page` for the mechanics | `page` renamed; loses its Cards/structured-content text to `content`, its Navigation questions to `navigation` | Page structure (today's 12 in page/questions.md) |
| **content** | Words, headings, lists, previews, cards-as-content, references (`#Page`, `/framework/core/Page`), titles (concept first), length | `naming` for a title; `ui` for where it sits; ext/Mention for references | absorbs page's "Structured content" and "Cards: which one, when" | Words (11 today) + new: structure (heading hierarchy, list vs grid, preview walls) |
| **layout** | Sizing, wrapping, spacing, flow, the approved layouts, clamps, the four widths | `style` for the CSS to write it; `ui` for what goes where | unchanged in scope; its Spacing questions move here from css (spacing is a layout fact, CSS is how) | Layout, Sizing, Wrapping, Flow (30) + Spacing and padding (from css) |
| **controls** | Buttons, toolbars, dropdowns, menus, forms, handles, states (hover, active, disabled), icon items, touch targets | `style` for the classes; `ui-test` to prove a gesture; `layout` for the toolbar's space | **new**: today this lives nowhere (bits in css Icons, page Cards, the icon-system task) | new: does every control look pressable, have a state, a target ≥ 44px, an icon that means it, a label when the icon alone is unclear |
| **navigation** | Routes (every view has a URL), tabs, rails, breadcrumbs, back, the inbox row, where a click lands, stable navigation | `ui` (how it's reached is decided there); `controls` (a tab is a control) | **split** out of page (its Navigation questions, 10) | Navigation (10 today) + new: does back work, does reload land in the same place, is the way in visible above the fold |
| **style** | framework.css vocabulary, the four layers, colour and contrast, class naming and prefixes (css-scopes.txt), where a declaration belongs | `layout` for what to achieve; `naming` for a class name | **merge** css + new-css-class (a class name is a step of writing the CSS, not its own skill) | Colour and contrast (from css) + new: every rule in a layer, no new class when a utility exists |

Companions stay as they are: `naming`, `review`, `clarity`, `ui-test`. `review` reads every aspect's questions.md in the order of the tree.

## Where the aspects overlap, and who owns each overlap

| Overlap | Example | Owner | Why |
|---|---|---|---|
| content × layout | a wall of previews; a grid of cards | **layout** decides the grid, **content** decides what one preview says | space is layout; words are content |
| layout × navigation | a rail; a tabs row; a sticky header | **navigation** | a rail exists to get somewhere; layout only gives it room |
| navigation × controls | a tab, a back button, a breadcrumb | **navigation** for where it goes, **controls** for how it looks and feels | one question each, no double rule |
| controls × style | a button's colours and states | **controls** names the states, **style** writes the CSS | controls says what; style says how |
| content × controls | a "Leave a note" button; a card's ··· menu | **controls** | anything the reader presses is a control |
| layout × style | spacing, clamps, padding | **layout** owns the rule (what padding), **style** owns the declaration (which layer, which utility) | today's css/questions "Spacing and padding" moves to layout |
| everything × ui | which of the above applies first | **ui** | it is the order of the job |

## What this costs and what it changes

- Renames: `page` → `ui`. Merges: `css` + `new-css-class` → `style`. Splits: `navigation` out of `page`; `controls` new. Moves: two page sections into `content`; css's spacing questions into `layout`.
- Every skill keeps its `questions.md` beside its rules, so `review` and `/framework/ai/review/` keep working; the count goes from 4 question files to 6.
- Each aspect can be refined alone: a finding about a toolbar changes `controls` only; a finding about a rail changes `navigation` only.
- Later, `/framework/ui/` (under construction) documents the same six names, one page each; `/framework/styles/` stays the CSS style guide that `style` points at.

## One design, not three (the owner, 2026-09-30: coordinate)

The skill tree above, the AI page's authoring section and the review questions are the same thing seen three ways, so each has one home and the others point at it:

| Thing | Home | Who reads it |
|---|---|---|
| The rule (how to do it) | `.claude/skills/<aspect>/SKILL.md` | the agent doing the work |
| The check (was it done) | `.claude/skills/<aspect>/questions.md` beside its rule | `review`, and `/framework/ai/review/` renders them |
| The effect (what it looks like) | `/framework/ai/skills/<aspect>/` and the module's own page: a live example, simple first, then the complex one | the owner, a new agent |

The AI page never restates a rule: it shows the effect and links the rule. A new question goes in `questions.md`, never on a page.

## CLAUDE.md: what gives awareness, what goes one click down

CLAUDE.md is a skill that loads by itself, so it is the only awareness an agent has before it asks. That decides the split:

- **In CLAUDE.md (51 lines today, keep it near that):** the laws; the presentation rule; the "ask before" list; the traps that never throw; and **one line per system that has an effect**: its name, the effect in half a sentence, and the link to its page. Today that map names Server, Servex, the ai/ log and the asks ledger. It does not name: `#Page` references (ext/Mention), the page inbox, cards and the object log, the review gate (a page change with no report is refused), the readme chain, budgets and dormancy (Servex), the four screenshot widths. Each of those is one line, or an agent learns it by breaking it.
- **One click down (never in CLAUDE.md):** how to do any of it (the skill), why it is that way (the doc), what it looks like (the page). A rule that changes what an agent does on its first turn belongs in CLAUDE.md; a rule that only matters once it is doing that kind of work belongs in the skill that loads for it.
- **The audit the AI page's CLAUDE.md tab shows:** the live file; for each system named, a link that resolves; for each system that exists and is not named, a proposed line. Drafts go on a card; the owner applies them.

### The seven draft lines (worded 2026-09-30, on the CLAUDE.md card; the owner applies)

1. References: `#Page`, `@agent` and `/path` in any text become icon links (ext/Mention) — use them instead of prose names.
2. The page inbox: a note left on a page reaches the agent that owns it; use it for coordination, never for content.
3. Cards: every task reports on its card on the AI board; the card is what the owner reads, chat replies are not.
4. The review gate: merge refuses a page change that has no review report (Server/review.mjs; shots at 400, 1200, 1920, 3440).
5. The readme chain: read the readmes root to leaf before working, and again when you move directory (/framework/ai/readmes/).
6. Budgets and dormancy: every brief starts with `Budget: $N`; Servex stops an agent over budget and parks a quiet one after three minutes.
7. The four widths: a page is checked at 400, 1200, 1920 and 3440 before it lands.

## Graded rules: probably, always, never (the owner, 2026-09-30)

Every rule on a `/framework/design/` or `/framework/code/` page carries a grade, in the rule's own first word, and the grade is data the review reads:

| Grade | Means | How a rule gets it |
|---|---|---|
| **probably** | the default strength: do this unless you have a reason; a reason in a comment is enough | every new rule starts here |
| **always** / **never** | it has earned it: a named breakage, a date, a link to the task or finding | upgraded only with that line ("earned: 2026-09-19, one backtick inside css() killed every page") |
| (any grade) | can be broken in a rare case **with the reason written where the break is** — a comment on the line, a sentence on the card | the review asks for the reason, not for obedience |

So the page shape is: `**probably** Constrain the container, never the items.` and `**never** A backtick inside css(\`…\`) — earned 2026-08-15, every page went blank.` The old "do's and don'ts" page becomes this list; a rule without a grade is a finding. `questions.md` inherits the grade: a `never` question failing blocks the merge (§2 of the merge proposal); a `probably` question failing asks for the reason.

## What stops an agent writing a style the defaults already cover

The owner saw it today: the chat sidebar was not in Montserrat, so a custom style beat the default somewhere, and nothing caught it. Three things, cheapest first:

1. **The css skill re-prompts the principles every time** (it does now, thin: climb the ladder — nothing → a utility class → a layout word → a component class → the module's own CSS — and stop at the first rung that works). It gains one graded line at the top: *"**probably** write no CSS: the defaults cover fonts, colour, spacing, controls and text; a declaration for any of those needs a one-line reason in the file."*
2. **A check that reads the diff, not the agent's word.** `Server/review.mjs` already diffs the branch; it gains a **defaults census**: every `css(\`…\`)` block and `.css` file in the diff is scanned for declarations the defaults own — `font-family`, `font-size` on text, `color`/`background` on text surfaces, `padding`/`margin` in px, `border-radius`, `line-height` — and each hit without a `/* why: … */` on its line is a finding with the file and line. It is the same shape as the class census `new-css-class` runs; a mass of hits means the default is wrong, not the agents (the DesignTool lesson).
3. **The page measures itself.** One review question, answered by `eval`, not eyes: *is `getComputedStyle(el).fontFamily` Montserrat on the body, the sidebar, every control and every widget on this page?* — the four widths already shoot; this one number catches the font case, and the same call catches colour tokens (`color` equals `var(--ink)`'s value or a `.muted`).

What it does not do: forbid custom CSS. The fifth rung exists; it just has to say why it was reached.

Touches: css skill (one line), `Server/review.mjs` (the census + one eval question), `/framework/code/css/` (the graded list). The sidebar itself: a $3 minion measures the live font on the chat sidebar and fixes it at the cause — a missing font link on that host, a shadow root, or a rule — on todo.md.
