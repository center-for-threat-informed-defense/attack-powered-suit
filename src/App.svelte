<script>
    import BookmarksPanel from "./BookmarksPanel.svelte";
    import SearchPanel from "./SearchPanel.svelte";
    import SettingsPanel from "./SettingsPanel.svelte";

    const params = new URLSearchParams(window.location.search);
    let selectedPanel = params.get("view") || "search";
    selectedPanel = "bookmarks"; //TODO
</script>

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
