export class Store {
	constructor(reducer, initialState = {}) {
		this.reducer = reducer;
		this.state = initialState;
		this.listeners = [];
	}

	dispatch(action) {
		this.state = this.reducer(this.state, action);
		this.listeners.forEach(l => l());
	}

	getState() {
		return this.state;
	}

	subscribe(listener) {

		this.listeners.push(listener);

		return () => {
			this.listeners =
				this.listeners.filter(l => l !== listener);
		};
	}
}