<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { initializeSearch, search } from "./search.js";
    import { filters } from "./filters";

    export let results = null;

    let query = "";

    const dispatch = createEventDispatcher();

    onMount(() => {
        initializeSearch().then(() => {
            const params = new URLSearchParams(window.location.search);
            query = params.get("q") || "";
        });
    });

    function setAllFilters(enabled) {
        const newFilters = {};
        for (const key of Object.keys($filters)) {
            if (key !== "includeDeprecated") {
                newFilters[key] = enabled;
            }
        }
        filters.set(newFilters);
    }

    // Update search results whenever the query or filters are modified.
    $: {
        if (query.trim().length < 3) {
            results = null;
        } else {
            results = search(query, {
                technique: $filters["includeTechniques"],
                subtechnique: $filters["includeSubtechniques"],
                mitigation: $filters["includeMitigations"],
                software: $filters["includeSoftware"],
                tactic: $filters["includeTactics"],
                dataSource: $filters["includeDataSources"],
                group: $filters["includeGroups"],
                campaign: $filters["includeCampaigns"],
                Enterprise: $filters["includeEnterprise"],
                ICS: $filters["includeIcs"],
                Mobile: $filters["includeMobile"],
                deprecated: $filters["includeDeprecated"],
            });
        }
    }
</script>

<div class="title">
    <img
        class="aps-logo"
        src="/image/aps-logo-1x.png"
        srcset="/image/aps-logo-1x.png 1x, /image/aps-logo-2x.png 2x, /image/aps-logo-3x.png 3x"
        alt="Logo for ATT&CK Powered Suit"
    />
    <a class="ctid-logo" href="https://ctid.mitre.org/" target="_blank"
        ><img
            src="/image/ctid-logo.svg"
            alt="Logo for MITRE Center for Threat-Informed Defense"
        /></a
    >
</div>

<form on:submit={(e) => e.preventDefault()}>
    <div class="search-row">
        <div class="form-floating">
            <!-- svelte-ignore a11y-autofocus -->
            <input
                id="searchTerms"
                type="text"
                class="form-control"
                placeholder="Search ATT&amp;CK…"
                bind:value={query}
                autofocus
            />
            <label for="searchTerms">Search ATT&amp;CK…</label>
        </div>
        <div class="nav-icons">
            <i
                class="bi bi-bookmarks"
                title="View bookmarks"
                on:click={() => dispatch("showBookmarks")}
            />
            <i
                class="bi bi-gear"
                title="View settings"
                on:click={() => dispatch("showSettings")}
            />
        </div>
    </div>
    <div class="gray-box">
        <p class="select-controls">
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a href="#" on:click={() => setAllFilters(true)}>Select all</a>
            |
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a href="#" on:click={() => setAllFilters(false)}>none</a>
        </p>
        <div class="row">
            <div class="col-sm-4">
                <div class="form-check form-switch">
                    <input
                        id="tactics"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeTactics"]}
                    />
                    <label for="tactics" class="form-check-label">Tactics</label
                    >
                </div>
            </div>
            <div class="col-sm-4">
                <div class="form-check form-switch">
                    <input
                        id="mitigations"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeMitigations"]}
                    />
                    <label for="mitigations" class="form-check-label"
                        >Mitigations</label
                    >
                </div>
            </div>
            <div class="col-sm-4 separator-left">
                <div class="form-check form-switch">
                    <input
                        id="enterprise"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeEnterprise"]}
                    />
                    <label for="enterprise" class="form-check-label"
                        >Enterprise</label
                    >
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-4">
                <div class="form-check form-switch">
                    <input
                        id="techniques"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeTechniques"]}
                    />
                    <label for="techniques" class="form-check-label"
                        >Techniques</label
                    >
                </div>
            </div>
            <div class="col-sm-4">
                <div class="form-check form-switch">
                    <input
                        id="software"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeSoftware"]}
                    />
                    <label for="software" class="form-check-label"
                        >Software</label
                    >
                </div>
            </div>
            <div class="col-sm-4 separator-left">
                <div class="form-check form-switch">
                    <input
                        id="ics"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeIcs"]}
                    />
                    <label for="ics" class="form-check-label">ICS</label>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-4">
                <div class="form-check form-switch">
                    <input
                        id="subtechniques"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeSubtechniques"]}
                    />
                    <label for="subtechniques" class="form-check-label"
                        >Sub-techniques</label
                    >
                </div>
            </div>
            <div class="col-sm-4">
                <div class="form-check form-switch">
                    <input
                        id="groups"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeGroups"]}
                    />
                    <label for="groups" class="form-check-label">Groups</label>
                </div>
            </div>
            <div class="col-sm-4 separator-left">
                <div class="form-check form-switch">
                    <input
                        id="mobile"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeMobile"]}
                    />
                    <label for="mobile" class="form-check-label">Mobile</label>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-4">
                <div class="form-check form-switch">
                    <input
                        id="campaigns"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeCampaigns"]}
                    />
                    <label for="campaigns" class="form-check-label"
                        >Campaigns</label
                    >
                </div>
            </div>
            <div class="col-sm-4">
                <div class="form-check form-switch">
                    <input
                        id="dataSources"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeDataSources"]}
                    />
                    <label for="dataSources" class="form-check-label"
                        >Data Sources</label
                    >
                </div>
            </div>
            <div class="col-sm-4 separator-left">
                <div class="form-check form-switch">
                    <input
                        id="deprecated"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeDeprecated"]}
                    />
                    <label for="deprecated" class="form-check-label"
                        >Deprecated</label
                    >
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-8">
                <p class="legend">
                    Select the types of objects to include in search results.
                </p>
            </div>
            <!-- <div class="col"></div> -->
            <div class="col-sm-4 separator-left">
                <p class="legend">Filter by domain, etc.</p>
            </div>
        </div>
    </div>
</form>

{#if results === null}
    <p class="notice">ATT&CK Powered Suit uses MITRE ATT&CK® v17.1.</p>
{/if}

<style>
    div.title {
        clear: both;
        margin-top: 0.5em;
        margin-bottom: 1em;
    }

    div.title a.ctid-logo {
        display: block;
        float: right;
    }

    div.title a.ctid-logo img {
        margin-top: 1.2rem;
        width: 15rem;
    }

    input {
        margin-bottom: 0.5rem;
    }

    .gray-box {
        position: relative;
        padding: 1.25rem 0.75rem 0.75rem 0.75rem;
    }

    .select-controls {
        position: absolute;
        top: 2px;
        right: 6px;
        color: #6c757d !important;
        font-size: 0.75em;
    }

    .separator-left {
        border-left: 1px solid #bfbfbf;
    }

    .form-check-input:checked {
        background-color: var(--mitre-blue);
        border-color: var(--mitre-blue);
    }

    .legend {
        color: #6c757d !important;
        font-size: 0.75em;
        margin-top: 0.5em;
        margin-bottom: 0;
    }

    .search-row {
        display: flex;
    }

    .search-row *:first-child {
        flex-grow: 1;
    }

    .nav-icons * {
        color: var(--mitre-navy);
        display: block;
        margin-left: 0.5em;
        position: relative;
        top: 0.4em;
    }

    .nav-icons *:hover {
        color: var(--bs-secondary);
    }

    .notice {
        margin: 1em 0 0 0;
        color: var(--bs-secondary);
        text-align: center;
        font-size: 10pt;
    }
</style>
