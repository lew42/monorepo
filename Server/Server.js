import Events from "./Events.js";
import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import compress from "./compress.js";
import TaskDirs from "./TaskDirs.mjs";
import CardDir from "../public/framework/ai/cards/CardDir.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Server extends Events {

    initialize() {
        this.initialize_express();
        this.emit("express");

        // override point for SSL plugin
        this.initialize_http();
        this.emit("http");

        this.listen();
    }

    initialize_express() {
        this.express = express;
        this.app = express();
        this.router = express.Router();

        // Compress before static, so it can wrap the response static is about to
        // write — see compress.js. Directory.js writes `public/framework/directory.json`
        // uncompressed at 3.3MB; this is what makes it small on the wire.
        this.app.use(compress);

        // serve static files before fallback
        // Reload speed (2026-10-05, ai/sessions/2026/10/05/mobile-reload-speed/mobile-reload-speed/): express.static's
        // own `send` package already answers a matching If-None-Match with 304 — the gap
        // was compress.js (above), which used to skip that for every file it handles.
        // `cacheControl`/`etag` stay at their defaults (true): this only overrides the
        // header text so every static file says "always ask first", matching compress.js.
        this.app.use(express.static("public", { redirect: false, setHeaders: res => res.setHeader("Cache-Control", "no-cache") }));

        // A finished task moved into its session folder (Server/TaskDirs.mjs): its old address keeps serving the files from the new place.
        this.app.use((req, res, next) => { const f = TaskDirs.alias(decodeURIComponent(req.path)); if (f && fs.existsSync(f) && fs.statSync(f).isFile()) return res.sendFile(f, { dotfiles: "allow", headers: { "Cache-Control": "no-cache" } }); next(); });

        // An Inbox card's folder moved into the sessions store (ai/cards/CardDir.js, one tree 2026-10-13): an old file url
        // /framework/ai/2026/10/13/<card>/<file> keeps serving from the new place. A page url (no file) falls through to the app.
        this.app.use((req, res, next) => { const p = decodeURIComponent(req.path); if (!/^\/framework\/ai\/\d{4}\//.test(p) || p.includes("..")) return next(); const f = path.join(__dirname, "../public", ...CardDir.site(p).split("/").filter(Boolean)); if (fs.existsSync(f) && fs.statSync(f).isFile()) return res.sendFile(f, { dotfiles: "allow", headers: { "Cache-Control": "no-cache" } }); next(); });

        // hook point for subclasses/plugins to add routes before the fallback
        this.app.use(this.router);

        // if static request fails, fallback to index.html
        this.app.use((req, res, next) => {
            console.log("req.path", req.path);

            // If this ends in ".ext", let it 404 — UNLESS the path contains "/fs/":
            // that segment only ever means the site's own dynamic file-browser route
            // (core/Page/Page.class.js's fs_folder() seam, dev server only, never a
            // real static file one directory below), so a url built by hand with no
            // trailing slash still reaches the app instead of a bare, silent 404.
            // file_link() itself always writes the trailing slash; a person typing a
            // url by hand often won't (the owner's own example has none, 2026-09-29:
            // "anything can link blindly to <any path>/fs/<file>").
            if (/.+\.[a-zA-Z0-9]+$/.test(req.path) && !req.path.includes("/fs/")) {
                return res.status(404).end();
            }

            res.sendFile(path.join(__dirname, '../public', 'index.html'), { dotfiles: 'allow' });

        });
    }

    initialize_http() {
        this.http = http.createServer(this.app);
    }

    listen(port = process.env.PORT || 80, host = process.env.HOST || '0.0.0.0') {
        this.http.listen(port, host, () => {
            console.log(`Server listening on ${host}:${port}`);
            this.emit("listening", { port, host });
        });
        this.idle_exit();
    }

    /* A worktree's dev server (worktree-up sets IDLE_EXIT_MIN) ends itself after that many minutes with no
     * HTTP request, so an abandoned one never lingers. Under the server.js supervisor it asks the supervisor
     * to stop (a bare exit would be respawned); bare, it exits. Server/doc/worktree-servers.md. */
    idle_exit(){
        const min = Number(process.env.IDLE_EXIT_MIN);
        if (!(min > 0) || process.env.BOOT_TEST) return;
        let last = Date.now();
        this.http.on("request", () => { last = Date.now(); });
        setInterval(() => {
            if (Date.now() - last < min * 60000) return;
            console.log(`[idle] no request for ${min} min — stopping this worktree server`);
            if (process.send) process.send({ idle_exit: true }); else process.exit(0);
        }, 60000).unref();
    }
}
