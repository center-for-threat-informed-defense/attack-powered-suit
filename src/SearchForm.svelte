<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { initializeSearch, search } from "./search.js";

    export let results = [];

    const dispatch = createEventDispatcher();

    let query = "the"; // TODO
    let techniquesEnabled = true;
    let subtechniquesEnabled = true;
    let mitigationsEnabled = true;
    let softwareEnabled = true;
    let tacticsEnabled = true;
    let dataSourcesEnabled = true;
    let groupsEnabled = true;
    let deprecatedEnabled = false;

    onMount(() => {
        initializeSearch();
    });

    // Update search results whenever the query or filters are modified.
    $: {
        results = search(query, {
            technique: techniquesEnabled,
            subtechnique: subtechniquesEnabled,
            mitigation: mitigationsEnabled,
            software: softwareEnabled,
            tactic: tacticsEnabled,
            dataSource: dataSourcesEnabled,
            group: groupsEnabled,
            deprecated: deprecatedEnabled,
        });
    }
</script>

<h1>ATT&amp;CK® Powered Suit</h1>

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
    <div class="object-filters">
        <p class="text-muted small">
            Select the types of objects to include in search results:
        </p>
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
        </div>
        <div class="row">
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
                <!-- placeholder so all rows have equal columns -->
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

<style>
    input {
        margin-bottom: 0.5rem;
    }

    .search-row {
        display: flex;
    }

    .search-row *:first-child {
        flex-grow: 1;
    }

    .nav-icons * {
        color: var(--bs-red);
        display: block;
        margin-left: 0.5em;
        position: relative;
        top: 0.4em;
    }

    .nav-icons *:hover {
        color: var(--bs-secondary);
    }

    .object-filters {
        background-color: #e5ebf1;
        padding: 0.75rem;
        border-radius: 0.25rem;
    }
</style>
