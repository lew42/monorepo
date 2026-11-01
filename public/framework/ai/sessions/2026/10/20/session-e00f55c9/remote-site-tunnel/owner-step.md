Owner step: none. The token works: `node Server/TunnelNamed.mjs setup` added monorepo.lew42.com (DNS CNAME + tunnel ingress to the site gateway on 127.0.0.1:8192) on 2026-11-01; no trycloudflare address is used.

Optional, later, for a real login instead of the key link: dash.cloudflare.com → Zero Trust → pick a team name and the Free plan (Access is "not enabled" on the account today), then add Account → Access: Apps and Policies → Edit to the same token. Until then the site sits behind the secret key link (`site.url` in `%LOCALAPPDATA%\lew42\servex\`, sets a 30-day cookie).
