<script lang="ts">
  import { mainnet, sepolia } from "@wagmi/core/chains";
  import { injected } from "@wagmi/connectors";
  import { connect, getAccount, http, createConfig } from "@wagmi/core";
  import { untrack } from "svelte";
  import { Wagmi } from "$lib/index.svelte";

  const wagmi = new Wagmi({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });

  $effect(() => {
    (async () => {
      await wagmi.connect();
    })();
  });
</script>

<h1>Welcome to SvelteKit</h1>

<div>{wagmi.account.address}</div>
