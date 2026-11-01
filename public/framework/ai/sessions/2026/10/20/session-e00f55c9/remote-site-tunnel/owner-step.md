Owner step: none needed to get monorepo.lew42.com working (checked 2026-11-01: the API token already edits the tunnel and DNS; the named tunnel `servex` is healthy). Optional, for a real login instead of a secret link: in dash.cloudflare.com open Zero Trust, pick a team name and the Free plan (Access is "not enabled" on the account today), then edit the API token in My Profile → API Tokens and add Account → Access: Apps and Policies → Edit.

Until then the site sits behind a long secret token (a one-time `?key=` link that sets a cookie), as the brief allows.
