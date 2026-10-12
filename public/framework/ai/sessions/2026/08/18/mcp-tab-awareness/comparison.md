# `site` vs Playwright MCP vs a Chrome DevTools MCP

Asked during the task; **written up, not acted on**. The verdict is keep `site`, and
borrow one idea.

## What each one is

| | `site` (ours) | Playwright MCP | Chrome DevTools MCP |
|---|---|---|---|
| talks to | **the owner's real tab**, over our socket | a browser it launched | a browser it launched, or Chrome started with `--remote-debugging-port` |
| how it reads the page | `eval` — JS at global scope | accessibility snapshot + locators | the CDP domains |
| sees live state | **yes** | no | only if attached to the real Chrome |
| clicks | no (an `eval` dispatches untrusted events) | yes, real input | yes, real input |
| cost | a socket round trip | a browser process | a browser process, or launch flags |

## Why `site` stays

The whole value is the first row. `eval` reaches the page **as it actually is right
now** — a panel dragged half-open, a `sessionStorage` claim, an editor mid-edit, a
socket already connected. Every launcher-based tool starts from a cold `goto`, which
is a different page that happens to share a URL. `Shot.js` already documents this from
the other side: *dragged-open state is not what it photographs*.

It is also ~150 lines with no dependency and no driver, against a browser process per
call. For "what is this element's computed width", that is the right trade.

## What the others would actually buy

Worth knowing, none of it worth building today:

- **`Emulation.setDeviceMetricsOverride`** — resize the *viewport* without touching the
  window. The DesignTool measures widths by sizing an iframe; this is the real thing,
  and it is the one capability that would change how the layout work is done.
- **`Emulation.setFocusEmulationEnabled` / `Page.setWebLifecycleState("active")`** —
  make the renderer treat a background tab as visible, so rAF and ResizeObserver keep
  firing. This is the only thing that *fixes* the hidden-tab problem rather than
  reporting it — but it needs Chrome launched with `--remote-debugging-port`, i.e. the
  owner changing how they start their browser. That is the price, and it is why the
  status line is the answer for now.
- **`CSS.getMatchedStylesForNode`** — matched rules with origin and specificity,
  natively. `ext/CSSDoc` reconstructs a version of this from `getComputedStyle`;
  CDP hands over the cascade itself.
- **Real input events, `Accessibility.getFullAXTree`, network throttling and
  interception, tracing.** All genuinely out of reach of a JS eval.

## Verdict

Keep `site`. It owns something neither alternative can reach — the live tab — and that
is precisely what the layout and panel work needs.

Revisit if two things become true at once: the owner is willing to start Chrome with
`--remote-debugging-port`, and geometry-under-emulated-widths becomes the bottleneck
again. At that point the shape is **not** replacing `site` but adding a fourth tool
beside it, backed by `connectOverCDP` to the same browser — so `eval` keeps the live
state and CDP supplies focus emulation and viewport override on the tab already claimed.

Until then the cheap 90%: the per-eval state line (built), and `shot` for anything
frame-loop-driven.
