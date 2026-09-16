const registry = new Map();

export function registerComponent(name, component) {
	if (typeof name !== "string" || !name) {
		throw new TypeError(
			"Component name must be a non-empty string"
		);
	}

	if (typeof component !== "function") {
		throw new TypeError(
			"Component must be a constructor or component class"
		);
	}

	registry.set(
		name.toLowerCase(),
		component
	);
}

export function getComponent(name) {
	if (typeof name !== "string") {
		return undefined;
	}

	return registry.get(
		name.toLowerCase()
	);
}

export function hasComponent(name) {
	if (typeof name !== "string") {
		return false;
	}

	return registry.has(
		name.toLowerCase()
	);
}