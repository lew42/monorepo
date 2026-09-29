import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

/* Compress the dev server's text responses — gzip or brotli, node's own `zlib`,
 * no new npm dependency. `express.static` writes straight to the socket; this
 * sits BEFORE it in the middleware chain (Server.js) and, for a file worth
 * compressing, answers the request itself with a pre-compressed buffer instead
 * of letting `next()` reach `express.static` at all.
 *
 * Why this exists: `public/framework/directory.json` is a 3.3MB JSON census of
 * every file in the framework, uncompressed. On localhost that's instant; on
 * the owner's phone Wi-Fi it cost seconds. gzip/brotli takes ~3.3MB of JSON
 * down to under 150KB — see `ai/2026-09-29/slow-card-fix/` for the measurement.
 *
 * ⚠ VERSION 2 (2026-09-29, same day): the first version streamed every request
 * through `zlib.createBrotliCompress()` at brotli's DEFAULT quality — 11, the
 * maximum, meant for a one-time build step, not a request handler — and did it
 * fresh on every single request, including the same ~550 modules on every page
 * load and the 3.3MB directory.json on every AI 2 card open. That put the dev
 * server's threadpool at 350–590% CPU and spun the owner's fans while they were
 * on the live site (servex-mastermind-opus caught it and named the three fixes
 * below). This version:
 *   1. Quality 4 for brotli, level 6 for gzip — the "fast" end of each, not the
 *      "smallest possible" end. Static framework files don't change under load,
 *      so squeezing the last few percent off them isn't worth the CPU.
 *   2. CACHES the compressed bytes per file, keyed by path + mtime + encoding —
 *      a file is compressed once, ever (until it changes), not once per request.
 *   3. Skips anything under 1KB — for a tiny file gzip's own header/footer can
 *      cost more than it saves, and it isn't worth a cache entry either.
 * Only text-ish types are worth compressing at all — images, video and fonts
 * are already compressed and gzipping them again just burns CPU for nothing. */
const PUBLIC = path.resolve("public");
const COMPRESSIBLE = /\.(json|js|mjs|css|html?|md)$/i;
const THRESHOLD = 1024;   // below this, skip compressing — let express.static send it plain

const MIME = {
	".json": "application/json; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".htm": "text/html; charset=utf-8",
	".md": "text/markdown; charset=utf-8",
};

const BROTLI_OPTS = { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } };
const GZIP_OPTS = { level: 6 };

// path -> { mtimeMs, br?: Buffer, gzip?: Buffer }. Unbounded, like express.static's own
// nothing-cached-at-all baseline — the framework tree is a few thousand files, and this
// only ever holds ones actually requested, each at most twice (br + gzip).
const cache = new Map();

export default function compress(req, res, next){
	if (req.method !== "GET" && req.method !== "HEAD") return next();
	if (!COMPRESSIBLE.test(req.path)) return next();
	if (req.headers.range) return next();   // a byte-range request wants the plain bytes it asked for, at the offset it asked for

	const accept = req.headers["accept-encoding"] || "";
	// Prefer brotli (smaller) when the client offers it, else gzip, else pass through untouched.
	const encoding = /\bbr\b/.test(accept) ? "br" : /\bgzip\b/.test(accept) ? "gzip" : null;
	if (!encoding) return next();

	let filePath;
	try { filePath = path.normalize(path.join(PUBLIC, decodeURIComponent(req.path.split("?")[0]))); }
	catch { return next(); }
	if (!filePath.startsWith(PUBLIC)) return next();   // path traversal guard, same rule express.static enforces

	let stat;
	try { stat = fs.statSync(filePath); } catch { return next(); }
	if (!stat.isFile() || stat.size < THRESHOLD) return next();

	let entry = cache.get(filePath);
	if (!entry || entry.mtimeMs !== stat.mtimeMs) { entry = { mtimeMs: stat.mtimeMs }; cache.set(filePath, entry); }

	let buf = entry[encoding];
	if (!buf) {
		let raw;
		try { raw = fs.readFileSync(filePath); } catch { return next(); }
		buf = entry[encoding] = encoding === "br" ? zlib.brotliCompressSync(raw, BROTLI_OPTS) : zlib.gzipSync(raw, GZIP_OPTS);
	}

	res.setHeader("Content-Type", MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream");
	res.setHeader("Content-Encoding", encoding);
	res.setHeader("Content-Length", buf.length);
	res.setHeader("Vary", "Accept-Encoding");
	res.end(req.method === "HEAD" ? undefined : buf);
}
