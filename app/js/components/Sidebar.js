import { Component } from "../core/Framework.js";
import { h } from "../core/VDom.js";

export default class Sidebar extends Component {

	constructor(props, injector) {
		super(props, injector);

		this.router = injector.get("router");

		this.state = {
			collapsed: false
		};

		this.toggleSidebar = this.toggleSidebar.bind(this);
	}

	/* -------------------------------- */
	/* TOGGLE SIDEBAR */
	/* -------------------------------- */

	toggleSidebar() {
		this.setState({
			collapsed: !this.state.collapsed
		});
	}

	/* -------------------------------- */
	/* NAVIGATION */
	/* -------------------------------- */

	navigate(path) {
		this.router.navigate(path);
	}

	isActive(path) {
		return window.location.pathname === path;
	}

	/* -------------------------------- */
	/* NAV ITEM */
	/* -------------------------------- */

	navItem(path, icon, label) {

		const active = this.isActive(path);

		return h(
			"a",
			{
				href: path,

				class:
					"nav-item" +
					(active ? " active" : ""),

				onClick: (e) => {
					e.preventDefault();
					this.navigate(path);
				}
			},
			[
				h("span", { class: "icon" }, [icon]),

				!this.state.collapsed
					? h("span", { class: "label" }, [label])
					: ""
			]
		);
	}

	/* -------------------------------- */
	/* RENDER */
	/* -------------------------------- */

	render() {

		const collapsedClass =
			this.state.collapsed ? "collapsed" : "";

		return h(
			"aside",
			{
				class: `sidebar ${collapsedClass}`
			},
			[
				/* HEADER */
				h(
					"div",
					{ class: "sidebar-header" },
					[
						!this.state.collapsed
							? h("div", { class: "logo" }, ["MySite"])
							: h("div", { class: "logo mini" }, ["MS"]),

						h(
							"button",
							{
								class: "toggle-btn",
								onClick: this.toggleSidebar
							},
							["☰"]
						)
					]
				),

				/* NAVIGATION */
				h(
					"nav",
					{ class: "nav" },
					[
						this.navItem("/", "🏠", "Home"),
						this.navItem("/about", "ℹ️", "About"),
						this.navItem("/contact", "✉️", "Contact"),
						this.navItem("/dashboard", "📊", "Dashboard"),
						this.navItem("/sweepstakes", "S", "Sweepstakes"),
						//this.navItem("/sandbox", "S", "Sandbox"),
						//this.navItem("/SignalSandbox", "S", "Signal Sandbox"),
						//this.navItem("/reactive-renderer", "⚡", "Reactive DOM"),
						//this.navItem("/ReactiveTemplateSandbox", "⚡", "Reactive DOM"),
						//this.navItem("/CompilerSandbox", "⚡", "Compiler Sandbox"),
						//this.navItem("/CompilerReactiveSandbox", "⚡", "Compiler Reactive Sandbox"),
						this.navItem("/CompilerHome", "⚡", "Compiler Home"),
						this.navItem("/Playground", "⚡", "Playground"),
					]
				)
			]
		);
	}
}