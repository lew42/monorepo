# Porting the July 2026 comp

`Frame 14643`, the five `app-class-*` comps (overview / api-reference / source-code /
tabbed ×2).

## The comp is a screen. What of it is a theme?

The frame contains a sidebar, a breadcrumb topbar with a version pill, three cards, a tab
bar, a terminal window with line numbers, and a prev/next footer — none of which a theme
is allowed to name. It also contains four colours, a typeface and a type scale, which are
exactly what a theme *is*.

**Verdict: split on vocabulary vs. values, and only the values landed here.**

| in the comp | where it went |
|---|---|
| `prim` `dark` `med` `light`, Montserrat, the 6-level scale, the radius | `lew42.css` |
| sidebar groups, per-item icons, active chevron | `core/Sidebar` — structure it genuinely lacked |
| white-vs-black sidebar | **one token**, `--sidebar-bg` |
| cards, tab bar, terminal window, version pill, prev/next | **not built** |

The test the port had to pass: *does `lew42.css` contain a selector naming a component
class?* It does not. Every time it wanted to, that component was missing a token and the
token went into the component.

## Figma's variable names are not our token names

The file defines `prim` `dark` `med` `light`. Only the first survived as-is.

| Figma | here | why not the literal name |
|---|---|---|
| `prim #ff8f60` | `--prim` | already ours, already this colour (`m_svg.svg` is `#FF8F60`) |
| `dark #3f3f3f` | `--ink`, `--bg` | it is *body text* and *the dark surface* — two decisions wearing one hex |
| `med #737373` | `--subtle` | same decision, existing name |
| `light #e6e6e6` | `--line`, `--wash` | hairlines and fills are different jobs at the same value **today** |

**A token names a decision, not a value.** `--light` would be a lie the moment `.dark` is
on the element — which is the whole reason the token set is worded the way it is.
Importing Figma's names verbatim would have created four synonyms for tokens that already
existed, and no way to tell which of the two jobs `--light` was doing at any call site.

## The type scale — tokens, or a rule block?

**Options.** (a) Add `--h1-size`, `--h1-weight`, … to `framework.css` and set values
here. (b) Write `.theme-lew42 :is(h1, .h1) { … }` — ladder rung 3.

(a) is the doctrine-preferred direction (*de-escalate upstream*), but it means **eight new
tokens each replacing exactly one hardcode**, against a stated bar of *"a token needs an
existing hardcode to replace, ideally several."* It also puts a theme's most
characteristic decision behind a layer of indirection: `--h1-size: 3em` says less than
`font-size: 3em` does.

(b) is explicitly legal — rung 3 is *"a rule on generic HTML"*, and restyling generic
elements is precisely a theme's job. `terminal.css` already carries one.

**Verdict: (b).** Revisit if a second theme wants the same eight knobs; two themes
restating the scale is the signal that it should have been tokens, and one is not.

The cost, recorded honestly: `.theme-lew42 h1` is specificity (0,2,0), so it also
out-ranks any *component* rule that sizes a heading.

## Known divergences from the comp

Small, deliberate, listed so nobody re-derives them as bugs.

- **`h2` keeps its underline.** The comp rules under the *title block* instead. Removing
  it is a change to every page on the site, not a theming call.
- **Sizes are `em`, not the comp's px.** The comp is a fixed 1440; `body` is a clamp, so
  the whole scale rides the viewport instead of pinning one width's pixels everywhere.
- **The active chevron is `›`, not `chevron_right`.** `Sidebar.css` must not depend on a
  font the app may never have loaded, or an unstyled sidebar reads "chevron_right" down
  its margin.

## Where the font call sits changed when the theme went site-wide

It was on the one page that used the theme, because 166KB (38 Montserrat + 128 Material
Icons) on every route for one page is a bad trade. Now every route wears the theme, so
the reason evaporated and it moved to `app.js`:

```js
config(){ lew42(this); }
```

The tab bar in the comp is worth one note: it is not a fresh design.
the legacy `TabPager.css` had `.tab-bar` / `.tab`, and `Page.tabs()` still exists (in
`ext/tabs/` now). That is a *revival* question, not a theming one.
