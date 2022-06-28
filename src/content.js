/**
 * This script is injected into each active tab.
 *
 * It monitors the current selection and enables the "Go to selected ATT&CK
 * object" context menu when the selected text looks like an ATT&CK object.
 */
import { getAttackId } from "./attack.js";

document.addEventListener("selectionchange", function () {
    const selection = window.getSelection().toString();
    const selectedAttackId = getAttackId(selection);
    chrome.runtime.sendMessage({
        request: "setLookupAttackId",
        selectedAttackId,
    })
});
