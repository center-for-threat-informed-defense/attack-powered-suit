<script>
    import HighlightMatches from "./HighlightMatches.svelte";

    export let results = [];

    // Reformat the results so that they can be fed into the highlighter
    // component.
    let highlightedResults = [];
    $: {
        highlightedResults = [];
        for (const result of results) {
            const { item, matches } = result;
            const highlightedResult = {
                id: { text: item.id, matches: [] },
                type: item.type,
                deprecated: item.deprecated,
                name: { text: item.name, matches: [] },
                description: { text: item.description, matches: [] },
                url: { text: item.url, matches: [] },
            };
            for (const match of matches) {
                const { key, indices } = match;
                highlightedResult[key]["matches"] = indices;
            }
            highlightedResults.push(highlightedResult);
        }
    }
</script>

{#each highlightedResults as result}
    <div class="search-result">
        <p>
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
                maxLength={400}
            />
        </p>
    </div>
{/each}

<style>
    .search-result {
        margin-top: 1em;
    }

    .result-id,
    .result-name {
        font-weight: 700;
    }
</style>
