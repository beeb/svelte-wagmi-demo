<script lang="ts">
  import { Wagmi } from '$lib/index.svelte'

  const wagmi = Wagmi.getInstance()

  $effect(() => {
    ;(async () => {
      await wagmi.reconnect()
    })()
  })
</script>

chain ID {wagmi.chainId} at block {wagmi.blockNumber}

<div>{wagmi.account.status} {wagmi.account.address}</div>
{#if wagmi.account.isDisconnected}
  {#each wagmi.connectors as connector}
    <div><button onclick={async () => await wagmi.connect(connector)}>Connect with {connector.name}</button></div>
  {/each}
{/if}
{#if wagmi.account.isConnected}
  <div><button onclick={async () => await wagmi.disconnect()}>Disconnect</button></div>
{/if}
