<script>
    import SearchForm from "./SearchForm.svelte";
    import SearchResults from "./SearchResults.svelte";

    let results;
</script>

<main>
    <SearchForm bind:results on:showBookmarks on:showSettings />
    <SearchResults {results} />
</main>
