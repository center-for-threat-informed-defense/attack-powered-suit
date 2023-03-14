

export function supportsClipboard() {
    if (typeof ClipboardItem !== "undefined") {
        return true;
    } else {
        return false;
    }
}