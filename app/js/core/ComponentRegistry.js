import ProfileCard from "../components/ProfileCard.js";

import Card from "../components/Card.js";
import UserCard from "../components/UserCard.js";

const registry =
	new Map();

export function registerComponent(
	name,
	component
) {
	registry.set(
		name.toLowerCase(),
		component
	);
}

export function getComponent(
	name
) {

	return registry.get(
		name.toLowerCase()
	);
}

export function hasComponent(
	name
) {

	return registry.has(
		name.toLowerCase()
	);
}


registerComponent(
	"PROFILECARD",
	ProfileCard
);

registerComponent(
	"CARD",
	Card
);

registerComponent(
	"USERCARD",
	UserCard
);