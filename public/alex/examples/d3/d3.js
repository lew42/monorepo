import { View } from "/app.js";

/* Submodules, not `d3` — 25KB gzipped against 95KB. Exact versions, so the CDN
 * can't change the app under us. And esm.sh's already-resolved path: the short
 * url answers with a 90-byte re-export, one whole round trip before any d3. */
const modules = {
	scale: "https://esm.sh/d3-scale@4.0.2/es2022/d3-scale.bundle.mjs",
	shape: "https://esm.sh/d3-shape@3.2.0/es2022/d3-shape.bundle.mjs",
};

// Start the download without waiting for it. Called at module scope by a page,
// this puts the bytes in flight while the Router is still walking the url.
export function preload(){
	for (const url of Object.values(modules))
		new View({ tag: "link", capture: false })
			.attr("rel", "modulepreload").attr("href", url)
			.append_to(document.head);
}

/* No cache here on purpose: `import()` is keyed by url, so the module registry
 * already is one. Rejects if the CDN is unreachable — see Chart.failed(). */
export async function d3(){
	const [scale, shape] = await Promise.all([import(modules.scale), import(modules.shape)]);
	return { ...scale, ...shape };
}
