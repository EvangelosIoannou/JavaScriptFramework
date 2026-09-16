import {
	CompilerComponent
}
from "../core/CompilerComponent.js";

export default class Layout
	extends CompilerComponent {

	template() {

		return `

			<div class="layout">

				<Sidebar></Sidebar>

				<main class="content">

					<component
						:is="page"
					></component>

				</main>

			</div>

		`;
	}
}