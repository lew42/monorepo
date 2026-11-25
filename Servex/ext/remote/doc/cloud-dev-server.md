# Can the owner open a cloud session's dev server? (2026-11-25)

**No.** Claude Code cloud sessions (claude.ai/code) run in a container that accepts no
inbound connections. The environment's "Network access" setting (none / limited / full)
only controls what the container can reach going *out*. Anthropic's docs list no preview
URL or port-forwarding feature ([cloud sessions](https://code.claude.com/docs/en/claude-code-on-the-web),
[cloud environments](https://code.claude.com/docs/en/cloud-environments)).

- **Only workaround:** an outbound tunnel from the container (`cloudflared` quick tunnel,
  ngrok). Untested: the container's traffic goes through Anthropic's HTTPS proxy, and
  cloudflared normally needs port 7844. Also the dev server here is started by Servex
  (SERVER GUARD hook blocks `node server.js`), and Servex does not run in a cloud container.
- **What works for live viewing:** run the agent on the owner's PC (Servex + dev server)
  and steer it from the Claude app with Remote Control; the site is already reachable
  from anywhere at `monorepo.lew42.com` ([tunnel.md](tunnel.md)).
- **Cloud sessions fit** background work judged by pushed commits or a Cloudflare preview.

Source: session `687db9c9` (owner asked, 2026-11-25).
