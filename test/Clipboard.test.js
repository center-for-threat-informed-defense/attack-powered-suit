import { supportsClipboardItem } from "../src/Clipboard";

describe("Clipboard.js", () => {
    afterEach(() => delete window.ClipboardItem);
    test("Rich HTML support", () => {
        window.ClipboardItem = new Object();
        let results = supportsClipboardItem();
        expect(results).toBeTruthy();
    });

    test("No ClipboardItem support", () => {
        let results = supportsClipboardItem();
        expect(results).toBeFalsy();
    });
});
