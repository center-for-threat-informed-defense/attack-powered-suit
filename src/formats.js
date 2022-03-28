import { writable } from "svelte/store";

let formats = [];
let saveTimer = null;

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
    const formatted = format
        .replace("{description}", object.description.text)
        .replace("{id}", object.id.text)
        .replace("{name}", object.name.text)
        .replace("{type}", object.type)
        .replace("{url}", object.url);
    return formatted;
}

loadFormats().then(function (f) {
    // Set up initial formats if none found.
    formats = f;

    if (formats.length === 0) {
        addFormat("Name", "{name}", "text/plain");
        addFormat("Summary", "{id} ({type}): {name} – {description}", "text/plain");
        addFormat("Link", '<a href="{url}">{id}: {name}</a>', "text/html");
    }

    formatsStore.set(formats);
});

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
    saveFormats();
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
    saveFormats();
}

/**
 * Load the formats.
 *
 * Supports chrome.storage (for Chrome extension) as well as local storage
 * (for dev environment).
 *
 * @returns {Array}
 */
async function loadFormats() {
    let formats = [];

    // Attempt to load formats array from a storage backend.
    if (chrome && chrome.storage) {
        const storageResult = await chrome.storage.sync.get({ formats: [] });
        if (storageResult) {
            formats = storageResult.formats;
        }
    } else if (localStorage) {
        const formatsJson = localStorage.getItem("formats");
        try {
            if (formatsJson) {
                formats = JSON.parse(formatsJson);
            }
        } catch (e) {
            // Let formats keep its default value.
            console.log("Warning: unable to load formats from local storage:", e);
        }
    } else {
        console.log("Warning: no supported storage found.")
    }

    return formats;
}

/**
 * Serialize the module variable `formats` and save to a storage backend.
 *
 * This function is debounced by 500ms since it can be called rapidly when a
 * user is editing a value.
 */
export function saveFormats() {
    if (saveTimer) {
        clearTimeout(saveTimer);
    }

    saveTimer = setTimeout(function () {
        if (chrome && chrome.storage) {
            chrome.storage.sync.set({ formats: formats });
        } else if (localStorage) {
            const formatsJson = JSON.stringify(formats);
            localStorage.setItem("formats", formatsJson);
        }
    }, 500);
}
