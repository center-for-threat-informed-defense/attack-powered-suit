/**
 * This script runs when NPM bumps the version.
 *
 * It updates other files that need the version number, e.g. manifest.json.
 */
import fs from "fs";
import child_process from "child_process";
import process from "process";

const manifestData = fs.readFileSync("public/manifest.json");
const manifest = JSON.parse(manifestData);
manifest.version = process.env.npm_package_version;
fs.writeFileSync("public/manifest.json", JSON.stringify(manifest, null, 2));
child_process.execSync("git add public/manifest.json");
