import Events from "./Events.js";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from 'url';

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

        // serve static files before fallback
        this.app.use(express.static("public", { redirect: false }));

        // hook point for subclasses/plugins to add routes before the fallback
        this.app.use(this.router);

        // if static request fails, fallback to index.html
        this.app.use((req, res, next) => {
            console.log("req.path", req.path);

            // If this ends in ".ext", let it 404
            if (/.+\.[a-zA-Z0-9]+$/.test(req.path)) {
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
