import { Component }
from "../js/core/Framework.js";

import { html }
from "../js/core/Template.js";

export default class Login
extends Component {

	methods() {

		return {

			login: () => {

				alert(
					"Login clicked"
				);
			}
		};
	}

	render() {

		return html(`
			<div>

				<h1>
					Login
				</h1>

				<button
					@click="login"
				>
					Login
				</button>

			</div>
		`,
		this);
	}
}