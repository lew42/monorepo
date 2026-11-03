"""recite-server: text in, speech out. The reverse of whisper-server.

One small HTTP server around Kokoro-82M (kokoro-onnx), started and watched by
Servex the way it watches whisper-server (Servex/ext/recite/recite.js).
The site reaches it through the dev server's same-origin proxy at /recite/*
(Server/plugins/Recite.js), so a phone on the LAN or the tunnel can use it.

Routes (all answer JSON on error, one plain line in "error"):
  GET  /health            {ok, model, provider, voices, sample_rate}
  GET  /voices            {voices: ["af_heart", ...]}
  POST /speak             body {text, voice?, speed?} -> audio/wav (16-bit mono)
  GET  /speak?text=&voice=&speed=   the same, for a quick test in a browser tab

Run by hand:  <venv>/Scripts/python.exe recite_server.py --port 8177 --models <dir>
"""
import argparse
import io
import json
import os
import sys
import threading
import time
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import numpy as np
from kokoro_onnx import Kokoro

MAX_CHARS = 2000          # one request is one chunk (a sentence or a paragraph); the client splits longer text
DEFAULT_VOICE = "af_heart"
# A Kokoro voice id's first letter is its language: af_heart is American English, bm_george British, and so on.
LANGS = {"a": "en-us", "b": "en-gb", "e": "es", "f": "fr-fr", "h": "hi", "i": "it", "j": "ja", "p": "pt-br", "z": "cmn"}


def log(msg):
    print(f"[recite] {msg}", flush=True)


class Engine:
    """The loaded model, and the one lock every synthesis call takes (an ONNX session is not shared across threads here)."""

    def __init__(self, models):
        t = time.time()
        self.kokoro = Kokoro(os.path.join(models, "kokoro-v1.0.onnx"), os.path.join(models, "voices-v1.0.bin"))
        self.voices = sorted(self.kokoro.get_voices())
        try:
            self.provider = self.kokoro.sess.get_providers()[0]
        except Exception:
            self.provider = "unknown"
        self.lock = threading.Lock()
        log(f"model loaded in {time.time() - t:.1f}s on {self.provider}, {len(self.voices)} voices")

    def speak(self, text, voice, speed):
        if voice not in self.voices:
            raise ValueError(f'no voice called "{voice}" (GET /voices lists them)')
        with self.lock:
            t = time.time()
            samples, rate = self.kokoro.create(text, voice=voice, speed=speed, lang=LANGS.get(voice[0], "en-us"))
            took = time.time() - t
        pcm = (np.clip(samples, -1, 1) * 32767).astype("<i2").tobytes()
        buf = io.BytesIO()
        with wave.open(buf, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(rate)
            w.writeframes(pcm)
        seconds = len(samples) / rate
        log(f"{voice}: {len(text)} chars -> {seconds:.1f}s audio in {took:.2f}s")
        return buf.getvalue(), seconds, took


class Handler(BaseHTTPRequestHandler):
    engine = None

    def log_message(self, fmt, *args):   # the default prints every request to stderr; Servex logs our own lines instead
        pass

    def send(self, code, body, kind="application/json", extra=None):
        if isinstance(body, (dict, list)):
            body = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Expose-Headers", "X-Recite-Seconds, X-Recite-Took")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/health":
            e = self.engine
            return self.send(200, {"ok": True, "model": "kokoro-82m (onnx)", "provider": e.provider, "voices": len(e.voices), "sample_rate": 24000})
        if url.path == "/voices":
            return self.send(200, {"voices": self.engine.voices})
        if url.path == "/speak":
            q = {k: v[0] for k, v in parse_qs(url.query).items()}
            return self.speak(q)
        self.send(404, {"error": f"no route {url.path} (try /health, /voices, /speak)"})

    def do_POST(self):
        if urlparse(self.path).path != "/speak":
            return self.send(404, {"error": "POST /speak only"})
        try:
            n = int(self.headers.get("Content-Length") or 0)
            q = json.loads(self.rfile.read(n) or b"{}")
        except Exception as e:
            return self.send(400, {"error": f"body is not JSON: {e}"})
        self.speak(q)

    def speak(self, q):
        text = str(q.get("text") or "").strip()
        if not text:
            return self.send(400, {"error": "no text to speak"})
        if len(text) > MAX_CHARS:
            return self.send(413, {"error": f"text is {len(text)} chars; send at most {MAX_CHARS} per request (Recite splits by sentence)"})
        try:
            speed = float(q.get("speed") or 1.0)
            wav, seconds, took = self.engine.speak(text, str(q.get("voice") or DEFAULT_VOICE), max(0.5, min(2.0, speed)))
        except ValueError as e:
            return self.send(400, {"error": str(e)})
        except Exception as e:
            log(f"speak failed: {e}")
            return self.send(500, {"error": f"synthesis failed: {e}"})
        self.send(200, wav, "audio/wav", {"X-Recite-Seconds": f"{seconds:.3f}", "X-Recite-Took": f"{took:.3f}"})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8177)
    ap.add_argument("--models", default=os.path.join(os.environ.get("LOCALAPPDATA", ""), "lew42", "recite", "models"))
    a = ap.parse_args()
    try:
        Handler.engine = Engine(a.models)
    except Exception as e:
        log(f"could not load the model from {a.models}: {e}")
        sys.exit(2)
    server = ThreadingHTTPServer((a.host, a.port), Handler)
    log(f"listening on http://{a.host}:{a.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
