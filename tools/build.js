import fs from "fs";
import path from "path";

/* -------------------------------- */
/* CONFIG */
/* -------------------------------- */

const APP_DIR = path.resolve("app");
const BUILD_DIR = path.resolve("build");

/* -------------------------------- */
/* CLEAN BUILD FOLDER */
/* -------------------------------- */

function cleanBuild() {
	if (fs.existsSync(BUILD_DIR)) {
		fs.rmSync(BUILD_DIR, { recursive: true });
	}

	fs.mkdirSync(BUILD_DIR);
}

/* -------------------------------- */
/* COPY FILES RECURSIVELY */
/* -------------------------------- */

function copyDir(src, dest) {

	fs.mkdirSync(dest, { recursive: true });

	const entries = fs.readdirSync(src);

	for (let entry of entries) {

		const srcPath = path.join(src, entry);
		const destPath = path.join(dest, entry);

		const stat = fs.statSync(srcPath);

		if (stat.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

/* -------------------------------- */
/* RUN BUILD */
/* -------------------------------- */

function build() {

	console.log("🚀 Starting build...");

	cleanBuild();

	copyDir(APP_DIR, BUILD_DIR);

	console.log("✅ Build complete!");
	console.log("📦 Output: /build");
}

build();