// The part types a page takes in `{"content":{"add":{"type":…}}}`. Importing this file registers them all (each registers itself with Item).
// The ONE list: the browser (AISessionDetail, Parts.js), the item tool (Servex/agents/page_tools.js) and the tests all import it.
import "./PageHeading.js";
import "./PageText.js";
import "./PageCard.js";
import "./PageLink.js";
import "./PageView.js";
import "./PageFile.js";

export const PART_TYPES = ["part-heading", "part-text", "part-card", "part-link", "part-view", "part-file"];
