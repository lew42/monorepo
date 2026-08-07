/* A small storefront. Twenty-four items, three categories, and three filter
 * axes — which is the smallest catalogue that still has the problem: colour,
 * size and availability multiply, and none of them is a place.
 *
 *   [ sku, name, category, colour, sizes, price, stock ]
 */
export const categories = [
	["outerwear", "Outerwear", "Coats, parkas and shells."],
	["footwear",  "Footwear",  "Boots and shoes, resoleable."],
	["bags",      "Bags",      "Waxed canvas and bridle leather."],
];

export const colours = ["black", "oxblood", "sand", "olive"];
export const sizes = ["s", "m", "l", "xl"];

export const items = [
	["parka-01",  "Ridgeline Parka",      "outerwear", "olive",   "s m l xl", 428, 6],
	["parka-02",  "Ridgeline Parka",      "outerwear", "black",   "m l xl",   428, 0],
	["shell-01",  "Fell Shell",           "outerwear", "sand",    "s m l",    265, 12],
	["shell-02",  "Fell Shell",           "outerwear", "black",   "s m l xl", 265, 3],
	["coat-01",   "Harbour Coat",         "outerwear", "oxblood", "m l",      512, 2],
	["coat-02",   "Harbour Coat",         "outerwear", "olive",   "s m l xl", 512, 9],
	["jacket-01", "Waxed Chore Jacket",   "outerwear", "sand",    "m l xl",   198, 0],
	["jacket-02", "Waxed Chore Jacket",   "outerwear", "black",   "s m l",    198, 14],
	["gilet-01",  "Down Gilet",           "outerwear", "olive",   "s m l",    172, 5],

	["boot-01",   "Dockyard Boot",        "footwear",  "oxblood", "s m l xl", 340, 4],
	["boot-02",   "Dockyard Boot",        "footwear",  "black",   "m l xl",   340, 0],
	["boot-03",   "Moor Boot",            "footwear",  "sand",    "s m l",    295, 8],
	["shoe-01",   "Derby, Plain Toe",     "footwear",  "black",   "s m l xl", 275, 11],
	["shoe-02",   "Derby, Plain Toe",     "footwear",  "oxblood", "m l",      275, 1],
	["shoe-03",   "Camp Moc",             "footwear",  "sand",    "s m l",    186, 0],
	["shoe-04",   "Camp Moc",             "footwear",  "olive",   "m l xl",   186, 7],
	["boot-04",   "Service Boot",         "footwear",  "black",   "s m l xl", 395, 2],

	["bag-01",    "Field Satchel",        "bags",      "sand",    "m",        215, 10],
	["bag-02",    "Field Satchel",        "bags",      "black",   "m",        215, 0],
	["bag-03",    "Rucksack, 22L",        "bags",      "olive",   "l",        248, 5],
	["bag-04",    "Rucksack, 22L",        "bags",      "black",   "l",        248, 6],
	["bag-05",    "Weekender",            "bags",      "oxblood", "xl",       385, 1],
	["bag-06",    "Dopp Kit",             "bags",      "sand",    "s",        78,  22],
	["bag-07",    "Dopp Kit",             "bags",      "black",   "s",        78,  0],
];

export const in_category = name => items.filter(item => item[2] === name);

export const find = sku => items.find(item => item[0] === sku);

/* The whole of what the filters mean. Three axes, read off URLSearchParams —
 * which is the point: this function needs the query string, not a path. */
export function matching(category, params){
	const colour = params.get("colour");
	const size = params.get("size");
	const stock = params.get("stock") === "in";

	return in_category(category).filter(([, , , c, s, , n]) =>
		(!colour || c === colour) && (!size || s.split(" ").includes(size)) && (!stock || n > 0));
}
