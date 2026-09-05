import WebSocket from "ws";
const ws = new WebSocket("ws://127.0.0.1:8787/");
ws.on("open", () => console.log("OPEN (unexpected)"));
ws.on("close", (code, reason) => console.log("CLOSE", code, reason.toString()));
ws.on("error", (err) => console.log("ERROR", err.message));
ws.on("unexpected-response", (req, res) => {
  let body = "";
  res.on("data", c => body += c);
  res.on("end", () => console.log("REJECTED", res.statusCode, body.slice(0,200)));
});
setTimeout(() => process.exit(0), 3000);
