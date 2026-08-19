# CSS audit — read all of it, 2026-08-18

**The headline: the inline problem is smaller than it looks and the vocabulary problem is bigger.** 43% of the 905 inline calls are token sets (`--gap`, `--column`, `--pad`) — the framework's own documented knob, not rogue CSS. What is genuinely missing is **three words** that four separate files already invented for themselves, and the five-word layout system that shipped 2026-08-17 has **23 call sites** while the string it replaces has **40**. Adding a utility retires nothing; converting the call sites does — `layouts/doc/css-cost.md:42` already wrote that down about `.basis`, and it happened again.

## Numbers

| | |
|---|---|
| `.css` files | 96 under `public/`, 86 under `framework/`, 7,956 lines — but **31 files / 2,208 lines are the `core/new/` sandbox** and 7 / 231 are `ai/` archives. **Framework proper: 48 files, 5,517 lines.** |
| ten largest (proper) | `framework.css` 611 · `core/Page/Page.css` 376 · `ext/AITask/ai.css` 350 · `ext/Panel/templates.css` 336 · `dev/DevBar/devbar.css` 226 · `ext/Panel/toolbar.css` 209 · `ext/catalog/catalog.css` 199 · `ext/DesignTool/DesignTool.css` 187 · `core/Sidebar/Sidebar.css` 187 · `ext/tabs/tabs.css` 177 |
| layers | 1,596 rules: **theme 1,232 (77%)** · site 283 · util 54 · base 27. **Zero unlayered files.** One `!important` in production and it is a *demo of the bad pattern* (`core/new/1/site/motion/reduced/page.js:42`). The layer discipline is clean. |
| three ways CSS gets in | 91 `View.stylesheet(import.meta, …)` calls · 34 modules with `` css(`…`) `` · **905 inline `.style()` call sites** across 176 files (885 grep *lines* — some lines carry two) |
| inline, by declaration | 1,336 declarations. **547 (41%) are custom properties**: `--gap` 273, `--column` 76, `--pad` 65, `--basis` 32, `--measure` 28. **386 calls (43%) set nothing but tokens.** |
| inline, by place | `styles/layouts/` **417 (46%)** · `ext/DesignTool` 98 · rest of `ext/` 96 · `styles/sections/` 69 · `ui/` 59 · `core/` 52 |

**Sample of 130** (every 7th call, file:line order). The brief's four buckets could not hold it, so there are five — the fifth is the point:

| bucket | n | % |
|---|---|---|
| **token tune** — `--gap`/`--column`/`--pad` on a class that already exists. The blessed idiom (`framework.css:492`) | 61 | **47%** |
| **one-off** — measured, computed, or per-instance (`--grip-y` from `clientY`, a drag width from `getBoundingClientRect`) | 28 | 22% |
| **a layout word framework.css lacks** — `scroll`, `fluid`, `stick`, `eyebrow`, a frame, a pill | 26 | **20%** |
| **a class that already exists** — `.gap`, `.pad`, `.wash`, `.surface`, `.flex-1`, `--grow` | 9 | 7% |
| **a component's own look** — belongs in its `` css(`…`) `` | 6 | 5% |

Extrapolated: ~180 of the 905 calls are the missing-word bucket, ~63 are already-a-class. **Only ~27% of inline calls are a defect at all.**

## Duplication + conflict

| what | where | note |
|---|---|---|
| `.page.fill` and `.page.solo` are byte-identical | `core/Page/Page.css:112` · `:241` | two names, one rule. `solo` has **0** call sites; `fill` has 48 |
| the `.app` rail-push formula, twice | `framework.css:181` · `styles/layouts/layouts.css:21` | the second carries a comment saying "keep the two formulas in sync" |
| `--measure: 40em`, three times | `Page.css:21` (region) · `Page.css:79` (page) · `/styles.css:107` (topic) | |
| `--measure: 78em`, twice | `ext/tabs/tabs.css:113` · `ext/toc/toc.css:19` | a magic width with no token |
| `--gutter-x: clamp(2em, 4%, 5em)`, twice | `Page.css:80` · `ext/Doc/Doc.css:16` | Doc's own comment: "the two values must agree" |
| `--radius: 0.5em`, twice | `framework.css:84` · `styles/layers/theme/guide/paper.css:27` | a theme restating the default |
| the card-wall grid template, **12 times** | `framework.css:451`,`:483` · `Page.css:201` · `ext/catalog/browse.css:35` · `ext/AITask/ai.css:53`,`:68` · `ext/DesignTool/DesignTool.css:57`,`:86` · `ext/Panel/display.css:9`,`templates.css:330`,`toolbar.css:186` | **7 of them hardcode a width instead of reading `--column`** |
| the pill — `border-radius: 999px` | `ui/parts.js:15` · `ui/avatar/avatar.js:11` · `ui/badge/badge.js:16` · `ui/timeline/timeline.js:15` · `styles/elements/forms/page.js:8`,`:10` · `styles/layouts/spec/page.js:104`,`:121` · `styles/sections/pricing.js:12` | `.ui-pill` exists; four copies are outside `ui/` |
| the inverse pair `background: var(--ink); color: var(--surface)` | `ui/avatar/avatar.js:15` · `ui/badge/badge.js:7` · `ui/tooltip/tooltip.js:24` | no `.invert` |
| `@layer base, theme, site, util;` restated **37×** | `framework.css:11` calls itself "the ONLY @layer statement on the site" | 34 are `core/new/` standalone sites (fair); `ext/depth/depth.css:7` is not |
| `{ minHeight: "0", overflowY: "auto" }` re-invented as a local `const` | `layouts/anatomy/specs.js:26` · `layouts/screens/specs.js:19` · `layouts/wire/specs.js:37` · `layouts/space/spec.js:40` | four files, same object, no class |
| `--eyebrow` has **no CSS declaration anywhere** | set only in `styles/sections/tone.js:29` (a JS object) · read at `ui/timeline/timeline.js:15` and 20 inline sites | a token only JS can set |
| `band(tone)` — a four-way paint map as a JS object | `styles/sections/tone.js:22`, worn inline by 16 sections | `.section-band` is already a class on every one of them |
| `--measure: none` on a `.page`, twice | `ext/DesignTool/DesignTool.css:77` · `ext/Doc/Doc.css:14` | `styles/doc/layout-system.md:69` says **never** — see the map |
| `--page-pad`, five declarations, no way back | read at `Page.css:95`; set at `Doc.css:15`, `tabs.css:68`, `layouts.css:19`, `DesignTool.css:77`, `demo/app.css:58` | it **inherits** — see the map |
| a rule that is already dead | `ext/AITask/ai.css:155` | `framework.css:534`'s util-layer `:first-child { margin-top: 0 }` did it first, and from a higher layer |

## The interaction map — what a page layout does to its children

The five shells that actually hold pages: the **default `.page` grid** (every page), **`page full fill flex v`** (40 hand-typed), **`.page.topic`** (`/styles.css:107` — every `/framework/` page sits inside one), **`.page.doc-page`** (`ext/Doc` — every module's Docs tab), **`.tab-panel`** (`ext/tabs`).

- **`--page-pad` inherits and has no reset — this is the one real trap.** `Page.css:95` reads `padding: var(--page-pad, var(--pad-y) 0)` and `.page` never declares the token, so any shell that sets it hands it to *every* page nested below, at any depth. `/styles.css:97-106` records the owner hitting exactly this ("there's 0 space between the viewport top and the date header?!" — the topic shell's `--page-pad: 0` had zeroed the inset sitewide) and fixed it by saying `padding: 0` instead. **Three shells still set the token**: `Doc.css:15`, `tabs.css:68`, `layouts.css:19`. Those three are *deliberate* one level down — but a page nested two levels down cannot get its padding back, and `core/new/1/agents/eric/page.js:111` already found the same shape ("unpads ONE level… a tab that has children was simply never tried").
- **`--measure` does not have this problem, and only because `.page` re-declares it** (`Page.css:79`). That asymmetry is the whole lesson: *declared beats inherited*, so a token a shell may retune must be declared on the thing that reads it.
- **`--measure: none` on a grid `.page` silently drops the entire template.** `min(none, …)` is invalid at computed-value time (`ext/demo/app.css:63` documents this in full). `.page.dt-page` (`DesignTool.css:77`) is a grid page that does it — so `.wide` and `.bleed` are **inert on all five DesignTool pages**. Latent, not visible: nothing on them claims those tracks yet. `.page.doc-page` does it too (`Doc.css:14`) and survives only because it also sets `display: flex` on the same rule.
- **`.wide` reaches one level.** `.page > .wide` is a child combinator, so any wrapper (`md()`, `AITask`, `.tab-panel`) claims the track instead of its contents — measured and left alone, `ai/2026-08-17/layout-wave-3/proposal.md`.
- **A nested region must restate the measure tokens or a page pays the sheet twice** — `tabs.css:66` and `demo/app.css:52` say so in their own comments, and `demo/app.css:70` needs a *three-class* selector to reach the page inside because `.page.standard` declares its own.
- **`:has(> .rail)` is unscoped** (`Page.css:142`) so it applies layout containment to whatever holds a rail, which makes that box the containing block for any `position: fixed` descendant — `ext/demo`'s maximised stage, `ext/drawer`, `ext/Panel`'s overlay. Only 7 elements wear `.rail` today, so the blast radius is small; it grows with every new one.
- **`@layer util` beats component CSS**, which is right and bites twice: `framework.css:534`'s bare `:first-child` out-ranks any component's first-child margin, and `.flex > * { margin: 0 }` (`:418`) kills a child's own rhythm — `.measure` survives it only by being declared *after* it on purpose (`:429`).

## Proposal, ranked

**1 · Promote `scroll` `stick` `fluid` to `framework.css` `@layer util`. Cost M — this is tomorrow's job.**
They already exist, as JS declaration-sets, because the vocabulary lacks them (`styles/layouts/space/spec.js:40-42`), and `space/page.js:61` says out loud that promoting them is the owner's call. Four files invented `scroll` independently.
```css
.scroll { min-height: 0; overflow-y: auto; }
.stick  { position: sticky; top: var(--stick, 0); align-self: flex-start; }
.fluid  { flex: 1 1 var(--basis, 24em); min-width: 0; }
```
Retires **62 call sites outright** (24 · 32 · 6, counted not extrapolated) and touches 152 more. `.fluid` is the one `framework.css` most obviously lacks: `.flex-1` is the *zero-basis* fluid track and `.basis` is the *fixed* one — nothing named "fluid with a basis", which is what 35 inline `flex: 1 1 24em` are.

**2 · Make the band tones classes, and give `--eyebrow` a home. Cost S.**
`.section-band` is already on all 16 sections; only the paint is inline. Four rules in `styles/sections/` + one `--eyebrow: var(--prim)` default in `framework.css`. Retires **16 `.style(band(tone))` + 20 inline eyebrow colours**, deletes `band()` from `tone.js`, and lets CSS set a token that today only JS can.

**3 · One word for the app shell. Cost S.**
`c("page full fill flex v")` is typed **40 times**, plus 9 near-variants. `.fill` and `.solo` are the same rule under two names (`Page.css:112`/`:241`) — **delete one**, then let it imply the shell: `.page.solo { --gutter-x: 0px; --pad-y: 0px; display: flex; flex-direction: column; align-self: stretch; overflow: auto; min-height: 100% }`. Five words become one, and the five-word system finally has a user.

**4 · Declare `--page-pad` on `.page`. Cost S, one line.**
`.page { --page-pad: var(--pad-y) 0 }` + `padding: var(--page-pad)`. Declared beats inherited, exactly as `--measure` already does at `Page.css:79`, and the whole class of "a shell's opt-out reached every page under it" closes. Shells opt out with `padding: 0` — the fix `/styles.css:107` already uses. Retires no inline; fixes the trap that has bitten twice.

**5 · `--column` on the seven hardcoded walls, and a `.frame`. Cost S.**
Seven of the twelve card-wall templates hardcode a width; `.grid.auto` + `--column` says it in two words. `.frame { border: 1px solid var(--line); border-radius: var(--radius) }` retires 33 more calls. Promote `.ui-pill` out of `ui/` as `.pill` (9 copies).

**Delete:** whichever of `.fill`/`.solo` loses · `ext/AITask/ai.css:155` · `ext/depth/depth.css:7`'s `@layer` statement · `layouts.css:21`'s copied push formula, replaced by a `--rail-push` token in `framework.css`.

**The scoped-style rule — A what, B where.** *What a thing is* → its own prefixed class in its module's sheet (`ui/` is the model: 19 components, every class `ui-`-prefixed, token-valued, ~15 lines each — the healthiest CSS here). *Where it is* → the container's sheet, never the child's; constrain the container, hand the child a token. A **shell** owns arrangement (`Page.css`), a **module** owns its look, `framework.css` owns words that mean the same thing everywhere. An inline `.style()` is correct for exactly one thing: a value that does not exist until runtime.

**Do not:** ship a class per property. Do not add a word before converting its call sites — three utilities (`.basis`, `.measure`, `--grow`) landed and sat at one or zero users while the hand-rolled copies stayed hand-rolled. **Every item above is half conversion, and the conversion is the half that counts.**
