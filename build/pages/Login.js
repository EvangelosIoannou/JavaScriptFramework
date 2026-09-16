import {
	CompilerComponent
}
from "../js/core/CompilerComponent.js";

export default class Login
extends CompilerComponent {

	login() {

		alert(
			"Login clicked"
		);
	}

	template() {

		return `
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
		`;
	}
}