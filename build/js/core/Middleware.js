export function applyMiddleware(store, middlewares) {

	let dispatch = store.dispatch.bind(store);

	middlewares.reverse().forEach(middleware => {
		dispatch = middleware(store)(dispatch);
	});

	store.dispatch = dispatch;
}

export const logger = store => next => action => {

	console.log("Dispatch:", action);

	next(action);

	console.log("New State:", store.getState());
};