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
 * @param {string} stixId
 * @param {string} attackId
 * @param {string} name
 * @param {number} score - used for exporting ATT&CK layer
 * @param {string} notes - used for exporting ATT&CK layer
 * @param {string} color - used for exporting ATT&CK layer
 */
export function addBookmark(stixId, attackId, name, score = 0, notes = "", color = "#f54d4d") {
    // Update bookmarks array
    bookmarks.push({
        stixId: stixId,
        attackId: attackId,
        name: name,
        score: score,
        notes: notes,
        color: color,
    });
    bookmarksStore.set(bookmarks);

    // Update bookmarks set
    bookmarksSet[stixId] = true;
    bookmarksSetStore.set(bookmarksSet);

    // Persist the bookmarks.
    saveBookmarks();
}

/**
 * Remove the specified object from bookmarks.
 * @param {string} stixId
 */
export function removeBookmark(stixId) {
    // Update bookmarks array
    let removeIdx = -1;
    for (let i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i].stixId == stixId) {
            removeIdx = i;
            break;
        }
    }

    if (removeIdx > -1) {
        bookmarks.splice(removeIdx, 1);
    }

    bookmarksStore.set(bookmarks);

    // Update bookmarks set
    delete bookmarksSet[stixId];
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
 * Save the bookmark color preference.
 */
export function saveBookmarksColorBy(colorBy) {
    bookmarksColorByStore.set(colorBy);
    saveToStorage("bookmarks_color_by", colorBy);
}
