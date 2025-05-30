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
    import { supportsClipboardItem } from "./Clipboard.js";

    const dispatch = createEventDispatcher();

    function newFormat() {
        addFormat("new format", "", "text/plain");
    }
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<div class="logo">
    <img
        src="/image/aps-logo-alt-1x.png"
        srcset="/image/aps-logo-alt-1x.png 1x, /image/aps-logo-alt-2x.png 2x, /image/aps-logo-alt-3x.png 3x"
        alt="ATT&CK Powered Suit logo"
    />
</div>
<h3><i class="bi bi-gear-fill" /> Settings</h3>

<div class="gray-box">
    You can add custom formats that copy snippets from search results. The
    following variables names can be used inside curly braces: <code
        >{"{description}"}</code
    >, <code>{"{name}"}</code>, <code>{"{fullName}"}</code>,
    <code>{"{parentName}"}</code>,
    <code>{"{id}"}</code>, <code>{"{type}"}</code>, <code>{"{url}"}</code>,
    <code>{"{stixId}"}</code>
</div>

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
                {#if !supportsClipboardItem()}
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
                            readonly="readonly"
                            type="text"
                            class="form-control"
                            title="MIME type is not supported in Firefox."
                            bind:value={format.mime}
                            on:input={saveFormats}
                        />
                    </td>
                {:else}
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
                {/if}
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

<p class="credits">
    ATT&CK Powered Suit is published by the <a href="https://ctid.mitre.org"
        >MITRE Center for Threat-Informed Defense</a
    >. Special thanks to Toshitaka Satomi from Fujitsu for sharing the idea and
    code.
    <i
        class="bi
        bi-stars"
    />
</p>

<p />

<style>
    .logo {
        text-align: center;
    }

    .remove-format {
        cursor: pointer;
        color: var(--mitre-blue);
    }

    .remove-format:hover {
        color: var(--mitre-light-blue);
    }

    .credits {
        margin: 0 auto;
        color: var(--bs-gray-600);
        font-size: 0.8em;
        border-top: 1px solid var(--bs-gray-400);
        margin-top: 1rem;
        padding-top: 0.5rem;
    }
</style>
