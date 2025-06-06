<script>
    import sanitizeHtml from "sanitize-html";

    export let text;
    export let highlights;
    export let maxLength = null;

    /**
     * Highlights the specified regions of text.
     * @param text
     *  The text to highlight.
     * @param highlights
     *  The highlight regions (in ascending order).
     * @returns
     *  The highlighted text.
     */
    function highlight(text, highlights) {
        if (text === null || text === "") {
            return "";
        }
        let base = 0;
        let highlightedText = "";
        for (let i = 0; i < highlights.length; i++) {
            const h = highlights[i];
            highlightedText += text.slice(base, h[0]);
            highlightedText += `<mark>${text.slice(h[0], h[1])}</mark>`;
            base = h[1];
        }
        return highlightedText + text.slice(base, text.length);
    }

    /**
     * Cuts out a snippet of text surrounding the first chunk of highlighted
     * text. (Highlighted text is any text encapsulated in a <mark> tag.)
     * @param text
     *  The text to cut from.
     * @param length
     *  The length of the snippet (not including HTML tags).
     */
    function cutOutHighlightedSnippet(text, length) {
        if (length === null) {
            // If no length, return text as is
            return text;
        }
        const emptyTags = /<\s*?([a-zA-Z0-9]+)[^<>]*><\/\s*?([a-zA-Z0-9]+)\s*>/;
        // Tokenize text
        const tokens = text.split(/(<.*?>)/);
        // Select focal token
        let focalToken = tokens.indexOf("<mark>") + 1;
        // Recalculate max length
        length -= tokens[focalToken].length;
        if (length <= 0) {
            return tokens.slice(focalToken - 1, focalToken + 2).join();
        }
        // Find length of text on each side of focal token
        let l_len = 0,
            r_len = 0;
        for (let i = 0; i < tokens.length; i += 2) {
            if (i < focalToken) {
                l_len += tokens[i].length;
            }
            if (focalToken < i) {
                r_len += tokens[i].length;
            }
        }
        // Trim ends
        const swap = l_len <= r_len ? 0 : 1;
        for (let i = 0, extraExtent = 0; i < 2; i++) {
            if ((i + swap) % 2 === 0) {
                // Trim beginning
                let extent = Math.ceil(length / 2) + extraExtent;
                for (let i = focalToken - 2; 0 <= i; i -= 2) {
                    let clip = tokens[i];
                    if (extent === 0) {
                        tokens[i] = "";
                    } else if (clip.length <= extent) {
                        extent -= clip.length;
                    } else {
                        let j = clip.length - extent;
                        while (0 <= j && clip[j].match(/\S/)) {
                            j--;
                        }
                        extent = 0;
                        tokens[i] = `…${clip.slice(j + 1)}`;
                    }
                }
                extraExtent += extent;
            } else {
                // Trim end
                let extent = Math.floor(length / 2) + extraExtent;
                for (let i = focalToken + 2; i < tokens.length; i += 2) {
                    let clip = tokens[i];
                    if (extent === 0) {
                        tokens[i] = "";
                    } else if (clip.length <= extent) {
                        extent -= clip.length;
                    } else {
                        let j = extent;
                        while (j < clip.length && clip[j].match(/\S/)) {
                            j++;
                        }
                        extent = 0;
                        tokens[i] = `${clip.slice(0, j)}…`;
                    }
                }
                extraExtent += extent;
            }
        }
        // Filter empty HTML tags
        let trimmedText = tokens.join("");
        while (emptyTags.test(trimmedText)) {
            trimmedText = trimmedText.replace(
                emptyTags,
                (str, begTag, endTag) => {
                    if (begTag === endTag) {
                        return "";
                    } else if (
                        begTag == "br" ||
                        begTag == "img" ||
                        begTag == "hr"
                    ) {
                        // The beginning tag is self closing; remove it.
                        return str.replace(/<\w+?>/, "");
                    } else {
                        throw new Error(
                            "Unable to make any progress on trimming text.",
                        );
                    }
                },
            );
        }
        return trimmedText;
    }
</script>

<span class="markdown"
    >{@html sanitizeHtml(
        cutOutHighlightedSnippet(highlight(text, highlights), maxLength),
    )}</span
>

<style>
    :global(mark) {
        color: var(--mitre-blue);
    }
</style>
