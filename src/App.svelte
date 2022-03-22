<script>
    import SearchForm from "./SearchForm.svelte";
    import SearchResults from "./SearchResults.svelte";

    let results;
</script>

<main>
    <SearchForm bind:results />
    <SearchResults {results} />
</main>

<style>
    main {
        min-width: 600px;
        padding: 1em;
        margin: 0 auto;
    }
</style>
