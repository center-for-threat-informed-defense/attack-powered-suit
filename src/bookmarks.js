import { writable } from "svelte/store";

const { bookmarks, bookmarksSet } = loadBookmarks();

/**
 * bookmarks is a store that contains an array of bookmarks.
 */
export let bookmarksStore = writable(bookmarks)

/**
 * bookmarksSet is a store that contains an object containing keys for each
 * bookmark that is currently set (the value is always "true")
 */
export let bookmarksSetStore = writable(bookmarksSet)

/**
 * Add the specified object to the bookmarks.
 * @param {string} id
 * @param {string} name
 * @param {number} score - used for exporting ATT&CK layer
 * @param {string} notes - used for exporting ATT&CK layer
 * @param {string} color - used for exporting ATT&CK layer
 */
export function addBookmark(id, name, score = 0, notes = "", color = "#ffffff") {
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
}

/**
 * Load bookmark data and return bookmarks array and bookmarks set.
 * @returns {object} contains `bookmarks` and `bookmarksSet`
 */
function loadBookmarks() {
    let bookmarks = [];
    let bookmarksSet = {};

    // Attempt to load bookmarks array
    if (localStorage) {
        let bookmarksJson = localStorage.getItem("bookmarks");
        try {
            bookmarks = JSON.parse(bookmarksJson);
        } catch (e) {
            // Let bookmarks keep its default value.
            console.log("Warning: unable to load APS bookmarks from local storage:", e);
        }
    }

    // Create bookmarks set
    for (let bookmark of bookmarks) {
        bookmarksSet[bookmark.id] = true;
    }

    return { bookmarks: bookmarks, bookmarksSet: bookmarksSet };
}

/**
 * Serialize the module variable `bookmarks` and save to local storage.
 */
export function saveBookmarks() {
    if (localStorage) {
        let bookmarksJson = JSON.stringify(bookmarks);
        localStorage.setItem("bookmarks", bookmarksJson);
    }
}
