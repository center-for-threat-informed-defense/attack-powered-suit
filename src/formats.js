import { writable } from "svelte/store";
import { loadFromStorage, saveToStorage } from "./storage.js";
import { supportsClipboardItem } from "./Clipboard.js";

let formats = [];

/**
 * A store that contains an array of formats.
 */
export let formatsStore = writable(formats)

/**
 * Given a format string and an ATT&CK object, return a string with variables
 * expanded.
 *
 * @param {string} format
 * @param {string} object
 */
export function formatObject(format, object) {
    return format
        .replace("{description}", object.description.text)
        .replace("{id}", object.id.text)
        .replace("{name}", object.name.text)
        .replace("{type}", object.type)
        .replace("{stixId}", object.stixId)
        .replace("{url}", object.url);
}

/**
 * Initialize formats.
 */
export function initializeFormats() {
    return loadFromStorage("formats").then(function (f) {
        formats = f ?? [];

        // Set up initial formats if none found.
        if (formats.length === 0) {
            addFormat("Name", "{name}", "text/plain");
            addFormat("Summary", "{id} ({type}): {name} – {description}", "text/plain");

            if (supportsClipboardItem()) {
                addFormat("Link", '<a href="{url}">{id}: {name}</a>', "text/html");
            } else {
                addFormat("Link", "{url}", "text/plain")
            }
        }

        formatsStore.set(formats);
    });
}

/**
 * Add the specified object to the formats.
 *
 * @param {string} name
 * @param {number} rule
 * @param {string} mime
 */
export function addFormat(name, rule, mime) {
    let id = 0;

    // Generate an ID higher than any existing ID.
    for (let format of formats) {
        if (format.id >= id) {
            id = format.id + 1;
        }
    }

    // Update formats array
    formats.push({ id, name, rule, mime });
    formatsStore.set(formats);

    // Persist the formats.
    saveToStorage("formats", formats);
}

/**
 * Remove the specified format.
 *
 * @param {number} id
 */
export function removeFormat(id) {
    let removeIdx = -1;
    for (let i = 0; i < formats.length; i++) {
        if (formats[i].id == id) {
            removeIdx = i;
            break;
        }
    }

    if (removeIdx > -1) {
        formats.splice(removeIdx, 1);
    }

    formatsStore.set(formats);

    // Persist the formats.
    saveToStorage("formats", formats);
}

/**
 * Save the current set of formats.
 */
export function saveFormats() {
    saveToStorage("formats", formats);
}
