<script>
    import { createEventDispatcher } from "svelte";
    import BackButton from "./BackButton.svelte";

    const dispatch = createEventDispatcher();
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<h2>ATT&CK® Powered Suit</h2>
<h3><i class="bi bi-gear-fill" /> Settings</h3>

SETTINGS
