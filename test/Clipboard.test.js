import { supportsClipboard } from "../src/Clipboard";
// import { initializeFormats } from "../src/formats.js"

describe("Clipboard.js", () => {
    afterEach(() => delete window.ClipboardItem);
    test("Rich HTML support", () => {
        window.ClipboardItem = new Object();
        let results = supportsClipboard();
        expect(results).toBeTruthy();
        // delete window.ClipboardItem;
    });

    test("No ClipboardItem support", () => {
        let results = supportsClipboard();
        expect(results).toBeFalsy();
    });
});
