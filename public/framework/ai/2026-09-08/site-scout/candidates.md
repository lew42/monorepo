# site-scout — sixty candidates for /websites/

51 of 60 sites loaded with a 200 status on the first or second try (the rest hit a bot-check page — 401/403/400 — or, once, a 45-second timeout, and are kept in `candidates.json` with that real status, per the brief).  
25 of 60 do not send a header that blocks an iframe, so they can be shown live in the `/websites/` responsiveness viewer; the other 35 need a screenshot instead.  
**gallery-find** was hardest to fill: land-book.com and awwwards.com/websites/ both refused the fetch (403 / timeout) and godly.website just redirects to recent.design (also 403), so all six of these came from the one gallery that worked, siteinspire.com.

| name | category | expected layout | embed |
|---|---|---|---|
| behance-home (400) | app | 3-cards | allowed |
| codepen-popular (403) | app | 3-cards | blocked |
| github-vscode-repo | app | 2-sidebar | blocked |
| gitlab-explore | app | 2-sidebar | blocked |
| grafana-play-home | app | 2-sidebar | blocked |
| hacker-news-home | app | 1-flow | blocked |
| product-hunt-home (403) | app | 1-centered | blocked |
| reddit-home | app | 3-holy-grail | blocked |
| alistapart-home | blog | 1-centered | blocked |
| astral-codex-ten-home | blog | 1-centered | allowed |
| css-tricks-home | blog | 2-sidebar | blocked |
| josh-comeau-blog | blog | 1-centered | allowed |
| kent-c-dodds-blog | blog | 3-cards | blocked |
| overreacted-blog | blog | 1-centered | allowed |
| simon-willison-blog | blog | 2-sidebar | allowed |
| smashing-magazine-home | blog | 3-cards | blocked |
| django-docs-index | docs | 2-sidebar | blocked |
| kubernetes-docs-home | docs | 3-holy-grail | allowed |
| mdn-css-reference | docs | 3-holy-grail | blocked |
| python-docs-index | docs | 2-sidebar | allowed |
| rust-book-intro | docs | 2-sidebar | allowed |
| svelte-docs-overview | docs | 3-holy-grail | allowed |
| vuejs-guide-intro | docs | 3-holy-grail | allowed |
| wikipedia-web-design | docs | 2-sidebar | allowed |
| cctype-foundry | gallery-find | 3-cards | allowed |
| designmill-home | gallery-find | 3-cards | allowed |
| mocean-home | gallery-find | 1-flow | allowed |
| privy-home | gallery-find | 1-centered | allowed |
| susanne-kaufmann-home | gallery-find | 1-centered | blocked |
| waabi-home | gallery-find | 1-flow | allowed |
| apple-home | marketing | 1-flow | blocked |
| figma-home | marketing | 1-centered | blocked |
| framer-home | marketing | 1-centered | blocked |
| linear-home | marketing | 1-centered | blocked |
| notion-home | marketing | 1-centered | blocked |
| stripe-home | marketing | 1-centered | blocked |
| vercel-home | marketing | 1-centered | blocked |
| webflow-home | marketing | 1-centered | blocked |
| arstechnica-home | news | 2-sidebar | blocked |
| axios-home (403) | news | 1-centered | blocked |
| bbc-news-home | news | 2-sidebar | blocked |
| bloomberg-home (403) | news | 3-cards | allowed |
| guardian-international | news | 3-cards | blocked |
| nytimes-home | news | 2-sidebar | blocked |
| reuters-home (401) | news | 3-cards | blocked |
| verge-home | news | 2-sidebar | allowed |
| allbirds-home | shop | 1-centered | blocked |
| amazon-kindle-product | shop | 2-sidebar | allowed |
| bestbuy-home (0) | shop | 2-sidebar | unknown |
| etsy-home (403) | shop | 3-cards | allowed |
| ikea-home | shop | 3-cards | allowed |
| nike-home | shop | 1-flow | blocked |
| sephora-home (403) | shop | 3-cards | allowed |
| target-home | shop | 3-cards | blocked |
| carbon-design-home | system | 2-sidebar | allowed |
| gov-uk-home | system | 1-centered | blocked |
| material3-home | system | 2-sidebar | allowed |
| salesforce-lightning-home | system | 2-sidebar | blocked |
| shopify-polaris-home | system | 2-sidebar | allowed |
| uswds-home | system | 1-centered | blocked |
