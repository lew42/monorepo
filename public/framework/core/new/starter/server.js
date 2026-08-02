// Dev-only sub-site server for new/starter. Not part of the deployed site.
//
//   node public/framework/core/new/starter/server.js        (port 8100)
//
// Serves site/ as the web root, falling back to the repo's public/ so the
// sketch can import the real /framework/core/View/View.js. Everything without
// a file extension falls back to site/index.html, same as the main server.
//
// Live reload is the repo's real DevSocket plugin, not a copy: chokidar watches
// public/, and every change rpc's reload() to each connected browser. The client
// half is /framework/dev/Socket/Socket.js, opted into by site/app.js.

import Server from "../../../../../Server/Server.js";
import DevSocket from "../../../../../Server/plugins/DevSocket/DevSocket.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(here, "site");
const repo = path.resolve(here, "../../../..");        // -> public/
const root = path.resolve(here, "../../../../..");     // -> the repo root

// LiveReload does chokidar.watch("public"), which is relative to the working
// directory. Without this, running the server from any other directory watches
// nothing at all — and does it silently, which is the worst way to fail.
process.chdir(root);

class StarterServer extends Server {

	// site/ first, then public/, then the SPA fallback — the base class hardcodes
	// public/ and ../public/index.html, which is the whole reason this overrides.
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

	listen(port = process.env.PORT || 8100, host = "0.0.0.0"){
		return super.listen(port, host);
	}
}

// Registered on THIS class, not on Server — Events gives every subclass its own
// static _events, so the main dev server's plugin list is untouched.
StarterServer.use(DevSocket);

new StarterServer();

console.log(`new/starter → http://localhost:${process.env.PORT || 8100}/`);
