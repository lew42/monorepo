# The UI skill system: a proposal

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
