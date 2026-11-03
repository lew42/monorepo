# AI inbox: the rail disappears when a card is opened (live bug, 2026-10-13 ~17:35)

Source: ../../requirements-9.md (dictation 11), relayed by mastermind-repo-slim to inbox-data.

> I clicked on a card on the inbox rail. It's this 2026-10-13 page, and it loaded the page and swapped it out, but it removed the inbox's preview rail. When I click on, then I was trying to click on the AI header to kind of go back to the main AI page, and that didn't work. ... on the inbox rail system, we shouldn't get rid of our navigation, our inbox rail. Like, that's like a switcher, and we want the cards to on the left to remain and only open the page on the right.

Deliverables: reproduce on michael/dev; find the cause; fix so the rail stays and only the right side changes; the AI header navigates back; back/reload land in the same place; before/after shots at 1200 and 400 (in this folder).
