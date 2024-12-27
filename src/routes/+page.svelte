<script lang="ts">
  import { Wagmi } from '$lib/index.svelte'
  import { untrack } from 'svelte'

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
  <div><button onclick={async () => await wagmi.connect()}>Connect</button></div>
{/if}
{#if wagmi.account.isConnected}
  <div><button onclick={async () => await wagmi.disconnect()}>Disconnect</button></div>
{/if}
