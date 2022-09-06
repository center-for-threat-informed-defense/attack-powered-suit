<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { initializeSearch, search } from "./search.js";

    export let results = null;

    const dispatch = createEventDispatcher();

    // Initialized isn't currently used, but might be useful, e.g. for a loading
    // screen.
    let initialized = false;

    let query = "";
    let techniquesEnabled = true;
    let subtechniquesEnabled = true;
    let mitigationsEnabled = true;
    let softwareEnabled = true;
    let tacticsEnabled = true;
    let dataSourcesEnabled = true;
    let groupsEnabled = true;
    let deprecatedEnabled = false;
    let enterpriseEnabled = true;
    let icsEnabled = true;
    let mobileEnabled = true;

    onMount(() => {
        initializeSearch().then(() => {
            initialized = true;
            const params = new URLSearchParams(window.location.search);
            query = params.get("q") || "";
        });
    });

    // Update search results whenever the query or filters are modified.
    $: {
        if (query.trim() == "") {
            results = null;
        } else {
            results = search(query, {
                technique: techniquesEnabled,
                subtechnique: subtechniquesEnabled,
                mitigation: mitigationsEnabled,
                software: softwareEnabled,
                tactic: tacticsEnabled,
                dataSource: dataSourcesEnabled,
                group: groupsEnabled,
                deprecated: deprecatedEnabled,
                Enterprise: enterpriseEnabled,
                ICS: icsEnabled,
                Mobile: mobileEnabled,
            });
        }
    }
</script>

<div class="title">
    <a class="logo" href="https://ctid.mitre-engenuity.org/" target="_blank"
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
            <input
                id="searchTerms"
                type="text"
                class="form-control"
                placeholder="Search ATT&amp;CK…"
                bind:value={query}
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
        <p class="text-muted small">
            Select the types of objects to include in search results:
        </p>
        <div class="row">
            <div class="col">
                <div class="form-check form-switch">
                    <input
                        id="tactics"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={tacticsEnabled}
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
                        bind:checked={mitigationsEnabled}
                    />
                    <label for="mitigations" class="form-check-label"
                        >Mitigations</label
                    >
                </div>
            </div>
            <div class="col">
                <div class="form-check form-switch">
                    <input
                        id="Enterprise"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={enterpriseEnabled}
                    />
                    <label for="mitigations" class="form-check-label"
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
                        bind:checked={techniquesEnabled}
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
                        bind:checked={softwareEnabled}
                    />
                    <label for="software" class="form-check-label"
                        >Software</label
                    >
                </div>
            </div>
            <div class="col">
                <div class="form-check form-switch">
                    <input
                        id="ICS"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={icsEnabled}
                    />
                    <label for="mitigations" class="form-check-label">ICS</label
                    >
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
                        bind:checked={subtechniquesEnabled}
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
                        bind:checked={groupsEnabled}
                    />
                    <label for="groups" class="form-check-label">Groups</label>
                </div>
            </div>
            <div class="col">
                <div class="form-check form-switch">
                    <input
                        id="Mobile"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={mobileEnabled}
                    />
                    <label for="mitigations" class="form-check-label"
                        >Mobile</label
                    >
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <!-- placeholder so all rows have equal columns -->
            </div>
            <div class="col">
                <div class="form-check form-switch">
                    <input
                        id="dataSources"
                        type="checkbox"
                        role="switch"
                        class="form-check-input"
                        bind:checked={dataSourcesEnabled}
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
                        bind:checked={deprecatedEnabled}
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
    <p class="notice">Powered Suit uses MITRE ATT&CK® v11.</p>
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
