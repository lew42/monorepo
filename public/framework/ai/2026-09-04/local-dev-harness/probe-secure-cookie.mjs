// Isolate: does Chromium store a `Secure` cookie set over plain http://localhost
// at all? (Separate question from cross-port — this is same-origin.)
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import http from "node:http";

const server = http.createServer((req, res) => {
    if (req.url === "/secure") {
        res.setHeader("Set-Cookie", "a=1; HttpOnly; Secure; SameSite=Lax; Path=/");
        res.end("secure set");
    } else if (req.url === "/insecure") {
        res.setHeader("Set-Cookie", "b=2; HttpOnly; SameSite=Lax; Path=/");
        res.end("insecure set");
    } else {
        res.end("ok " + req.headers.cookie);
    }
}).listen(8095);

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto("http://localhost:8095/secure");
console.log("after /secure:", (await page.context().cookies()).map(c => c.name));

await page.goto("http://localhost:8095/insecure");
console.log("after /insecure:", (await page.context().cookies()).map(c => c.name));

await page.goto("http://localhost:8095/check");
const body = await page.textContent("body");
console.log("what the server saw on next request:", body);

await browser.close();
server.close();
