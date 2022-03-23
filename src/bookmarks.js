import { writable } from "svelte/store";

let bookmarks = [];
let bookmarksSet = {};
let saveTimer = null;

/**
 * A store that contains an array of bookmarks.
 */
export let bookmarksStore = writable(bookmarks)

/**
 * A store that contains an object containing keys for each bookmark that is
 * currently set (the value is always "true")
 */
export let bookmarksSetStore = writable(bookmarksSet)

loadBookmarks().then(function (o) {
    bookmarks = o.bookmarks;
    bookmarksStore.set(bookmarks);
    bookmarksSet = o.bookmarksSet;
    bookmarksSetStore.set(bookmarksSet);
});

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
 * Load bookmark data and return bookmarks array and bookmarks set.
 *
 * Supports chrome.storage (for Chrome extension) as well as local storage
 * (for dev environment).
 *
 * @returns {object} contains `bookmarks` and `bookmarksSet`
 */
async function loadBookmarks() {
    let bookmarks = [];
    let bookmarksSet = {};

    // Attempt to load bookmarks array from a storage backend.
    if (chrome && chrome.storage) {
        const storageResult = await chrome.storage.sync.get({ bookmarks: [] });
        if (storageResult) {
            bookmarks = storageResult.bookmarks;
        }
    } else if (localStorage) {
        const bookmarksJson = localStorage.getItem("bookmarks");
        try {
            if (bookmarksJson) {
                bookmarks = JSON.parse(bookmarksJson);
            }
        } catch (e) {
            // Let bookmarks keep its default value.
            console.log("Warning: unable to load bookmarks from local storage:", e);
        }
    } else {
        console.log("Warning: no supported storage found.")
    }

    // Create bookmarks set
    for (let bookmark of bookmarks) {
        bookmarksSet[bookmark.id] = true;
    }

    return { bookmarks: bookmarks, bookmarksSet: bookmarksSet };
}

/**
 * Serialize the module variable `bookmarks` and save to a storage backend.
 *
 * This function is debounced by 500ms since it can be called rapidly when a
 * user is editing a value.
 */
export function saveBookmarks() {
    if (saveTimer) {
        clearTimeout(saveTimer);
    }

    saveTimer = setTimeout(function () {
        if (chrome && chrome.storage) {
            chrome.storage.sync.set({ bookmarks: bookmarks });
        } else if (localStorage) {
            const bookmarksJson = JSON.stringify(bookmarks);
            localStorage.setItem("bookmarks", bookmarksJson);
        }
    }, 500);
}
