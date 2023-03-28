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
    <a
        class="logo"
        href="https://mitre-engenuity.org/cybersecurity/center-for-threat-informed-defense/"
        target="_blank"
        ><img
            src="/image/ctid-logo.png"
            alt="Logo for MITRE Engenuity Center for Threat-Informed Defense"
        /></a
    >

    <h1>ATT&amp;CK Powered Suit</h1>
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
        <p class="text-muted small" style="float: right;">
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a href="#" on:click={() => setAllFilters(true)}>Select all</a>
            |
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a href="#" on:click={() => setAllFilters(false)}>none</a>
        </p>
        <p class="text-muted small">
            Select the types of objects to include in search results.
        </p>
        <div class="row">
            <div class="col">
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
            <div class="col">
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
            <div class="col">
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
            <div class="col">
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
            <div class="col">
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
            <div class="col">
                <div class="form-check form-switch">
                    <input
                        id="ics"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={$filters["includeIcs"]}
                        on:click={(e) => "clickFilterICS"()}
                    />
                    <label for="ics" class="form-check-label">ICS</label>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
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
            <div class="col">
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
            <div class="col">
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
            <div class="col">
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
            <div class="col">
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
            <div class="col">
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
    </div>
</form>

{#if results === null}
    <p class="notice">Powered Suit uses MITRE ATT&CK® v12.</p>
{/if}

<style>
    div.title {
        clear: both;
        margin-top: 0.5em;
        margin-bottom: 1.5em;
    }

    div.title a.logo {
        display: block;
        float: left;
    }

    div.title a.logo img {
        width: 8em;
    }

    div.title h1 {
        text-align: right;
        font-size: 28pt;
    }

    input {
        margin-bottom: 0.5rem;
    }

    .form-check-input:checked {
        background-color: var(--me-core-purple);
        border-color: var(--me-core-purple);
    }

    .search-row {
        display: flex;
    }

    .search-row *:first-child {
        flex-grow: 1;
    }

    .nav-icons * {
        color: var(--me-core-purple);
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
