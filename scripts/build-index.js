/**
 * This script pre-computes a search index for ATT&CK Powered Suit so that it
 * doesn't need to be recomputed every time APS runs.
 */
import fs from "fs";
import process from "process";
import lunr from "lunr";
import { lunrOptions } from "../src/search.js";
import { marked } from "marked";
import { convert } from 'html-to-text';

const inputFiles = [
    "data/enterprise-attack.json",
    "data/ics-attack.json",
    "data/mobile-attack.json",
];

// Note that attack-pattern is handled outside of this map, since it can
// be a technique or a subtechnique.
const stixTypeToAttackTypeMap = {
    "campaign": "campaign",
    "course-of-action": "mitigation",
    "intrusion-set": "group",
    "malware": "software",
    "tool": "software",
    "x-mitre-data-source": "dataSource",
    "x-mitre-tactic": "tactic",
};

const mitreSources = {
    "mitre-attack": true,
    "mitre-ics-attack": true,
    "mitre-mobile-attack": true,
}

/**
 * Clean up the markup in ATT&CK text.
 *
 * ATT&CK uses a combination of Markdown and HTML tags, so the easiest way to
 * clean it is to render the Markdown to HTML, then convert HTML back to plain
 * text. Older versions of ATT&CK may not be parsable as Markdown, so in that
 * case just return the original text.
 */
function cleanAttackText(text) {
    const trimmed = text.trim();
    const html = marked.parse(text);
    const converted = convert(html) ?? trimmed;
    return converted.replace(/\s+/g, " ");
}

/**
 * Extract ATT&CK data needed for search index.
 *
 * @param {object} stixObject
 */
function extractAttackObject(stixObject) {
    // Name and description are taken from the top-level STIX object.
    const attackObject = {
        stixId: stixObject.id,
        name: stixObject.name,
        description: cleanAttackText(stixObject.description || ""),
    }

    // ID and URL are extract from the first reference that is sourced to
    // MITRE.
    for (const reference of stixObject.external_references) {
        if (reference.source_name in mitreSources) {
            attackObject.lunrRef = reference.external_id;
            attackObject.id = reference.external_id;
            attackObject.url = reference.url;
            break;
        }
    }

    // extract the ATT&CK matrix from the STIX object
    for (const mitreDomain of stixObject.x_mitre_domains) {
        switch (mitreDomain) {
            case "enterprise-attack":
                attackObject.is_enterprise = true;
                break;
            case "ics-attack":
                attackObject.is_ics = true;
                break;
            case "mobile-attack":
                attackObject.is_mobile = true;
                break;
            default:
                process.stderr.write(`warning: could not determine the matrix for object:${attackObject.id}\n`);
                break;
        }
    }


    if (!("id" in attackObject)) {
        console.log(stixObject);
        throw new Exception("Could not extract reference from STIX object.");
    }

    // Assign an object type.
    if (stixObject.type in stixTypeToAttackTypeMap) {
        attackObject.type = stixTypeToAttackTypeMap[stixObject.type];
        attackObject.relatedTechniques = [];
    } else if (stixObject.type === "attack-pattern") {
        attackObject.type = stixObject.x_mitre_is_subtechnique ?
            "subtechnique" : "technique";
    } else {
        console.log(stixObject);
        throw new Exception("Could not derive ATT&CK type from STIX object.");
    }

    // The "deprecated" field is based on logic described here:
    // https://github.com/mitre/cti/blob/master/USAGE.md#working-with-deprecated-and-revoked-objects
    attackObject.deprecated = stixObject.x_mitre_deprecated === true ||
        stixObject.revoked === true;

    return attackObject;
}

/**
 * A generator function that yields ATT&CK objects in a format suitable for
 * indexing.
 *
 * @param {object} attackStix - A parsed STIX document
 */
function* parseAttackObjects(attackStix) {
    for (const stixObject of attackStix.objects) {
        if (stixObject.type === "attack-pattern"
            || stixObject.type in stixTypeToAttackTypeMap) {
            yield extractAttackObject(stixObject);
        } else {
            continue;
        }
    }
}

/**
 * A generator function that yields ATT&CK relationships to/from techniques.
 *
 * Yields pairs of object STIX ID -> technique STIX ID.
 *
 * @param {object} attackStix - A parsed STIX document
 */
function* parseAttackRelationships(attackStix) {
    for (const stixObject of attackStix.objects) {
        if (stixObject.type === "relationship") {
            let techniqueStixId = null;
            let objStixId = null;
            // The "deprecated" field is based on logic described here:
            // https://github.com/mitre/cti/blob/master/USAGE.md#working-with-deprecated-and-revoked-objects
            if (stixObject.x_mitre_deprecated === true ||
                stixObject.revoked === true) {
                continue;
            }
            if (stixObject.source_ref.startsWith("attack-pattern--")) {
                techniqueStixId = stixObject.source_ref;
                objStixId = stixObject.target_ref;
            } else if (stixObject.target_ref.startsWith("attack-pattern--")) {
                objStixId = stixObject.source_ref;
                techniqueStixId = stixObject.target_ref;
            }
            if (objStixId) {
                const objType = objStixId.split("--")[0];
                if (typeof stixTypeToAttackTypeMap[objType] !== "undefined") {
                    yield [objStixId, techniqueStixId];
                }
            }
        } else {
            continue;
        }
    }
}

/**
 * Main entry point.
 */
function main() {
    process.stderr.write("Building ATT&CK search index…\n");

    const attackObjects = [];
    const attackOidLookup = {};
    const attackStixLookup = {};
    const objectCounts = {
        tactic: 0, technique: 0, subtechnique: 0, software: 0,
        group: 0, mitigation: 0, dataSource: 0, campaign: 0,
    };
    const uniqueObjectIds = {};
    let deprecatedCount = 0;

    for (const inputFile of inputFiles) {
        process.stderr.write(`Reading ${inputFile}… `);

        const attackStixText = fs.readFileSync(inputFile);
        const attackStix = JSON.parse(attackStixText);

        // Make one pass to parse out the objects.
        for (const attackObject of parseAttackObjects(attackStix)) {
            if (attackObject.id in uniqueObjectIds) {
                continue;
            }
            uniqueObjectIds[attackObject.id] = true;
            objectCounts[attackObject.type]++;
            if (attackObject.deprecated) {
                deprecatedCount++;
            }
            attackObjects.push(attackObject);
            attackOidLookup[attackObject.id] = attackObject;
            attackStixLookup[attackObject.stixId] = attackObject;
        }

        // Make a second pass to parse relationships.
        for (const [objStixId, techniqueStixId] of parseAttackRelationships(attackStix)) {
            const obj = attackStixLookup[objStixId];
            if (!obj) {
                process.stderr.write(`Warning: no object exists for ID=${objStixId}\n`);
                continue;
            }
            const technique = attackStixLookup[techniqueStixId];
            obj.relatedTechniques.push(technique.id);
        }
        process.stderr.write("done\n");
    }

    process.stderr.write("Writing data/attack.json…\n");
    fs.writeFileSync("data/attack.json", JSON.stringify(attackOidLookup));

    process.stderr.write("Writing data/lunr-index.json…\n");
    const index = lunr(function () {
        lunrOptions.apply(this);
        this.metadataWhitelist = ['position'];
        attackObjects.forEach(function (d) { this.add(d) }, this);
    });
    fs.writeFileSync("data/lunr-index.json", JSON.stringify(index));

    // Display summary of ingested data.
    process.stderr.write("Loaded object counts:\n");
    for (const [type, count] of Object.entries(objectCounts)) {
        process.stderr.write(` * ${type}: ${count}\n`)
    }
    process.stderr.write(`Deprecated object count: ${deprecatedCount}\n`);

    process.stderr.write("Done.\n");
}

main();
