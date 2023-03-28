import { sleep } from "../src/sleep";
import {
    initializeFormats,
    addFormat,
    removeFormat,
    formatsStore,
    saveFormats
} from "../src/formats";

describe("formats.js", () => {
    let formats, formatsUnsub;

    beforeEach(async () => {
        window.chrome = {
            storage: {
                sync: {
                    get: jest.fn(() => Promise.resolve({ formats: [] })),
                    set: jest.fn(),
                }
            }
        };

        formatsUnsub = formatsStore.subscribe(v => formats = v);
    });

    afterEach(() => {
        if (formatsUnsub) {
            formatsUnsub();
        }
        delete window.chrome;
        delete window.ClipboardItem;
    });

    test("add and remove formats", async () => {
        window.ClipboardItem = new Object();
        await initializeFormats();
        expect(window.chrome.storage.sync.get).toBeCalled();

        // Since the mock returns an empty array, the formats should be
        // initialized to an array of default formats.
        expect(formats).toEqual([
            {
                "id": 0,
                "mime": "text/plain",
                "name": "Name",
                "rule": "{name}",
            },
            {
                "id": 1,
                "mime": "text/plain",
                "name": "Summary",
                "rule": "{id} ({type}): {name} – {description}",
            },
            {
                "id": 2,
                "mime": "text/html",
                "name": "Link",
                "rule": "<a href=\"{url}\">{id}: {name}</a>",
            },
        ]);

        removeFormat(0);
        expect(formats).toEqual([
            {
                "id": 1,
                "mime": "text/plain",
                "name": "Summary",
                "rule": "{id} ({type}): {name} – {description}",
            },
            {
                "id": 2,
                "mime": "text/html",
                "name": "Link",
                "rule": "<a href=\"{url}\">{id}: {name}</a>",
            },
        ]);

        addFormat("My Format", "My {rule}", "my/mime");
        expect(formats).toEqual([
            {
                "id": 1,
                "mime": "text/plain",
                "name": "Summary",
                "rule": "{id} ({type}): {name} – {description}",
            },
            {
                "id": 2,
                "mime": "text/html",
                "name": "Link",
                "rule": "<a href=\"{url}\">{id}: {name}</a>",
            },
            {
                "id": 3,
                "mime": "my/mime",
                "name": "My Format",
                "rule": "My {rule}",
            },
        ]);
    });

    test("add and remove formats without ClipboardItem", async () => {
        await initializeFormats();
        expect(window.chrome.storage.sync.get).toBeCalled();

        // Since the mock returns an empty array, the formats should be
        // initialized to an array of default formats.
        expect(formats).toEqual([
            {
                "id": 0,
                "mime": "text/plain",
                "name": "Name",
                "rule": "{name}",
            },
            {
                "id": 1,
                "mime": "text/plain",
                "name": "Summary",
                "rule": "{id} ({type}): {name} – {description}",
            },
            {
                "id": 2,
                "mime": "text/plain",
                "name": "Link",
                "rule": "{url}",
            },
        ]);

        removeFormat(0);
        expect(formats).toEqual([
            {
                "id": 1,
                "mime": "text/plain",
                "name": "Summary",
                "rule": "{id} ({type}): {name} – {description}",
            },
            {
                "id": 2,
                "mime": "text/plain",
                "name": "Link",
                "rule": "{url}",
            },
        ]);

        addFormat("My Format", "My {rule}", "my/mime");
        expect(formats).toEqual([
            {
                "id": 1,
                "mime": "text/plain",
                "name": "Summary",
                "rule": "{id} ({type}): {name} – {description}",
            },
            {
                "id": 2,
                "mime": "text/plain",
                "name": "Link",
                "rule": "{url}",
            },
            {
                "id": 3,
                "mime": "my/mime",
                "name": "My Format",
                "rule": "My {rule}",
            },
        ]);
    });

    test("save formats", async () => {
        saveFormats();
        saveFormats();
        // Saving to storage is debounced by 500ms:
        expect(window.chrome.storage.sync.set).toBeCalledTimes(0);
        await sleep(501);
        expect(window.chrome.storage.sync.set).toBeCalledTimes(1);
    })
});
