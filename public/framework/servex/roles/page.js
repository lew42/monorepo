import { Doc, md, div } from "/app.js";
import Role from "/framework/core/Role/Role.js";
import RoleView from "/framework/core/Role/RoleView.js";

export default new Doc({
	meta: import.meta,
	title: "Roles",
	description: "Every Servex role as an object: its properties and the agents in it now.",
	icon: "badge",

	content(){
		md("A **role** is a row in [roles.js](/framework/servex/fs/agents/roles.js): the model, effort and permissions an agent starts with, and the readme it is given. Each row below is a [Role](/framework/core/Role/Role.js) object; the agents under it are the live ones from Servex. The same panel shows on a session's page under *Models and tokens*.");
		const $list = div.c("wide role-grid").style({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(20em, 100%), 1fr))", gap: "1em", alignItems: "start" });
		Promise.all([Role.load(), Role.agents()]).then(([roles, agents]) => {
			$list.empty(() => roles.forEach(r => RoleView.draw(r, agents, { link: false })));
			if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
		});
	},
});
