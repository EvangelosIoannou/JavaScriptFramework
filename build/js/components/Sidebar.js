import { CompilerComponent } from "../core/CompilerComponent.js";
import { signal } from "../core/reactivity/Signal.js";

export default class Sidebar
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

		this.router =
			injector.get(
				"router"
			);

		this.collapsed =
			signal(false);
	}


	toggleSidebar() {

		this.collapsed.set(
			!this.collapsed.peek()
		);
	}


	navigate(event) {

		event.preventDefault();

		const path =
			event.currentTarget.getAttribute(
				"href"
			);

		this.router.navigate(
			path
		);
	}


	template() {

		return `

			<aside
				class="sidebar"
				:class='collapsed ? "sidebar collapsed" : "sidebar"'
			>

				<div class="sidebar-header">

					<div
						class="logo"
					>
						{{ collapsed ? "MS" : "MySite" }}
					</div>

					<button
						class="toggle-btn"
						@click="toggleSidebar"
					>
						☰
					</button>

				</div>


				<nav class="nav">

					<a
						href="/"
						class="nav-item"
						@click="navigate"
					>
						<span class="icon">
							🏠
						</span>

						<span class="label">
							Home
						</span>
					</a>


					<a
						href="/about"
						class="nav-item"
						@click="navigate"
					>
						<span class="icon">
							ℹ️
						</span>

						<span class="label">
							About
						</span>
					</a>


					<a
						href="/contact"
						class="nav-item"
						@click="navigate"
					>
						<span class="icon">
							✉️
						</span>

						<span class="label">
							Contact
						</span>
					</a>


					<a
						href="/dashboard"
						class="nav-item"
						@click="navigate"
					>
						<span class="icon">
							📊
						</span>

						<span class="label">
							Dashboard
						</span>
					</a>


					<a
						href="/sweepstakes"
						class="nav-item"
						@click="navigate"
					>
						<span class="icon">
							S
						</span>

						<span class="label">
							Sweepstakes
						</span>
					</a>


					<a
						href="/Playground"
						class="nav-item"
						@click="navigate"
					>
						<span class="icon">
							⚡
						</span>

						<span class="label">
							Playground
						</span>
					</a>

				</nav>

			</aside>
		`;
	}
}