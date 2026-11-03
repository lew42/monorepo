# Drawer query-string bug
## Drawer
- Refreshing with `drawer=AI` open, then closing the drawer, leaves the main column stuck — it doesn't fill the width again [S1, S2, S9]
  - The query string disappears on close, but the main column doesn't resize [S7]
  - Resizing the columns with the resizer first, then closing, still has the same problem [S8]
- Without the query string on refresh, closing works fine — the hamburger goes back to the far right, the space returns, and the main column squeezes down on open [S3]
- The bug doesn't happen every time — one close did resize properly, for an unknown reason [S4, S5, S6]