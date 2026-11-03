Owner step: none. The token works: `node Server/TunnelNamed.mjs setup` added monorepo.lew42.com (DNS CNAME + tunnel ingress to the site gateway on 127.0.0.1:8192) on 2026-11-01; no trycloudflare address is used.

Optional, later, for a real login instead of the key link: dash.cloudflare.com → Zero Trust → pick a team name and the Free plan (Access is "not enabled" on the account today), then add Account → Access: Apps and Policies → Edit to the same token. Until then the site sits behind the secret key link (`site.url` in `%LOCALAPPDATA%\lew42\servex\`, sets a 30-day cookie).

## When you merge (outside a voice call)

The site is live now, served by a gateway running from the worktree. To land it:

1. Merge: `node Server/merge.mjs C:/Code/lew42/worktrees/remote-site-tunnel` (branch `worktree/remote-site-tunnel`).
2. Restart the monorepo dev server (Servex `restart_server monorepo`) so `Socket.js` reads the remote marker. Pages need no restart.
3. Move the gateway to the main tree. In PowerShell: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8192 -State Listen).OwningProcess`, then `node Server/Tunnel.mjs down`. Servex's keeper starts `up` again within 60 s, and `up` now serves both hosts. This drops the voice app's connector for a few seconds, so never do it during a call.

The phone link (with its key) is in `%LOCALAPPDATA%\lew42\servex\site.url`. Open it once; the phone then stays signed in for 30 days.
