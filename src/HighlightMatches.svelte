<script>
    export let text;
    export let matches;
    export let maxLength = null;

    // Process the text into a series of alternating segments. Each odd-numbered
    // index is highlight and each even-numbered index is not.
    let segments;
    $: {
        segments = [];
        let lowIdx = 0;
        let cumulativeLength = 0;
        for (const match of matches) {
            const unhighlighted = text.substring(lowIdx, match[0]);
            segments.push(unhighlighted);
            const highlighted = text.substring(match[0], match[1] + 1);
            segments.push(highlighted);
            lowIdx = match[1] + 1;
            cumulativeLength += unhighlighted.length + highlighted.length;

            // The maxLength algorithm will always include at least one
            // highlighted segment, but this can cause the text to exceed
            // maxLength considerably if the first segment is very long.
            if (maxLength && cumulativeLength > maxLength) {
                segments.push("…");
                break;
            }
        }

        const lastSegment = text.substring(lowIdx);
        if (maxLength && cumulativeLength + lastSegment.length > maxLength) {
            segments.push(
                lastSegment.substring(0, maxLength - cumulativeLength)
            );
        } else {
            segments.push(lastSegment);
        }
    }
</script>

{#each segments as segment, index}
    <span class:highlight={index % 2 == 1}>{segment}</span>
{/each}

<style>
    .highlight {
        color: var(--bs-red);
    }
</style>
