# PWA: what is next

1. **You test on the phone** (5 minutes): open the [phone checklist](/framework/lab/notifications/phone/), fill the Android column of the [report](/framework/lab/notifications/report/), then Chrome menu → "Install app" on the deployed site and note whether it appears.
2. **Brief to spawn if install works and you want push in production** (a Worker, so larger than a quick fix): move `Server/plugins/Push.js` logic into the Cloudflare Worker with subscriptions in KV or D1 (see [production-stack](/framework/ai/sessions/2026/10/09/session-54d56780/production-stack/)); the page then reads `/push/key` from the Worker. Fence: `Server/plugins/Push.js`, the Worker project, `public/sw.js`. Proof: a real push received on a phone with the tab closed.
3. **Maskable icon** (optional): add a 512 icon with `purpose: maskable` and 20% safe-zone padding so Android does not crop the mark.
