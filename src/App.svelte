<script>
    import { onMount } from "svelte";

    import BookmarksPanel from "./BookmarksPanel.svelte";
    import SearchPanel from "./SearchPanel.svelte";
    import SettingsPanel from "./SettingsPanel.svelte";
    import { initializeBookmarks } from "./bookmarks";
    import { initializeFormats } from "./formats";

    const params = new URLSearchParams(window.location.search);
    let selectedPanel = params.get("view") || "search";

    onMount(async () => {
        await initializeBookmarks();
        await initializeFormats();
    });
</script>

<main>
    <div class:d-none={selectedPanel != "search"}>
        <SearchPanel
            on:showBookmarks={() => (selectedPanel = "bookmarks")}
            on:showSettings={() => (selectedPanel = "settings")}
        />
    </div>
    <div class:d-none={selectedPanel != "bookmarks"}>
        <BookmarksPanel on:showSearch={() => (selectedPanel = "search")} />
    </div>
    <div class:d-none={selectedPanel != "settings"}>
        <SettingsPanel on:showSearch={() => (selectedPanel = "search")} />
    </div>
</main>

<style>
    main {
        padding-bottom: 1em;
    }
</style>
