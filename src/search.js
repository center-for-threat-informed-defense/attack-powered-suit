import lunr from 'lunr';

/**
 * Call this function from a lunr() constructor.
 *
 * Must use lunrOptions.apply(this) to make sure that "this" resolves correctly.
 */
export const lunrOptions = function () {
    this.ref("lunrRef");
    this.field("attackId", { boost: 4 });
    this.field("stixId");
    this.field("type");
    this.field("name", { boost: 3 });
    this.field("parentName", { boost: 2 });
    this.field("description", { boost: 1 });
    this.field("url");
    this.field("is_enterprise");
    this.field("is_ics");
    this.field("is_mobile");
}

const maxResults = 25;

// The index is created empty at first. Data is added inside initializeSearch().
let index = lunr(function () {
    lunrOptions.apply(this);
});
let attackData = {};

/**
 * Initialize the search index.
 */
export async function initializeSearch() {
    // Note that Chrome service workers don't support XMLHttpRequest, so we must
    // use the fetch() API here.
    const attackResponse = await fetch("/build/attack.jsonz");
    const attackStream = attackResponse.body.pipeThrough(new DecompressionStream("gzip"));
    attackData = await new Response(attackStream).json();
    const indexResponse = await fetch("/build/lunr-index.jsonz");
    const indexStream = indexResponse.body.pipeThrough(new DecompressionStream("gzip"));
    const indexData = await new Response(indexStream).json();
    index = lunr.Index.load(indexData);
    console.log("Search index is initialized.");
}

/**
 * Decide if the query should have a wild card appended.
 *
 * Adding the wildcard can produce better results, especially for incomplete
 * queries, e.g. if you're typing the word "powershell", you won't get any hits
 * for "powersh" but you would get hits for "powersh*".
 */
function canAddWildcard(query) {
    return query.indexOf("*") === -1 && query.indexOf(" ") === -1;
}

/**
 * Run a query on the search index and return the results.
 */
export function search(query, filters) {
    let unfilteredResults;

    try {
        unfilteredResults = index.search(query);
    } catch (e) {
        return {
            query,
            items: [],
            totalCount: 0,
        };
    }

    let filteredResults = [];
    let resultCount = 0;

    for (const result of unfilteredResults) {
        const attackObject = attackData[result.ref];
        const type = attackObject.type;
        const deprecated = attackObject.deprecated;
        if (filters[type] === true && (!deprecated || filters.deprecated === true)) {
            if (filters["ICS"] == attackObject.is_ics || filters["Mobile"] == attackObject.is_mobile || filters["Enterprise"] == attackObject.is_enterprise) {
                if (resultCount < maxResults) {
                    attackObject.score = result.score;
                    attackObject.matchData = result.matchData;
                    filteredResults.push(attackObject);
                }
                resultCount++;
            }
        }
    }

    // If we got zero results and the query is wildcard-eligible, then try again with a
    // wildcard.
    if (filteredResults.length === 0 && canAddWildcard(query)) {
        return search(`${query}*`, filters);
    } else {
        return {
            query,
            items: filteredResults,
            totalCount: resultCount,
        };
    }
}

/**
 * Look up an ATT&CK object by its STIX ID.
 */
export function lookupAttack(stixId) {
    return attackData[stixId];
}
