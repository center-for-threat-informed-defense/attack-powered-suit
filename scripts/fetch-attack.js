/**
 * Download ATT&CK STIX data.
 *
 * This is a prerequisite for building the search index.
 */
import fs from "fs";
import https from "https";
import process from "process";

const baseUrl = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master";
const attackUrls = {
    "enterprise-attack.json": `${baseUrl}/enterprise-attack/enterprise-attack-10.1.json`,
    "ics-attack.json": `${baseUrl}/ics-attack/ics-attack-10.1.json`,
    "mobile-attack.json": `${baseUrl}/mobile-attack/mobile-attack-10.1.json`,
};

/**
 * An awaitable download helper.
 *
 * @param {string} url
 * @param {string} path
 */
function download(url, path) {
    return new Promise(resolve => {
        https.get(url, (res) => {
            const stream = fs.createWriteStream(path);
            res.pipe(stream);
            stream.on("finish", () => {
                stream.close();
                resolve();
            });
        });
    });
}

/**
 * Main entry point.
 */
async function main() {
    process.stderr.write("Downloading ATT&CK STIX data…\n");

    for (const [file, url] of Object.entries(attackUrls)) {
        const basename = url.split("/").pop();
        process.stderr.write(` * ${basename} → data/${file}… `);
        await download(url, `data/${file}`)
        process.stderr.write(" done\n");
    }

    process.stderr.write("Done.\n");
}

main();
