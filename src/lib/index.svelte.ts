import { injected } from "@wagmi/connectors";
import {
	http,
	type CreateConfigParameters,
	connect,
	createConfig,
	getAccount,
} from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";

export class Wagmi {
	config: ReturnType<typeof createConfig> = $state(
		createConfig({
			chains: [mainnet],
			transports: {
				[mainnet.id]: http(),
			},
		}),
	);
	account = $derived(getAccount(this.config));

	constructor(config: CreateConfigParameters) {
		this.config = createConfig(config);
	}

	connect = async () => {
		await connect(this.config, { connector: injected() });
	};
}
