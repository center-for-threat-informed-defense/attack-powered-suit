import Fuse from 'fuse.js';

export const fuseOptions = {
    includeMatches: true,
    distance: 1000,
    threshold: 0.1,
    ignoreFieldNorm: true,
    minMatchCharLength: 3,
    keys: [
        {
            name: "id",
            weight: 3,
        },
        {
            name: "name",
            weight: 2,
        },
        {
            name: "description",
            weight: 1,
        },
    ],
}

const MAX_RESULTS = 50;

// The index is created empty at first. Data is added inside initializeSearch().
let fuse = new Fuse([], fuseOptions);

/**
 * Initialize the search index.
 */
export async function initializeSearch() {
    const attackPromise = new Promise(resolve => fetchAttack(resolve));
    const indexPromise = new Promise(resolve => fetchIndex(resolve));

    const attackData = await attackPromise;
    const indexData = await indexPromise;
    const fuseIndex = Fuse.parseIndex(indexData);
    fuse = new Fuse(attackData, fuseOptions, fuseIndex);
    console.log("Search index is initialized.");
}

function fetchAttack(resolve) {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        const attackData = JSON.parse(this.responseText);
        resolve(attackData);
    });
    xhr.open("GET", "build/attack.json");
    xhr.send();
}

function fetchIndex(resolve) {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        const jsonData = JSON.parse(this.responseText);
        resolve(jsonData);
    });
    xhr.open("GET", "build/fuse-index.json");
    xhr.send();
}

/**
 * Run a query on the search index and return the results.
 */
export function search(query, filters) {
    const unfilteredResults = fuse.search(query);
    let filteredResults = [];
    let resultCount = 0;

    for (const result of unfilteredResults) {
        const type = result.item.type;
        const deprecated = result.item.deprecated;
        if (filters[type] === true && (!deprecated || filters.deprecated === true)) {
            filteredResults.push(result);
            resultCount++;

            if (resultCount >= MAX_RESULTS) {
                break;
            }
        }
    }

    return filteredResults;
}
