# Now card: tiny top tabs, full bleed

The owner, verbatim: "Can you put everything on this page into a tab system? Like the, so the now card, can we make it without padding, make it full bleed and use like, kind of tiny top tabs to switch between different sections."

Page: /framework/ai2/2026/09/25/now/

1. Every section of the Now card gets its own tab; one shows at a time.
2. Tiny top tabs: a small dense strip.
3. No padding, full bleed.
4. Opt-in per card: a `{"layout": "tabs"}` line in the card's page.jsonl.
5. Routed: the open tab is in the URL.

Fence: public/framework/ai2/card.js, public/framework/ai2/ai2.css, the Now card's page.jsonl (append only), this dir.
