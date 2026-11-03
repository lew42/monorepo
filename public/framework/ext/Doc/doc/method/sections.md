The section list, and the first thing a subclass overrides. Four calls, in the order
they were added — `bar()` decides the order they're *shown* in, so a subclass can
add a section here without thinking about where it lands.

A module that wants a fifth section writes it here:

```js
class ApiDoc extends Doc {
	sections(){
		super.sections();
		this.section("endpoints", "Endpoints", { children: this.endpoints });
	}
}
```

Nothing about that reaches the `Doc` config, which is the point: **an option is API
surface forever, an override lives in the file that wanted it.**
