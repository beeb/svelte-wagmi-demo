<script lang="ts">
  import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
  import { mainnet, arbitrum } from '@reown/appkit/networks'
  import { PUBLIC_APPKIT_PROJECT_ID } from '$env/static/public'
  import { Web3 } from '$lib/web3.svelte'
  import '../app.css'

  const { children } = $props()

  const wagmiAdapter = new WagmiAdapter({
    projectId: PUBLIC_APPKIT_PROJECT_ID,
    networks: [mainnet, arbitrum]
  })
  Web3.init(wagmiAdapter, {
    networks: [mainnet, arbitrum],
    metadata: {
      name: 'Test',
      description: 'Test',
      url: 'https://test.com',
      icons: ['https://test.com/icon.png']
    },
    projectId: PUBLIC_APPKIT_PROJECT_ID,
    features: {
      analytics: false
    }
  })
</script>

{@render children()}
