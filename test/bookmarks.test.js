import { sleep } from "../src/sleep";
import {
    initializeBookmarks,
    addBookmark,
    removeBookmark,
    bookmarksStore,
    bookmarksSetStore,
    saveBookmarks
} from "../src/bookmarks";

describe("bookmarks.js", () => {
    let bookmarks, bookmarksUnsub;
    let bookmarksSet, bookmarksSetUnsub;

    beforeEach(async () => {
        window.chrome = {
            storage: {
                sync: {
                    get: jest.fn(() => Promise.resolve({ bookmarks: [] })),
                    set: jest.fn(),
                }
            }
        };

        bookmarksUnsub = bookmarksStore.subscribe(v => bookmarks = v);
        bookmarksSetUnsub = bookmarksSetStore.subscribe(v => bookmarksSet = v);
    });

    afterEach(() => {
        if (bookmarksUnsub) {
            bookmarksUnsub();
        }
        if (bookmarksSetUnsub) {
            bookmarksSetUnsub();
        }
        delete window.chrome;
    });

    test("add and remove bookmarks", async () => {
        await initializeBookmarks();
        expect(window.chrome.storage.sync.get).toBeCalled();
        expect(bookmarks).toEqual([]);
        expect(bookmarksSet).toEqual({});

        addBookmark(
            "attack-pattern--67720091-eee3-4d2d-ae16-8264567f6f5b",
            "T1548",
            "Abuse Elevation Control Mechanism",
            1.0,
            "My notes part 1",
            "#112233"
        );
        expect(bookmarks).toEqual([{
            stixId: "attack-pattern--67720091-eee3-4d2d-ae16-8264567f6f5b",
            attackId: "T1548",
            name: "Abuse Elevation Control Mechanism",
            score: 1.0,
            notes: "My notes part 1",
            color: "#112233",
        }]);
        expect(bookmarksSet).toEqual({
            "attack-pattern--67720091-eee3-4d2d-ae16-8264567f6f5b": true,
        });

        removeBookmark("attack-pattern--67720091-eee3-4d2d-ae16-8264567f6f5b");
        expect(bookmarks).toEqual([]);
        expect(bookmarksSet).toEqual({});
    });

    test("save bookmarks", async () => {
        saveBookmarks();
        saveBookmarks();
        // Saving to storage is debounced by 500ms:
        expect(window.chrome.storage.sync.set).toBeCalledTimes(0);
        await sleep(501);
        expect(window.chrome.storage.sync.set).toBeCalledTimes(1);
    })
});
