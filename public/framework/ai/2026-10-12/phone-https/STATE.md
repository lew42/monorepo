# STATE — phone-https
- Done: `Server/https-cert.mjs`, `Server/plugins/HttpsLan.js` (merged to michael/dev), try-it.md + https-lan.md updated.
- Proof (private port, headless 400 px, ignoreHTTPSErrors): secure context true, mediaDevices present, no sideways scroll, /servex/api/whisper 200.
- Open: the Whisper proxy (`/whisper/inference`) is open to the whole LAN, no login, now over https too. Not widened.
- Phone address: https://10.0.0.135:13104/framework/ext/Refine/ (live after the monorepo server restart).
