# sessions-fixes — state
1. 404s: the rail (`ai/rail/groups.js` `day()`) probed `ai/<date>/` for days the ai/ index doesn't name; now skips them. Cause was the old flat path. 
2. 3440: `sessions.css` capped the grid at 110rem; cap dropped and name column is `1fr` (`AISessionsPage.WIDTHS`).
3. 400: `ux/Inbox/Inbox.css` tab bar now wraps.
Shots: shots/before-*.png, after-*.png (400, 3440 before; 400, 1200, 1920, 3440 after, CSS-injected against the live site).
