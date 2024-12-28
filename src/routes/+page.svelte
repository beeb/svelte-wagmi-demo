<script lang="ts">
  import { Web3 } from '$lib/web3.svelte'
  import { readContract } from '@wagmi/core'
  import { mainnet, arbitrum } from '@reown/appkit/networks'
  import { formatUnits, isAddress, parseAbi, type Address } from 'viem'

  const addresses = new Map<number | string, Address>([
    [mainnet.id, '0xdac17f958d2ee523a2206206994597c13d831ec7'],
    [arbitrum.id, '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9']
  ])

  const web3 = Web3.getInstance()

  let decimals = $state(6)
  const usdtAddress = $derived(web3.network?.id ? addresses.get(web3.network?.id) : undefined)
  const balance = $derived(usdtAddress && web3.address ? updateBalance(usdtAddress, web3.address) : 0n)

  async function updateDecimals(token: Address) {
    decimals = await readContract(web3.adapter.wagmiConfig, {
      abi: parseAbi(['function decimals() view returns (uint8)']),
      address: token,
      functionName: 'decimals'
    })
  }

  isAddress

  async function updateBalance(token: Address, account: string) {
    if (!token) return 0n
    await updateDecimals(token)
    if (web3.network?.chainNamespace !== 'eip155' || !isAddress(account)) return 0n
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
  {#if web3.isConnected}
    {#await balance}
      <div>Loading balance...</div>
    {:then bal}
      <div>USDT balance on chain {web3.network?.id}: {formatUnits(bal, decimals)}</div>
    {:catch error}
      <div>Error while loading balance: {error.message}</div>
    {/await}
  {/if}
</div>
