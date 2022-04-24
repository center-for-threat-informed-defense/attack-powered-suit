/**
 * This file abstracts over multiple persistent storage backends.
 *
 * - When deployed as an extension, the `chrome.storage` API is used.
 * - When running as a web page, the `localStorage` API is used.
 */

const debounceTimers = {};

/**
 * Save the specified key and value to best available storage backend.
 *
 * This function is debounced so that it can be called rapidly in response to
 * user input while limiting the number of calls to the backend storage.
 *
 * @param {string} key
 * @param {object} value - A JSON-serializable object
 * @param {number} debounce - The duration of debounce in milliseconds
 */
export function saveToStorage(key, value, debounce = 500) {
    const debounceTimer = debounceTimers[key];
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimers[key] = setTimeout(async function () {
        if (chrome && chrome.storage) {
            await chrome.storage.sync.set({ [key]: value });
        } else if (localStorage) {
            localStorage.setItem(key, JSON.stringify(value));
        }

        delete debounceTimers[key];
    }, debounce);
}

/**
 * Load an object from storage for the specified key from the best available
 * storage backend.
 *
 * @param {string} key
 * @returns {object} - the stored object or null if the key doesn't exist
 */
export async function loadFromStorage(key) {
    let storedData = null;

    // Attempt to load formats array from a storage backend.
    if (chrome && chrome.storage) {
        const storageResult = await chrome.storage.sync.get({ [key]: [] });
        if (storageResult) {
            storedData = storageResult[key];
        }
    } else if (localStorage) {
        const storedDataJson = localStorage.getItem(key);
        try {
            if (storedDataJson) {
                storedData = JSON.parse(storedDataJson);
            }
        } catch (e) {
            // Let formats keep its default value.
            console.log(`Warning: unable to load "${key}" from local storage:`, e);
        }
    } else {
        console.log("Warning: no supported storage backend found.")
    }

    return storedData;
}
