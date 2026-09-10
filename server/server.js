import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const clients = [];

const __filename =
	fileURLToPath(
		import.meta.url
	);

const __dirname =
	path.dirname(
		__filename
	);

const APP_DIR =
	path.join(
		__dirname,
		"../app"
	);

const PORT = 3000;

const MIME_TYPES = {

	".html":
		"text/html",

	".js":
		"text/javascript",

	".css":
		"text/css",

	".json":
		"application/json",

	".png":
		"image/png",

	".jpg":
		"image/jpeg",

	".svg":
		"image/svg+xml",

	".ico":
		"image/x-icon"
};

const server =
	http.createServer(
		(
			req,
			res
		) => {

			const requestPath =
				req.url.split("?")[0];

			/* ---------------------------- */
			/* LIVE RELOAD SSE */
			/* ---------------------------- */

			if (
				requestPath ===
				"/__reload"
			) {

				res.writeHead(
					200,
					{
						"Content-Type":
							"text/event-stream",

						"Cache-Control":
							"no-cache",

						"Connection":
							"keep-alive"
					}
				);

				/*
					Keep connection alive
				*/

				res.write("\n");

				clients.push(
					res
				);

				req.on(
					"close",
					() => {

						const index =
							clients.indexOf(
								res
							);

						if (
							index !== -1
						) {

							clients.splice(
								index,
								1
							);
						}
					}
				);

				return;
			}

			/* ---------------------------- */
			/* STATIC FILES */
			/* ---------------------------- */

			let filePath;

			if (
				requestPath === "/"
			) {

				filePath =
					path.join(
						APP_DIR,
						"index.html"
					);

			} else {

				filePath =
					path.join(
						APP_DIR,
						requestPath
					);
			}

			/* ---------------------------- */
			/* SPA FALLBACK */
			/* ---------------------------- */

			if (
				!path.extname(
					filePath
				)
			) {

				filePath =
					path.join(
						APP_DIR,
						"index.html"
					);
			}

			fs.readFile(
				filePath,
				(
					err,
					content
				) => {

					if (err) {

						res.writeHead(
							404
						);

						res.end(
							"Not Found"
						);

						return;
					}

					const ext =
						path.extname(
							filePath
						);

					const mime =
						MIME_TYPES[
							ext
						] ||
						"text/plain";

					res.writeHead(
						200,
						{
							"Content-Type":
								mime
						}
					);

					res.end(
						content
					);
				}
			);
		}
	);

/* ---------------------------- */
/* START SERVER */
/* ---------------------------- */

server.listen(
	PORT,
	() => {

		console.log(
			`Server running at http://localhost:${PORT}`
		);
	}
);

/* ---------------------------- */
/* FILE WATCHER */
/* ---------------------------- */

fs.watch(
	APP_DIR,
	{
		recursive: true
	},
	(
		eventType,
		filename
	) => {

		console.log(
			"Changed:",
			filename
		);

		clients.forEach(
			client => {

				client.write(
					"data: reload\n\n"
				);
			}
		);
	}
);