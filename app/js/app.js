import { Component } from "./core/Framework.js";
import { h } from "./core/VDom.js";
import { Store } from "./core/Store.js";
import {applyMiddleware, logger} from "./core/Middleware.js";
import { Injector } from "./core/Injector.js";
import { Router } from "./core/Router.js";
import Layout from "./components/Layout.js";
import { registerComponent } from "./core/ComponentRegistry.js";

import Card from "./components/Card.js";

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
	[logger]
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
	extends Component {

	constructor(
		props,
		injector
	) {

		super(
			props,
			injector
		);

		this.state = {
			page: null
		};
	}

	setPage(page) {

		this.setState({
			page
		});
	}

	render() {

		return h(
			Layout,
			{
				page:
					this.state.page
			},
			[]
		);
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
			import("../pages/Home.js")
	},

	"/about": {
		component: () =>
			import("../pages/About.js")
	},

	"/contact": {
		component: () =>
			import("../pages/Contact.js")
	},

	"/login": {
		component: () =>
			import("../pages/Login.js")
	},

	"/dashboard": {

		component: () =>
			import("../pages/Dashboard.js"),

		protected: true,

		auth: () =>
			store.getState()
				.authenticated
	},

	"/sweepstakes": {
		component: () =>
			import("../pages/Sweepstakes.js")
	},
	"/sandbox": {
		component: () =>
			import("../pages/Sandbox.js")
	},
	"/SignalSandbox": {
		component: () =>
			import("../pages/SignalSandbox.js")
	},
	"/reactive-renderer": {
	component: () =>
		import(
			"../pages/SignalRendererSandbox.js"
		)
	},
	"/ReactiveTemplateSandbox": {
	component: () =>
		import(
			"../pages/ReactiveTemplateSandbox.js"
		)
	},
	"/CompilerReactiveSandbox": {
	component: () =>
		import(
			"../pages/CompilerReactiveSandbox.js"
		)
	},
	"/CompilerHome": {
	component: () =>
		import(
			"../pages/CompilerHome.js"
		)
	},
	"/Playground": {
	component: () =>
		import(
			"../pages/Playground.js"
		)
	},
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