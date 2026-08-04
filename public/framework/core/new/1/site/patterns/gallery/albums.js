/* Three albums, eight frames each. A "photo" here is a rectangle and a caption,
 * because the product is about a url that renders OVER the url above it.
 *
 *   [ id, caption, colour, exif ]
 */
const roll = (prefix, frames) => frames.map(([caption, colour, exif], i) =>
	[`${prefix}-${String(i + 1).padStart(2, "0")}`, caption, colour, exif]);

export const albums = [
	["harbour", "Harbour, February", "Shot over two mornings while the fog burned off.", roll("harbour", [
		["Slipway at low water",   "#8a9aa6", "35mm · f/8 · 1/250"],
		["Bollard, painted twice", "#c2c0b6", "35mm · f/4 · 1/500"],
		["Nets, drying",           "#7f8b6d", "50mm · f/2.8 · 1/1000"],
		["The blue crane",         "#5d7f95", "35mm · f/8 · 1/125"],
		["Fog off the breakwater", "#b7c3c9", "85mm · f/4 · 1/500"],
		["Chandlery window",       "#9c8368", "35mm · f/2 · 1/60"],
		["Two hulls, one shadow",  "#6b7480", "50mm · f/5.6 · 1/250"],
		["Last light on the mole", "#c98a5e", "85mm · f/2.8 · 1/125"],
	])],
	["works", "The works", "A morning in a foundry that still casts to order.", roll("works", [
		["Pattern store",       "#8b7355", "35mm · f/2 · 1/30"],
		["Sand, packed",        "#a89478", "50mm · f/4 · 1/60"],
		["Pour",                "#c46a2a", "85mm · f/5.6 · 1/500"],
		["Cooling line",        "#6e6257", "35mm · f/4 · 1/125"],
		["Fettling bench",      "#7d7f7a", "50mm · f/2.8 · 1/60"],
		["Ladle, resting",      "#94693f", "35mm · f/8 · 1/250"],
		["Quality bench",       "#8f9499", "50mm · f/4 · 1/125"],
		["Yard, eleven o'clock","#a3a89c", "35mm · f/11 · 1/500"],
	])],
	["allotment", "Allotment, all year", "The same four square metres, once a month.", roll("allotment", [
		["January, bare",    "#8d8f87", "35mm · f/8 · 1/125"],
		["March, first rows","#7e9264", "35mm · f/5.6 · 1/250"],
		["May, staked",      "#6f9a55", "50mm · f/4 · 1/500"],
		["July, over",       "#95a352", "35mm · f/8 · 1/1000"],
		["August, heavy",    "#a89a44", "50mm · f/5.6 · 1/500"],
		["September, cut",   "#b09a5e", "35mm · f/8 · 1/250"],
		["November, dug",    "#7a6f5f", "35mm · f/4 · 1/125"],
		["December, frost",  "#b9c2c6", "50mm · f/5.6 · 1/250"],
	])],
];

export const find_album = name => albums.find(([id]) => id === name);

export const find_frame = (album, id) => find_album(album)?.[3].find(frame => frame[0] === id);
