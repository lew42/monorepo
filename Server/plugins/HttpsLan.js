import https from "https";
import HttpsCert from "../https-cert.mjs";

/* A second listener, https, beside the http one, so a phone on the LAN gets a secure context (and its mic).
 * Same Express app, so every route and the Whisper proxy work unchanged. Needs the cert from
 * `node Server/https-cert.mjs`; without it, nothing happens. Port: HTTPS_PORT, else PORT + 10000 (3104 -> 13104).
 * Why a self-signed cert: public/framework/ux/Dictate/doc/https-lan.md */
export default class HttpsLan {

    static setup(server) {
        server.on("listening", ({ port, host }) => {
            const creds = HttpsCert.load();
            if (!creds || process.env.NO_HTTPS) return;
            const https_port = Number(process.env.HTTPS_PORT) || Number(port) + 10000;
            server.https = https.createServer(creds, server.app);
            server.https.on("error", e => console.log(`[https] not listening on ${https_port}: ${e.code || e.message}`));
            server.https.listen(https_port, host, () => console.log(`[https] listening on ${host}:${https_port}`));
        });
    }
}
