// Makes a self-signed https certificate for the LAN IP + localhost, with the openssl that ships in Git Bash.
// Files go to %LOCALAPPDATA%/lew42/https/ (never the repo). Safe to run again: it keeps a cert that already exists.
// Decision and the mkcert alternative: public/framework/ux/Dictate/doc/https-lan.md
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";

export default class HttpsCert {
    static dir = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".local", "share"), "lew42", "https");
    static key = path.join(this.dir, "key.pem");
    static cert = path.join(this.dir, "cert.pem");

    static lan_ips() {
        return Object.values(os.networkInterfaces()).flat().filter(i => i.family === "IPv4" && !i.internal).map(i => i.address);
    }

    static exists() { return fs.existsSync(this.key) && fs.existsSync(this.cert); }

    // { key, cert } for https.createServer, or null when none has been made yet
    static load() { return this.exists() ? { key: fs.readFileSync(this.key), cert: fs.readFileSync(this.cert) } : null; }

    static make() {
        if (this.exists()) return false;
        fs.mkdirSync(this.dir, { recursive: true });
        const san = ["DNS:localhost", "IP:127.0.0.1", ...this.lan_ips().map(ip => "IP:" + ip)].join(",");
        const openssl = ["C:/Program Files/Git/usr/bin/openssl.exe", "openssl"].find(p => p === "openssl" || fs.existsSync(p));
        // MSYS would rewrite the leading "/CN=" as a path, so the subject is passed with MSYS_NO_PATHCONV
        execFileSync(openssl, ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "825",
            "-keyout", this.key, "-out", this.cert, "-subj", "/CN=lew42-dev", "-addext", `subjectAltName=${san}`],
            { stdio: "pipe", env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
        return true;
    }
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
    const made = HttpsCert.make();
    console.log(made ? "made" : "kept", HttpsCert.cert, "for", HttpsCert.lan_ips().join(", "));
}
