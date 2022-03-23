<script>
    import BookmarksPanel from "./BookmarksPanel.svelte";
    import SearchPanel from "./SearchPanel.svelte";
    import SettingsPanel from "./SettingsPanel.svelte";

    let selectedPanel = "bookmarks";
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
