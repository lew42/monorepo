import WebSocket from "ws";

const [,, cookiePath, label] = process.argv;
import { readFileSync } from "node:fs";

function cookieHeader(path) {
    const txt = readFileSync(path, "utf8");
    const line = txt.split("\n").find(l => l.includes("127.0.0.1") || l.includes("localhost"));
    if (!line) return "";
    const cols = line.trim().split("\t");
    return `${cols[5]}=${cols[6]}`.trim();
}

const cookie = cookiePath === "none" ? "" : cookieHeader(cookiePath);
const url = "ws://127.0.0.1:8787/api/room?url=" + encodeURIComponent("/imagine/platform/local/room/probe");

const ws = new WebSocket(url, { headers: cookie ? { Cookie: cookie } : {} });

ws.on("open", () => {
    console.log(label, "OPEN");
    ws.send(JSON.stringify({ text: `hello from ${label}` }));
});
ws.on("message", (data) => console.log(label, "MSG", data.toString()));
ws.on("close", (code, reason) => console.log(label, "CLOSE", code, reason.toString()));
ws.on("error", (err) => console.log(label, "ERROR", err.message));
ws.on("unexpected-response", (req, res) => {
    let body = "";
    res.on("data", c => body += c);
    res.on("end", () => console.log(label, "REJECTED", res.statusCode, body));
});

setTimeout(() => { ws.close(); process.exit(0); }, 2000);
