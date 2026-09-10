import { Component } from "../js/core/Framework.js";
import { html } from "../js/core/Template.js";

export default class Home extends Component {

	constructor(props, injector) {

		super(props, injector);

		this.store = injector.get("store");

		this._unsubscribe =
			this.store.subscribe(() => {

				this.setState({});
			});
	}

	render() {

		const state =
			this.store.getState();

		return html(`
			<div>

				<h1>Home</h1>

				<p>
					Authenticated:
					${state.authenticated}
				</p>

			</div>
		`);
	}

	onMount() {

		const login =
			this.el.querySelector("#login");

		const logout =
			this.el.querySelector("#logout");

		if (login) {

			login.addEventListener(
				"click",
				() => {

					this.store.dispatch({
						type: "LOGIN"
					});
				}
			);
		}

		if (logout) {

			logout.addEventListener(
				"click",
				() => {

					this.store.dispatch({
						type: "LOGOUT"
					});
				}
			);
		}
	}
}