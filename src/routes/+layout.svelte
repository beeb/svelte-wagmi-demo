<script lang="ts">
  import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
  import { mainnet, arbitrum, solana } from '@reown/appkit/networks'
  import { SolanaAdapter } from '@reown/appkit-adapter-solana'
  import { PUBLIC_APPKIT_PROJECT_ID } from '$env/static/public'
  import { Web3 } from '$lib/web3.svelte'
  import '../app.css'

  const { children } = $props()

  const wagmiAdapter = new WagmiAdapter({
    projectId: PUBLIC_APPKIT_PROJECT_ID,
    networks: [mainnet, arbitrum]
  })
  const solanaAdapter = new SolanaAdapter({})
  Web3.init({
    evmAdapter: wagmiAdapter,
    solanaAdapter: solanaAdapter,
    appkitOptions: {
      networks: [mainnet, arbitrum, solana],
      metadata: {
        name: 'Test',
        description: 'Test',
        url: 'https://test.com',
        icons: ['https://test.com/icon.png']
      },
      projectId: PUBLIC_APPKIT_PROJECT_ID,
      features: {
        analytics: false,
        email: false,
        socials: false
      }
    }
  })
</script>

{@render children()}
