# Remote access: the site from outside the house: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md).

## Decision (REVISED 2026-10-01 15:20, on the owner's preference): a Cloudflare Tunnel with Cloudflare Access
The owner would rather not sign up for a new service, and wants to learn Cloudflare. **lew42.com's DNS is already on Cloudflare** (nameservers jim/aitana.ns.cloudflare.com), so this needs no new account and costs nothing:
- **Cloudflare Tunnel** (`cloudflared`, free): an outbound-only connector on the PC. There's no port forwarding and no open ports. It maps, for example, `dev.lew42.com` → `http://localhost:8137`.
- **Cloudflare Access** (Zero Trust, free for up to 50 users) in FRONT of it: a login page (a one-time code to the owner's email, or Google). Only the owner gets through. **This is required.** Without it, the dev server and Servex (which can run commands) would be on the public internet.
- It's a real HTTPS name, so the mic works on the phone with no Chrome flag.
- It only runs while the PC is on and `cloudflared` is running. It's a Windows service and can be stopped any time, with no monthly bill to forget.

**Alternative (rejected):** Tailscale. It's free and very simple, but it's a new service and an app on every device. The owner prefers Cloudflare.

## Owner steps (about 10 minutes, once): only the logins
1. Run `winget install Cloudflare.cloudflared`, then `cloudflared tunnel login`. A browser opens: pick lew42.com.
2. In the Cloudflare dashboard → Zero Trust, accept the free plan if asked (no card needed for the free tier).
3. Then tell @vscode-mastermind, or the watcher will notice `cloudflared`.

## Agent steps (after the owner's steps)
1. `cloudflared tunnel create monorepo`, then a config mapping `dev.lew42.com` → `http://localhost:8137` (plus a path or host for Servex if the phone needs it). DNS: `cloudflared tunnel route dns monorepo dev.lew42.com`.
2. **Before the tunnel serves anything:** a Cloudflare Access application on `dev.lew42.com`, with the policy "emails = the owner's". Verify that a logged-out browser gets the login page, not the site.
3. Run cloudflared as a service. Let the tunnel's requests through the LAN-only gates (`Server/plugins/MCP.js` `lan()`/`safe_host()`, `Server/plugins/Ask.js`, `ext/drawer/tabs.js` DEV), but ONLY when the `Cf-Access-Jwt-Assertion` header is present and valid (Cloudflare's signed login proof), never just because of the host name.
4. Test from the phone on cellular (Wi-Fi off): the login, the site, the ✦ rail and the mic.
5. Write one line in the root readme ("Remote: https://dev.lew42.com, behind Cloudflare Access") and save it to memory.

