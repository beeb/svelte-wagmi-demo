<script lang="ts">
  import { mainnet, sepolia } from "@wagmi/core/chains";
  import { injected } from "@wagmi/connectors";
  import { connect, getAccount, http, createConfig } from "@wagmi/core";
  import { untrack } from "svelte";

  const config = $state(
    createConfig({
      chains: [mainnet, sepolia],
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
      },
    }),
  );
  const { address } = $derived(getAccount(config));

  $effect(() => {
    (async () => {
      try {
        await connect(
          untrack(() => config),
          { connector: injected() },
        );
      } catch (err) {
        console.error(err);
      }
    })();
  });
</script>

<h1>Welcome to SvelteKit</h1>

<div>{address}</div>
