/**
 * This script runs when NPM bumps the version.
 *
 * It updates other files that need the version number, e.g. manifest.json.
 */
import fs from "fs";
import child_process from "child_process";
import process from "process";

function bumpManifestVersion(manifestPath, version) {
    console.log(`Bumping manifest: ${manifestPath} to ${version}...`);
    const manifestData = fs.readFileSync(manifestPath);
    const manifest = JSON.parse(manifestData);
    manifest.version = version;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    child_process.execSync(`git add "${manifestPath}"`);
}

function bumpXcodeProjectVersion(projectPath, version) {
    console.log(`Bumping xcodeproj: ${projectPath} to ${version}...`);
    const projData = fs.readFileSync(projectPath, { encoding: "utf8" });
    const regex = /MARKETING_VERSION = [\.\d]+;/g;
    const newData = projData.replace(regex, `MARKETING_VERSION = ${version};`);
    fs.writeFileSync(projectPath, newData, { encoding: "utf8" });
    child_process.execSync(`git add "${projectPath}"`);
}

const version = process.env.npm_package_version;
const manifests = [
    "browsers/chrome/manifest.json",
    "browsers/safari/attack-powered-suit\ Extension/Resources/manifest.json",
]

for (const manifest of manifests) {
    bumpManifestVersion(manifest, version);
}

const xcodeProject = "browsers/safari/attack-powered-suit.xcodeproj/project.pbxproj";
bumpXcodeProjectVersion(xcodeProject, version);
