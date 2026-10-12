Relayed verbatim from vscode-mastermind, 2026-10-03:

> Small one: owner sees a flash of unstyled text / lost font on reloads of the AI pages.
> core/App awaits fonts + View.stylesheets before inject(), but anything that loads AFTER
> first paint (a card class's stylesheet via dynamic import, page.jsonl replay, the
> live-reload CSS swap) paints before its CSS. Find which on
> /framework/ai/2026/10/03/now/ (headless, record paints with CDP or screenshots at 50ms
> steps), and make late content wait for its own stylesheet before it's appended
> (View.stylesheet returns a promise). One line on your card naming the cause.

Scope: find the actual cause (there may be more than one), fix `View.stylesheet`'s
callers so late-appended content waits for its own CSS, without touching `core/App`'s
own first-paint await path unless it turns out to be part of the bug. Headless
verification only (`mcp__site__shot`, `mcp__site__eval`, `Server/browser.mjs`) — never
`mcp__playwright__*`, which opens a visible window on the owner's screen.
