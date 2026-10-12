# AI Sessions tab: cost cards up top, no empty bands, numbers that are always current

## The ask (owner, 2026-10-03, ~5:30 pm, looking at /framework/ai/sessions/ at 3440)
> There are three bands of space, and the scroll area starts way above the data grid. The white card with the data grid is very clean, I really like it, and it lines up with the AI icon in the heading. But two faint gray lines between the top tabs and the white card could just disappear.
> The money: make the dollar sign and value big and bold, formatted correctly; maybe the cents smaller than the dollars; put them on their own little dashboard cards, a horizontal preview rail across the top, instead of one line of plain text. I'm not sure what "$26.65/1%" means.
> The padding on the card is quite big (our percentage padding at maximum at 3000+ px?) and looks lopsided. The date pickers are so wide and don't need to be. "1874 sessions shown" and the Claude / OpenRouter spend seem stale: shouldn't this be computed in real time by node, so whenever something new runs the sessions data updates and the page adds up real-time data? This shouldn't be stale data.

## Seen in a 3440 screenshot (vscode-mastermind)
- Two empty gray bands between the tabs and the card.
- Top line: "$1465.55 Claude · $8.74 OpenRouter this week, plan 55% used — ~$26.65/1%". Below: "1876 sessions shown — $54.22 Claude · $0.00 OpenRouter" for the date range: the two Claude figures don't reconcile on screen, and OpenRouter shows $0.00 in range vs $8.74 this week.
- Role filter: "(unknown)" holds 1767 of 1876 sessions. Start / Stop / Duration read "—" on almost every row. The State column is mostly dots.
- Date inputs stretch the full width.

## Do
1. **Remove the empty bands;** the page scrolls from the card, the tabs stay put.
2. **A row of small stat cards** across the top: Claude this week, OpenRouter this week, plan used %, cost per 1% of the plan (spelled out, e.g. "$26.65 per 1% of your weekly plan"), sessions in range. Big bold dollars, smaller cents. Use or extend an existing stat/pill component (check ux/ and the machine-page brief's pill) rather than new CSS.
3. **One source of truth, current:** every figure computed by the server from the transcripts and usage files, recomputed when a session file changes (the dev server already watches), streamed to the page. Make the week figure and the range figure reconcile, or label clearly what each covers. Find why OpenRouter is $0.00 in range.
4. **Fill the blanks:** derive role (from the session's agent id / role prefix) and Start/Stop/Duration (first and last transcript timestamps) for the "(unknown)" and "—" rows, or say on the page why they can't be.
5. **Compact controls:** date pickers sized to their content. Card padding: the standard token, checked at 1920 and 3440, equal on both sides.
6. Screenshots before/after at 1200, 1920, 3440.

## Fence
The sessions tab files (find them from ai/page.js / ai/sessions), Server/session-cost.mjs or the index it reads, this task dir. Coordinate with the earlier sessions tasks' logs (ai/2026-10-02/session-costs, ai/2026-10-03/sessions-date-homes). NEVER the mcp__playwright tools.
Model: Sonnet. Budget $10.
