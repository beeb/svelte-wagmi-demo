<script lang="ts">
  import { Wagmi } from '$lib/index.svelte'

  const wagmi = Wagmi.getInstance()

  $effect(() => {
    ;(async () => {
      await wagmi.reconnect()
    })()
  })

  async function connect() {
    await wagmi.connect()
  }
</script>

<h1>Welcome to SvelteKit</h1>

{#if wagmi.connections.length > 0}
  <div>{wagmi.account.address}</div>
{:else}
  <div><button onclick={() => connect()}>Connect</button></div>
{/if}
