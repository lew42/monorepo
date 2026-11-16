// node Servex/ReverseProxy.test.mjs: the proxy's per-project prefix routes. Two stand-in servers (the project, its api service) behind one proxy.
import assert from "node:assert/strict";
import http from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import ReverseProxy from "./ReverseProxy.js";

const listen = server => new Promise(done => server.listen(0, "127.0.0.1", () => done(server.address().port)));
const backend = label => {
    const server = http.createServer((req, res) => res.end(`${label} ${req.url} host=${req.headers.host}`));
    new WebSocketServer({ server }).on("connection", ws => ws.send(`${label} socket`));
    return server;
};
const site = backend("site"), api = backend("api");
const ports = { app: await listen(site), "app-api": await listen(api) };

const proxy = new ReverseProxy({ port: 0, ports, prefixes: { app: [{ prefix: "/api", name: "app-api" }] } });
await new Promise(r => proxy.server.listening ? r() : proxy.server.once("listening", r));
const at = proxy.server.address().port;

const get = (path, host = "app.localhost") => new Promise((done, fail) =>
    http.get({ host: "127.0.0.1", port: at, path, headers: { host } }, res => { let t = ""; res.on("data", c => t += c); res.on("end", () => done(t)); }).on("error", fail));

assert.equal(proxy.name({ url: "/api/x", headers: { host: "app.localhost" } }), "app-api");
assert.equal(proxy.name({ url: "/api?a=1", headers: { host: "app.localhost:80" } }), "app-api", "a bare prefix and a query still match");
assert.equal(proxy.name({ url: "/apix", headers: { host: "app.localhost" } }), "app", "a prefix is a path segment, not a string prefix");
assert.equal(proxy.name({ url: "/api/x", headers: { host: "other.localhost" } }), "other", "only the project that lists the prefix has it");

assert.equal(await get("/api/me?a=1"), "api /api/me?a=1 host=app.localhost", "the api path reaches the service, path and Host unchanged");
assert.equal(await get("/index.html"), "site /index.html host=app.localhost", "everything else reaches the project");

const socket = async path => new Promise((done, fail) => {
    const ws = new WebSocket(`ws://127.0.0.1:${at}${path}`, { headers: { host: "app.localhost" } });
    ws.on("message", data => { ws.close(); done(String(data)); });
    ws.on("error", fail);
});
assert.equal(await socket("/api/room"), "api socket", "a WebSocket upgrade under the prefix reaches the service");
assert.equal(await socket("/live"), "site socket", "a WebSocket elsewhere reaches the project");

for (const s of [proxy.servers, site, api].flat()) s.close();
proxy.proxy.close();
console.log("ReverseProxy.test ok");
process.exit(0);
