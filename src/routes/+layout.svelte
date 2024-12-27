<script lang="ts">
  import { Wagmi } from '$lib/index.svelte'
  import { arbitrum, mainnet, sepolia } from '@wagmi/core/chains'
  import { http, injected } from '@wagmi/core'
  import { metaMask } from '@wagmi/connectors'
  import '../app.css'

  const { children } = $props()

  Wagmi.init({
    chains: [mainnet, sepolia, arbitrum],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [arbitrum.id]: http()
    },
    connectors: [metaMask()]
  })
</script>

{@render children()}
