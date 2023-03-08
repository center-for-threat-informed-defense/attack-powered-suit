import { writable } from "svelte/store";
import { loadFromStorage, saveToStorage } from "./storage.js";

const defaultFilters = {
    includeTechniques: true,
    includeSubtechniques: true,
    includeMitigations: true,
    includeSoftware: true,
    includeTactics: true,
    includeDataSources: true,
    includeGroups: true,
    includeCampaigns: true,
    includeEnterprise: true,
    includeIcs: true,
    includeMobile: true,
    includeDeprecated: false,
};
export const filters = writable(defaultFilters);

/**
 * Initialize filters.
 */
export async function initializeFilters() {
    const storedFilters = await loadFromStorage("filters") ?? {};
    const newFilters = Object.assign({}, defaultFilters);
    // Only load filters that match keys in the defaults. This lets us add/remove
    // filters in the future without accumulating cruft in the storage layer.
    for (const key of Object.keys(newFilters)) {
        if (storedFilters.hasOwnProperty(key)) {
            newFilters[key] = storedFilters[key];
        }
    }
    filters.set(newFilters);
    filters.subscribe(saveFilters);
}


function saveFilters(newFilters) {
    saveToStorage("filters", newFilters);
}
