// Dev-only sub-site server for new/0. Not part of the deployed site.
//
//   node public/framework/core/new/0/server.js        (port 8200)
//
// Serves site/ as the web root, falling back to the repo's public/ so the sketch
// can import the real /framework/core/View/View.js. Everything without a file
// extension falls back to site/index.html — the SPA fallback, which is what lets
// /docs/intro/ be a real url with no file behind it.

import Server from "../../../../../Server/Server.js";
import DevSocket from "../../../../../Server/plugins/DevSocket/DevSocket.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(here, "site");
const repo = path.resolve(here, "../../../..");        // -> public/
const root = path.resolve(here, "../../../../..");     // -> the repo root

// LiveReload does chokidar.watch("public"), relative to the working directory.
// Without this it watches nothing at all, silently.
process.chdir(root);

class ZeroServer extends Server {

	initialize_express(){
		this.express = express;
		this.app = express();
		this.router = express.Router();

		this.app.use(express.static(site, { redirect: false }));
		this.app.use(express.static(repo, { redirect: false }));
		this.app.use(this.router);

		this.app.use((req, res) => {
			if (/\.\w+$/.test(req.path)) return res.status(404).end();
			res.sendFile(path.join(site, "index.html"));
		});
	}

	listen(port = process.env.PORT || 8200, host = "0.0.0.0"){
		return super.listen(port, host);
	}
}

// Registered on THIS class, not on Server — Events gives every subclass its own
// static _events, so the other dev servers' plugin lists are untouched.
ZeroServer.use(DevSocket);

new ZeroServer();

console.log(`new/0 → http://localhost:${process.env.PORT || 8200}/`);
