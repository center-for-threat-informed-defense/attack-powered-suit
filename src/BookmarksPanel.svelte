<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import { bookmarksStore, removeBookmark } from "./bookmarks";
    import BackButton from "./BackButton.svelte";

    const dispatch = createEventDispatcher();
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<h2>ATT&CK® Powered Suit</h2>
<h3><i class="bi bi-bookmark-fill" /> Bookmarks</h3>

<table class="table">
    <thead>
        <tr>
            <th><!--Bookmark icon column--></th>
            <th>Object ID</th>
            <th>Name</th>
            <th>Color</th>
            <th>Score</th>
            <th>Notes</th>
        </tr>
    </thead>
    <tbody>
        {#if $bookmarksStore.length == 0}
            <tr>
                <td class="nothing-found" colspan="999"
                    >Create a bookmark by clicking the <i
                        class="bi bi-bookmark-plus-fill"
                    /> next to any search result.</td
                >
            </tr>
        {/if}
        {#each $bookmarksStore as bookmark, bookmarkIdx (bookmark.id)}
            <tr out:fade>
                <td
                    ><i
                        on:click={() => removeBookmark(bookmark.id)}
                        title="Remove this bookmark"
                        class="bookmark-icon bi bi-bookmark-check-fill"
                    /></td
                >
                <td>{bookmark.id}</td>
                <td>{bookmark.name}</td>
                <td
                    ><input
                        type="color"
                        class="form-control color-picker"
                        bind:value={bookmark.color}
                    /></td
                >
                <td>
                    <input
                        type="number"
                        class="form-control score-input"
                        bind:value={bookmark.score}
                    />
                </td>
                <td
                    ><input
                        type="text"
                        class="form-control"
                        bind:value={bookmark.notes}
                    /></td
                >
            </tr>
        {/each}
    </tbody>
</table>

<div class="export-layer">
    <p class="text-muted small">
        Export bookmarks for use in <a
            href="https://mitre-attack.github.io/attack-navigator/"
            target="_blank"
            >ATT&amp;CK Navigator <i class="bi bi-box-arrow-up-right" /></a
        >
    </p>
    <form>
        <div class="row">
            <div class="col">
                <div class="form-floating">
                    <input
                        id="attackDomain"
                        type="text"
                        class="form-control"
                        placeholder="ATT&amp;CK Domain"
                        required
                    />
                    <label for="attackDomain">ATT&amp;CK Domain</label>
                </div>
            </div>
            <div class="col">
                <div class="form-floating">
                    <input
                        id="layerTitle"
                        type="text"
                        class="form-control"
                        placeholder="Layer Title"
                        required
                    />
                    <label for="layerTitle">Layer Title</label>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="default-color-group">
                    <input
                        id="defaultColor"
                        type="color"
                        class="form-control color-picker"
                    />
                    <label for="defaultColor">Default Color</label>
                </div>
            </div>
            <div class="col">
                <button class="btn btn-primary">
                    <i class="bi bi-download" /> Export
                </button>
            </div>
        </div>
    </form>
</div>

<style>
    table td {
        vertical-align: middle;
    }

    form .row {
        margin-bottom: 0.5rem;
    }

    .bookmark-icon {
        color: var(--bs-success);
        font-size: 1.4em;
    }

    .bookmark-icon:hover {
        color: var(--bs-secondary);
    }

    .color-picker {
        display: inline-block;
        height: 2em;
        width: 2em;
        padding: 3px;
        margin: 0;
    }

    .score-input {
        width: 3.5em;
    }

    .export-layer {
        background-color: #e5ebf1;
        padding: 0.75rem;
        border-radius: 0.25rem;
    }

    .default-color-group label {
        position: relative;
        top: -0.3em;
    }
</style>
