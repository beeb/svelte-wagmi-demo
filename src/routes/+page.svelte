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

  let balance = $state(0n)
  let decimals = $state(6)
  const usdtAddress = $derived(addresses.get(web3.chainId ?? 1) || '0xdac17f958d2ee523a2206206994597c13d831ec7')

  const updateDecimals = async (token: Address) => {
    decimals = await readContract(web3.adapter.wagmiConfig, {
      abi: parseAbi(['function decimals() view returns (uint8)']),
      address: token,
      functionName: 'decimals'
    })
  }

  const updateBalance = async (token: Address, account: Address) => {
    await updateDecimals(token)
    balance = await readContract(web3.adapter.wagmiConfig, {
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      address: token,
      functionName: 'balanceOf',
      args: [account]
    })
  }

  $effect(() => {
    if (web3.address) {
      updateBalance(usdtAddress, web3.address)
    }
  })
</script>

<div class="container mx-auto mt-4">
  <div class="flex mb-8">
    <h1 class="text-4xl font-bold flex-grow">Demo</h1>
    <appkit-button></appkit-button>
  </div>
  {#if web3.address}
    <div>USDT balance on chain {web3.chainId}: {formatUnits(balance, decimals)}</div>
  {/if}
</div>
