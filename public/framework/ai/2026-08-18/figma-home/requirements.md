# Minion A — the owner's homepage, desktop AND mobile, one responsive implementation

The ask, verbatim from `figma/wave-1.md`:

> **You own both, because the transition between them is the actual work.** …
> This is the owner's own homepage and the highest-stakes design on the list. The owner:
> *"getting them to flow properly might be tricky (although, we have `.flex.auto`, etc, which makes
> it pretty easy)."* **Prove or refute that sentence with measurements.** … Aim for that:
> **one class string per band, not two drawings.**
>
> - A band that genuinely needs a query is a **finding** — say which band and why, do not hide it.
> - Nine bands is a lot: build them as separate pieces, then assemble the page. Say so in your report.
> - Text may be rewritten to say something true about this framework. Encouraged.
> - Home: `public/framework/styles/layouts/home/` (new dir + one word in `BANDS`).

Figma: `23-181` (desktop, 1920×7350) · `23-1144` (mobile, 375×7130), file `0rZv3Z6Hnqkxa2UQJ5xOOG`.

## Scope

Eleven bands, not nine — the survey undercounted. Desktop has a **second Services-Section**
(`32:1277`, header-left / cards-right) and a **Highlight-Section** (`19:1078` / `23:318`) that
the survey's nine-band list omitted. Mobile has ten (one Services).

## Fences — other agents are live

- Owned: `public/framework/styles/layouts/home/**`, this task dir, one `BANDS` word in
  `styles/layouts/page.js`, an append to `figma/questions.md`.
- **Never touch:** `framework.css`, `css-scopes.txt`, `ext/CSSDoc/`, `styles/elements/code/`,
  `styles/layouts/wire/`, `styles/layouts/anatomy/` (Minion B).

## Done means

- One `layout()`, no media query unless a band earns one and the finding is written down.
- Headless at 400 / 1280 / 1920 / 3440, `scrollWidth === clientWidth` asserted at each, zero
  console errors.
- Token spend reported.
