<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import {
        removeFormat,
        formatsStore,
        saveFormats,
        addFormat,
    } from "./formats.js";
    import BackButton from "./BackButton.svelte";

    const dispatch = createEventDispatcher();

    function newFormat() {
        addFormat("new format", "", "text/plain");
    }
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<h2>ATT&CK® Powered Suit</h2>
<h3><i class="bi bi-gear-fill" /> Settings</h3>

<table class="table">
    <thead>
        <tr>
            <th>Name</th>
            <th>Format</th>
            <th>MIME Type</th>
            <th><!--Delete icon column--></th>
        </tr>
    </thead>
    <tbody>
        {#if $formatsStore.length == 0}
            <tr>
                <td class="nothing-found" colspan="999">No formats found.</td>
            </tr>
        {/if}
        {#each $formatsStore as format, formatIdx (format.id)}
            <tr out:fade>
                <td
                    ><input
                        type="text"
                        class="form-control"
                        bind:value={format.name}
                        on:input={saveFormats}
                    /></td
                >
                <td>
                    <input
                        type="text"
                        class="form-control"
                        bind:value={format.rule}
                        on:input={saveFormats}
                    />
                </td>
                <td>
                    <input
                        type="text"
                        class="form-control"
                        bind:value={format.mime}
                        on:input={saveFormats}
                    />
                </td>
                <td class="remove-format"
                    ><i
                        on:click={() => removeFormat(format.id)}
                        title="Remove this format"
                        class="bookmark-icon bi bi-trash-fill"
                    /></td
                >
            </tr>
        {/each}
    </tbody>
</table>

<p>
    <button class="btn btn-primary btn-sm" on:click={newFormat}
        ><i class="bookmark-icon bi bi-plus-circle-fill" /> Add New Format</button
    >
</p>

<div class="gray-box">
    You can add custom formats to make it easy to copy snippets from search
    results. Variables inside curly braces are expanded automatically.
    <ul>
        <li>
            <code>{"{description}"}</code>
            <i class="bi bi-arrow-right" />
            Description of ATT&CK object
        </li>
        <li>
            <code>{"{name}"}</code>
            <i class="bi bi-arrow-right" />
            Name of ATT&CK object
        </li>
        <li>
            <code>{"{id}"}</code>
            <i class="bi bi-arrow-right" />
            ATT&CK object identifier
        </li>
        <li>
            <code>{"{url}"}</code>
            <i class="bi bi-arrow-right" />
            URL for ATT&CK object
        </li>
    </ul>
</div>

<style>
    .remove-format {
        color: var(--bs-danger);
    }

    .remove-format:hover {
        color: var(--bs-secondary);
    }
</style>
