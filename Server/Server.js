import Events from "./Events.js";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from 'url';
import compress from "./compress.js";

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
        this.app.use(express.static("public", { redirect: false }));

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
    }
}
