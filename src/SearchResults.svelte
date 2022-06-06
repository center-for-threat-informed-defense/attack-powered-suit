<script>
    import {
        bookmarksSetStore,
        addBookmark,
        removeBookmark,
    } from "./bookmarks";
    import { formatsStore, formatObject } from "./formats.js";
    import sleep from "./sleep.js";
    import HighlightMatches from "./HighlightMatches.svelte";

    export let results = null;

    const defaultMimeType = "text/plain";
    let highlightResultIdx = -1;
    let highlightFormatIdx = -1;

    // Reformat the results so that they can be fed into the highlighter
    // component.
    let highlightedResults = [];
    $: {
        highlightedResults = [];
        if (results) {
            for (const result of results.items) {
                const { item, matches } = result;
                const highlightedResult = {
                    id: { text: item.id, matches: [] },
                    type: item.type,
                    deprecated: item.deprecated,
                    name: { text: item.name, matches: [] },
                    description: { text: item.description, matches: [] },
                    url: item.url,
                    isBookmarked: item.id in $bookmarksSetStore,
                };
                for (const match of matches) {
                    const { key, indices } = match;
                    highlightedResult[key]["matches"] = indices;
                }
                highlightedResults.push(highlightedResult);
            }
        }
    }

    /**
     * Use the specified format and ATT&CK object to place a snippet on the
     * clipboard.
     */
    async function copyFormat(format, object, resultIdx, formatIdx) {
        const text = formatObject(format.rule, object);
        let blobs = {
            [defaultMimeType]: new Blob([text], { type: defaultMimeType }),
        };
        if (format.mime != defaultMimeType) {
            blobs[format.mime] = new Blob([text], { type: format.mime });
        }
        let clipboardItem = [new ClipboardItem(blobs)];
        await navigator.clipboard.write(clipboardItem);
        highlightResultIdx = resultIdx;
        highlightFormatIdx = formatIdx;
        await sleep(1000);
        highlightResultIdx = -1;
        highlightFormatIdx = -1;
    }
</script>

{#if results && results.totalCount == 0}
    <div class="no-results">
        Nothing found for "{results.query}"
    </div>
{:else if results && results.totalCount > results.items.length}
    <div class="truncated-results">
        Only showing {results.items.length} out of {results.totalCount}
        matches. Try narrowing down your search.
    </div>
{/if}

{#each highlightedResults as result, resultIdx}
    <div class="search-result">
        <p>
            {#if result.isBookmarked}
                <span
                    class="remove-bookmark"
                    title="Remove this bookmark"
                    on:click={removeBookmark(result.id.text)}
                    ><i class="bi bi-bookmark-check-fill" /></span
                >
            {:else}
                <span
                    class="add-bookmark"
                    title="Bookmark this object"
                    on:click={addBookmark(result.id.text, result.name.text)}
                    ><i class="bi bi-bookmark-plus-fill" /></span
                >
            {/if}
            <span class="result-id">
                <HighlightMatches
                    text={result.id.text}
                    matches={result.id.matches}
                />:
            </span>
            <span class="result-name">
                <HighlightMatches
                    text={result.name.text}
                    matches={result.name.matches}
                />
            </span>
            <span class="badge bg-primary">{result.type}</span>
            {#if result.deprecated}
                <span class="badge bg-secondary">deprecated</span>
            {/if}
        </p>
        <p>
            <HighlightMatches
                text={result.description.text}
                matches={result.description.matches}
                maxLength={200}
            />
        </p>
        <p>
            {#each $formatsStore as format, formatIdx (format.id)}
                <span
                    class="format"
                    title="Copy {format.name} to clipboard"
                    on:click={() =>
                        copyFormat(format, result, resultIdx, formatIdx)}
                >
                    {#if highlightResultIdx == resultIdx && highlightFormatIdx === formatIdx}
                        Copied <i class="bi bi-clipboard-check" />
                    {:else}
                        {format.name} <i class="bi bi-clipboard" />
                    {/if}
                </span>
            {/each}
            <a href={result.url} target="_blank" class="format"
                >Go to <i class="bi bi-box-arrow-up-right" />
            </a>
        </p>
    </div>
{/each}

<style>
    p {
        margin: 0.25rem 0;
    }

    .no-results {
        color: var(--bs-danger);
        text-align: center;
        margin: 0.5rem 0;
        border-radius: 0.25rem;
    }

    .truncated-results {
        color: var(--bs-secondary);
        text-align: center;
        margin: 0.5rem 0;
        border-radius: 0.25rem;
    }

    .search-result {
        margin-top: 1em;
    }

    .add-bookmark,
    .remove-bookmark {
        font-size: 1.2em;
        position: relative;
        top: 0.05em;
    }

    .add-bookmark {
        color: var(--bs-secondary);
    }

    .add-bookmark:hover {
        color: var(--bs-black);
    }

    .remove-bookmark {
        color: var(--me-ext-green-dark);
    }

    .remove-bookmark:hover {
        color: var(--me-ext-green-highlighter);
    }

    .result-id,
    .result-name {
        font-weight: 700;
    }

    .format {
        margin-right: 1rem;
        color: var(--me-core-purple-light);
    }

    .format:hover {
        color: var(--me-core-purple);
    }
</style>
