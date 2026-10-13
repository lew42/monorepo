# Inbox ranking: new things show up at once, important things stay up

One function, `Inbox.rank(item, now)` (`Inbox.js`): a bigger number sits higher. Rows are sorted by it; `inbox_order` (`ai/rail/inbox.js`) calls it too. The demo at `/framework/ux/Inbox/` shows each row's numbers beside the list.

**rank = importance + recency boost** (+10 more if the owner has not opened it)

1. **Importance** is the row's `score` if it has one, else a weight by kind: needs-you 100, risk 97, decision 94, request 80, question 75, task 60, note 40, landed 30. An unopened `owner_note` stays pinned at 100 (needs-you, then risk, then decision break ties), as before. Example: a landed task scores 30, an open task 60.
2. **New floats to the top.** Under 30 minutes old: boost 201 falling to 101, so it beats even a pinned note. Example: a 3-minute-old note (40 + 191 = 231) sits above a pinned risk from 5 hours ago (100 + 24 = 124).
3. **Then it decays.** After 30 minutes the boost is at most 30 and shrinks to 0 over 24 hours. Example: a 6-hour-old decision is 94 + 23 = 117.
4. **The owner's state sits below everything.** An opened row is divided by 100 (it falls beneath every unopened row); an archived row is -1.

Visible cues (same row component, `Rail.row_head`): a **new** mark and the age ("4 min") for rows under 30 minutes, and the owner-note kind (`risk`) as a small word. The score floor (default 90) never hides a new row.
