# Design: the Shell, and the dark dev shell

## The picture

```
 A Shell: four optional regions around the page       The dev shell (Ctrl + \)
 ┌──────────────────────────────────────────┐        ┌──────────────────────────────────────┐
 │ header (thin bar: path, buttons)  opt.   │        │▓ /framework/core/Page/   hold  block ▓│ ← thin, dark
 ├────────┬─────────────────────┬───────────┤        ├▓▓▓▓▓▓▓┬───────────────────┬▓▓▓▓▓▓▓▓▓▓┤
 │ left   │                     │ right     │        │▓ page ▓│                   │▓ chat    ▓│
 │ opt.   │   main: any page    │ opt.      │        │▓ tree ▓│  the site, as-is  │▓ page    ▓│
 │        │   (or another Shell │           │        │▓ struc▓│  (light, pushed   │▓ layout  ▓│
 │        │    → nesting)       │           │        │▓ -ture▓│   inward, never   │▓ ai      ▓│
 ├────────┴─────────────────────┴───────────┤        │▓      ▓│   re-parented)    │▓ (tabs)  ▓│
 │ footer (thin bar)                 opt.   │        ├▓▓▓▓▓▓▓┴───────────────────┴▓▓▓▓▓▓▓▓▓▓┤
 └──────────────────────────────────────────┘        │▓ 1920px · 3 cols · socket ok        ▓│ ← thin, dark
                                                      └──────────────────────────────────────┘
```

## The parts

| Part | What it is | Where | Starts from |
|---|---|---|---|
| **Shell** | `new Shell({ header, left, right, footer, main })`; every region optional, each a function or a View; a missing one takes no space; `main` can be another Shell | `core/Shell/` (new) | `/layouts/shell/` (rail + grip), `core/Sidebar` |
| Region sizes | left and right resizable with `ext/grip`, remembered; header and footer are one thin line (about 2rem) | `Shell.css` | `ext/grip` |
| Dark | `color-scheme: dark` on a region; the site's own `light-dark()` tokens flip. No new colours | one line | how `devbar.css` already does it |
| **Dev shell** | Ctrl + \ puts a dark Shell around the whole site. Left: the page tree and structure. Right: the dev bar's tabs (chat, page, layout, ai). Header: path, hold, block, width. Footer: optional status line | `dev/DevShell/` (new) | `dev/DevBar` tools, moved in |
| The page underneath | not moved: the shell is a fixed frame, and `.app` is pushed in by four tokens (like `--devbar` today). Off = those tokens are 0 = exactly as before | `framework.css` `.app` padding | `--devbar` docking |
| v1 | the old dev bar stays, one click away (a "v1" button in the header) until you approve | `dev/DevBar/` untouched | |
| Demos | L · R · L+R · with/without header+footer · nested · the dev shell on a real page, shot at 400, 1920, 3440 | `/framework/core/Shell/` | |

## Decisions

- **A fixed frame that pushes `.app`, not re-parenting the page into the shell.** Re-parenting the live page would risk breaking every page's height and scroll rules; pushing is how the dev bar already works, and turning it off is removing one class. The general Shell (for demos and any page) is a plain grid you wrap content in.
- **One Shell class for both.** The dev shell is `Shell` with a `frame` option (fixed, around the window), so there is one system, not two.
- **Below 34em** the side regions become sheets you open from the header, as the dev bar does today.

