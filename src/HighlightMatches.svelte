<script>
    const FROM_RIGHT = true;
    const FROM_LEFT = false;
    export let text;
    export let matches;
    export let maxLength = null;

    // Trim a string to a specified length.
    //
    // If fromRight is true, start at the right end and move left to find the
    // appropriate length. Otherwise start at the left end and move right. Add ellipses
    // as appropriate.
    function snippet(str, length, direction = FROM_RIGHT) {
        let snip;
        if (str.length > length) {
            if (direction == FROM_RIGHT) {
                // Scan right from the length to the first space (or end of string if
                // no more spaces.
                let idx = length + 1;
                while (idx < str.length && str.charAt(idx) != " ") {
                    idx++;
                }
                snip = str.substring(0, idx) + "…";
            } else {
                // Scan left from the starting point to the first space (or end of
                // string if no more spaces.
                let idx = str.length - length;
                while (idx >= 0 && str.charAt(idx) != " ") {
                    idx--;
                }
                snip = "…" + str.substring(idx);
            }
        } else {
            snip = str;
        }
        return [snip, str.length - snip.length];
    }

    let segments;
    $: {
        // Process the text into a series of alternating segments. Each odd-numbered
        // index is highlighted and each even-numbered index is not.
        segments = [];
        let lowIdx = 0;
        for (const match of matches) {
            const unhighlighted = text.substring(lowIdx, match[0]);
            segments.push(unhighlighted);
            const highlighted = text.substring(match[0], match[1]);
            segments.push(highlighted);
            lowIdx = match[1];
        }

        // The previous section leaves the text to the right of the last highlight
        // unprocessed, so we pull that in here.
        const lastSegment = text ? text.substring(lowIdx) : "";
        if (lastSegment.length > 0) {
            segments.push(lastSegment);
        }

        // Now enforce the maxLength constraint.
        if (maxLength) {
            // Two basic approaches here:
            if (segments.length == 1) {
                // If there is only 1 segment, then there are no highlights and we can
                // just trim the right side of the segment.
                const [snip, removed] = snippet(
                    segments[0],
                    maxLength,
                    FROM_RIGHT
                );
                segments[0] = snip;
            } else {
                let totalLength = segments.reduce(
                    (total, segment) => total + segment.length,
                    0
                );

                // If there are multiple segments, start by snipping the first segment.
                const firstSnipLength = Math.ceil(maxLength / 2);
                const [snip0, snip0Removed] = snippet(
                    segments[0],
                    firstSnipLength,
                    FROM_LEFT
                );
                segments[0] = snip0;
                totalLength -= snip0Removed;

                // Now pop segments off the end to get under the maxLength, but keep at
                // least 2 segments (so we keep at least one highlighted).
                let segment = null;
                while (totalLength > maxLength && segments.length > 2) {
                    segment = segments.pop();
                    totalLength -= segment.length;
                }

                // Now add however many remaining characters we have from the last
                // popped segment.
                if (segment !== null) {
                    const [snip, removed] = snippet(
                        segment,
                        maxLength - totalLength,
                        FROM_RIGHT
                    );
                    segments.push(snip);
                }
            }
        }
    }
</script>

{#each segments as segment, index}
    <span class:highlight={index % 2 == 1}>{segment}</span>
{/each}

<style>
    .highlight {
        color: var(--me-ext-orange-dark);
    }
</style>
