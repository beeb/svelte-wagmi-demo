<script lang="ts">
  import { Web3 } from "$lib/web3.svelte";
  import { readContract } from "@wagmi/core";
  import { mainnet, arbitrum, solana } from "@reown/appkit/networks";
  import { formatUnits, isAddress, parseAbi, type Address } from "viem";
  import { PublicKey } from "@solana/web3.js";

  const addresses = new Map<number | string, string>([
    [mainnet.id, "0xdac17f958d2ee523a2206206994597c13d831ec7"],
    [arbitrum.id, "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"],
    [solana.id, "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"],
  ]);

  const web3 = Web3.getInstance();

  const usdtAddress = $derived(
    web3.network?.id ? addresses.get(web3.network?.id) : undefined,
  );
  const balance = $derived(
    usdtAddress && web3.address
      ? getBalance(usdtAddress, web3.address)
      : { balance: 0n, decimals: 6 },
  );

  async function getDecimals(token: Address) {
    if (web3.network?.chainNamespace === "eip155" && isAddress(token)) {
      return await readContract(web3.wagmi, {
        abi: parseAbi(["function decimals() view returns (uint8)"]),
        address: token,
        functionName: "decimals",
      });
    }
    return 6;
  }

  async function getBalance(token: string, account: string) {
    if (!token) return { balance: 0n, decimals: 6 };
    if (
      web3.network?.chainNamespace === "eip155" &&
      isAddress(token) &&
      isAddress(account)
    ) {
      const decimals = await getDecimals(token);
      const balance = await readContract(web3.wagmi, {
        abi: parseAbi(["function balanceOf(address) view returns (uint256)"]),
        address: token,
        functionName: "balanceOf",
        args: [account],
      });
      return { balance, decimals };
    }
    if (web3.solConnection) {
      const tokenAddress = new PublicKey(token);
      const tokenAccount = (
        await web3.solConnection.getTokenAccountsByOwner(
          new PublicKey(account),
          {
            mint: tokenAddress,
          },
        )
      ).value.at(0);
      if (!tokenAccount) {
        return { balance: 0n, decimals: 6 };
      }
      const balance = await web3.solConnection.getTokenAccountBalance(
        tokenAccount.pubkey,
      );
      return {
        balance: BigInt(balance.value.amount),
        decimals: balance.value.decimals,
      };
    }
    return { balance: 0n, decimals: 6 };
  }
</script>

<div class="container mx-auto mt-4">
  <div class="flex mb-8">
    <h1 class="text-4xl font-bold grow">Demo</h1>
    <appkit-button></appkit-button>
  </div>
  {#if web3.isConnected}
    {#await balance}
      <div>Loading balance...</div>
    {:then { balance: bal, decimals }}
      <div>
        USDT balance on chain {web3.network?.name}: {formatUnits(bal, decimals)}
      </div>
    {:catch error}
      <div>Error while loading balance: {error.message}</div>
    {/await}
  {/if}
</div>
