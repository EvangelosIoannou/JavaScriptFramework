import {
	CompilerComponent
}
from "./core/CompilerComponent.js";

import {
	signal
}
from "./core/reactivity/Signal.js";

import {
	Store
}
from "./core/Store.js";

import {
	applyMiddleware,
	logger
}
from "./core/Middleware.js";

import {
	Injector
}
from "./core/Injector.js";

import {
	Router
}
from "./core/Router.js";

import {
	registerComponent
}
from "./core/ComponentRegistry.js";

import Layout
from "./components/Layout.js";

import Sidebar
from "./components/Sidebar.js";

import Card
from "./components/Card.js";


/* -------------------------------- */
/* COMPONENTS */
/* -------------------------------- */

registerComponent(
	"Layout",
	Layout
);

registerComponent(
	"Sidebar",
	Sidebar
);

registerComponent(
	"Card",
	Card
);


/* -------------------------------- */
/* STORE */
/* -------------------------------- */

const reducer = (
	state,
	action
) => {

	switch (action.type) {

		case "LOGIN":

			return {
				...state,
				authenticated: true
			};


		case "LOGOUT":

			return {
				...state,
				authenticated: false
			};


		default:

			return state;
	}
};


const store =
	new Store(
		reducer,
		{
			authenticated: false
		}
	);


applyMiddleware(
	store,
	[
		logger
	]
);


/* -------------------------------- */
/* INJECTOR */
/* -------------------------------- */

const injector =
	new Injector();


injector.register(
	"store",
	store
);


/* -------------------------------- */
/* APP */
/* -------------------------------- */

class App
	extends CompilerComponent {

	constructor(
		props,
		injector,
		parentOwner = null
	) {

		super(
			props,
			injector,
			parentOwner
		);

		this.page =
			signal(null);
	}


	setPage(
		page
	) {

		this.page.set(
			page
		);
	}


	template() {

		return `

			<Layout
				page="{{ page }}"
			></Layout>

		`;
	}
}


const app =
	new App(
		{},
		injector
	);


/* -------------------------------- */
/* ROUTES */
/* -------------------------------- */

const routes = {

	"/": {

		component: () =>
			import(
				"../pages/Home.js"
			)
	},


	"/about": {

		component: () =>
			import(
				"../pages/About.js"
			)
	},


	"/contact": {

		component: () =>
			import(
				"../pages/Contact.js"
			)
	},


	"/login": {

		component: () =>
			import(
				"../pages/Login.js"
			)
	},


	"/dashboard": {

		component: () =>
			import(
				"../pages/Dashboard.js"
			),

		protected: true,

		auth: () =>
			store
				.getState()
				.authenticated
	},


	"/sweepstakes": {

		component: () =>
			import(
				"../pages/Sweepstakes.js"
			)
	},


	"/Playground": {

		component: () =>
			import(
				"../pages/Playground.js"
			)
	}
};


/* -------------------------------- */
/* ROUTER */
/* -------------------------------- */

const router =
	new Router(
		routes,
		app
	);


injector.register(
	"router",
	router
);


/* -------------------------------- */
/* START */
/* -------------------------------- */

app.mount(
	document.getElementById(
		"app"
	)
);


router.load();