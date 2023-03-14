<script>
    import {
        bookmarksSetStore,
        addBookmark,
        removeBookmark,
    } from "./bookmarks";
    import { formatsStore, formatObject } from "./formats.js";
    import { sleep } from "./sleep.js";
    import HighlightMatches from "./HighlightMatches.svelte";
    import { supportsClipboard } from "./Clipboard.js"

    export let results = null;

    const defaultMimeType = "text/plain";
    const descriptionMaxLength = 400;
    let highlightResultIdx = -1;
    let highlightFormatIdx = -1;
    let supportsHTML = supportsClipboard();

    // Reformat the results so that they can be fed into the highlighter
    // component.
    let highlightedResults = [];
    $: {
        highlightedResults = [];
        if (results) {
            for (const result of results.items) {
                const highlightedResult = {
                    id: { text: result.id, matches: [] },
                    stixId: result.stixId,
                    type: result.type,
                    deprecated: result.deprecated,
                    name: { text: result.name, matches: [] },
                    source_name: result.source_name,
                    description: { text: result.description, matches: [] },
                    url: result.url,
                    isBookmarked: result.id in $bookmarksSetStore,
                    is_enterprise: result.is_enterprise,
                    is_ics: result.is_ics,
                    is_mobile: result.is_mobile,
                };
                for (const [term, fields] of Object.entries(
                    result.matchData.metadata
                )) {
                    for (const [field, matches] of Object.entries(fields)) {
                        for (const match of matches.position) {
                            highlightedResult[field].matches?.push([
                                match[0],
                                match[0] + match[1],
                            ]);
                        }
                    }
                }
                // The matches are naturally ordered by term; sort them by index instead
                // so that they can be highlighted.
                const sortMatches = (a, b) => a[0] - b[0];
                highlightedResult.id.matches.sort(sortMatches);
                highlightedResult.name.matches.sort(sortMatches);
                highlightedResult.description.matches.sort(sortMatches);
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
        
        if (supportsHTML) {
            let blobs = {
                [defaultMimeType]: new Blob([text], { type: defaultMimeType }),
            };
            if (format.mime != defaultMimeType) {
                blobs[format.mime] = new Blob([text], { type: format.mime });
            }
            let clipboardItem = [new ClipboardItem(blobs)];
            await navigator.clipboard.write(clipboardItem);
        } else {
            navigator.clipboard.writeText(text);
         }
        highlightResultIdx = resultIdx;
        highlightFormatIdx = formatIdx;
        await sleep(1000);
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
            {#if result.is_enterprise}
                <span class="badge bg-secondary">Enterprise</span>
            {/if}
            {#if result.is_mobile}
                <span class="badge bg-secondary">Mobile</span>
            {/if}
            {#if result.is_ics}
                <span class="badge bg-secondary">ICS</span>
            {/if}
            <span class="badge bg-primary">{result.type}</span>
            {#if result.deprecated}
                <span class="badge bg-secondary">deprecated</span>
            {/if}
        </p>
        <p>
            <HighlightMatches
                text={result.description.text}
                matches={result.description.matches}
                maxLength={descriptionMaxLength}
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
        cursor: pointer;
    }

    .format:hover {
        color: var(--me-core-purple);
        cursor: pointer;
    }
</style>
