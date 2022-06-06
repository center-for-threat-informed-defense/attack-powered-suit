<script>
    import SearchForm from "./SearchForm.svelte";
    import SearchResults from "./SearchResults.svelte";

    let results;
</script>

<div>
    <SearchForm bind:results on:showBookmarks on:showSettings />
    <SearchResults {results} />
</div>

<a href="https://ctid.mitre-engenuity.org/" target="_blank"
    ><img
        class="logo"
        src="/image/ctid-logo.jpg"
        alt="Logo for MITRE Engenuity Center for Threat-Informed Defense"
    /></a
>

<style>
    .logo {
        max-width: 20em;
        display: block;
        margin: 2em auto 1em auto;
    }
</style>
