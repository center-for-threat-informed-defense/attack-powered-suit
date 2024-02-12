import { writable } from "svelte/store";
import { loadFromStorage, saveToStorage } from "./storage.js";

let bookmarks = [];
let bookmarksSet = {};

/**
 * A store that contains an array of bookmarks.
 */
export let bookmarksStore = writable(bookmarks);

/**
 * A store that contains an object containing keys for each bookmark that is
 * currently set (the value is always "true")
 */
export let bookmarksSetStore = writable(bookmarksSet);

/**
 * A store that represents whether to shade bookmarks by color or score.
 */
export let bookmarksColorByStore = writable("Color");

/**
 * Initialize bookmarks.
 */
export async function initializeBookmarks() {
    bookmarks = await loadFromStorage("bookmarks") ?? [];
    bookmarksStore.set(bookmarks);
    const bookmarksColorBy = await loadFromStorage("bookmarks_color_by") ?? "Color";
    bookmarksColorByStore.set(bookmarksColorBy);

    // Create bookmarks set
    bookmarksSet = {};
    for (let bookmark of bookmarks) {
        bookmarksSet[bookmark.id] = true;
    }
    bookmarksSetStore.set(bookmarksSet);
}

/**
 * Add the specified object to the bookmarks.
 * @param {string} id
 * @param {string} name
 * @param {number} score - used for exporting ATT&CK layer
 * @param {string} notes - used for exporting ATT&CK layer
 * @param {string} color - used for exporting ATT&CK layer
 */
export function addBookmark(id, name, score = 0, notes = "", color = "#f54d4d") {
    // Update bookmarks array
    bookmarks.push({
        id: id,
        name: name,
        score: score,
        notes: notes,
        color: color,
    });
    bookmarksStore.set(bookmarks);

    // Update bookmarks set
    bookmarksSet[id] = true;
    bookmarksSetStore.set(bookmarksSet);

    // Persist the bookmarks.
    saveBookmarks();
}

/**
 * Remove the specified object from bookmarks.
 * @param {string} id
 */
export function removeBookmark(id) {
    // Update bookmarks array
    let removeIdx = -1;
    for (let i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i].id == id) {
            removeIdx = i;
            break;
        }
    }

    if (removeIdx > -1) {
        bookmarks.splice(removeIdx, 1);
    }

    bookmarksStore.set(bookmarks);

    // Update bookmarks set
    delete bookmarksSet[id];
    bookmarksSetStore.set(bookmarksSet);


    // Persist the bookmarks.
    saveBookmarks();
}

/**
 * Save the current set of bookmarks.
 */
export function saveBookmarks() {
    saveToStorage("bookmarks", bookmarks);
}

/**
 * Save the current set of bookmarks.
 */
export function saveBookmarksColorBy(colorBy) {
    bookmarksColorByStore.set(colorBy);
    saveToStorage("bookmarks_color_by", colorBy);
}
