<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
</script>

<div>
    <button
        class="btn btn-block btn-primary btn-sm"
        on:click={() => dispatch("back")}
    >
        <i class="bi bi-caret-left-fill" />
        Back
    </button>
</div>

<style>
    button {
        position: absolute;
        left: 1rem;
        top: 2.3rem;
    }
</style>
