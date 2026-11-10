// A sub-plugin of Badge: adds a number to the badge it attaches to (Badge.use(Count)).
export class Count {
	static attach(badge){ badge.el.textContent = "1"; }
	static detach(badge){ badge.el.textContent = ""; }
}

export default Count;
