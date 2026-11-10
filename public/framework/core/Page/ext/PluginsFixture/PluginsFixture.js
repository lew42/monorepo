// A node-safe fixture extension (no DOM import), used only by Page.plugins.test.mjs to prove `page.ext(name)`
// really does turn a plugin on through core/Plugin's Pluggable, not a page that any real page declares.
export default class PluginsFixture {
	static setup(page){ page.fixture_seen = (page.fixture_seen ?? 0) + 1; }
}
