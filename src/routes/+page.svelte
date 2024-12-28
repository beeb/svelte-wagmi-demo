<script lang="ts">
  import { Web3 } from '$lib/web3.svelte'
  import { readContract } from '@wagmi/core'
  import { mainnet, arbitrum } from '@reown/appkit/networks'
  import { formatUnits, parseAbi, type Address } from 'viem'

  const addresses = new Map<number | string, Address>([
    [mainnet.id, '0xdac17f958d2ee523a2206206994597c13d831ec7'],
    [arbitrum.id, '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9']
  ])

  const web3 = Web3.getInstance()

  let decimals = $state(6)
  const usdtAddress = $derived(addresses.get(web3.chainId ?? 1) || '0xdac17f958d2ee523a2206206994597c13d831ec7')
  const balance = $derived(updateBalance(usdtAddress, web3.address))

  async function updateDecimals(token: Address) {
    decimals = await readContract(web3.adapter.wagmiConfig, {
      abi: parseAbi(['function decimals() view returns (uint8)']),
      address: token,
      functionName: 'decimals'
    })
  }

  async function updateBalance(token: Address, account: Address | undefined) {
    await updateDecimals(token)
    if (!account) return 0n
    return await readContract(web3.adapter.wagmiConfig, {
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      address: token,
      functionName: 'balanceOf',
      args: [account]
    })
  }
</script>

<div class="container mx-auto mt-4">
  <div class="flex mb-8">
    <h1 class="text-4xl font-bold flex-grow">Demo</h1>
    <appkit-button></appkit-button>
  </div>
  {#await balance}
    Loading balance...
  {:then bal}
    <div>USDT balance on chain {web3.chainId}: {formatUnits(bal, decimals)}</div>
  {/await}
</div>
