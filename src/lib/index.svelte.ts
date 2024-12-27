import {
	http,
	type CreateConfigParameters,
	connect,
	createConfig,
	getAccount,
	getConnections,
	reconnect,
} from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";

export class Wagmi {
	private static instance: Wagmi;

	config: ReturnType<typeof createConfig> = $state(
		createConfig({
			chains: [mainnet],
			transports: {
				[mainnet.id]: http(),
			},
		}),
	);
	connections = $derived(getConnections(this.config));
	account = $derived(getAccount(this.config));

	private constructor(config: CreateConfigParameters) {
		this.config = createConfig(config);
	}

	public static init(config: CreateConfigParameters) {
		if (!Wagmi.instance) {
			Wagmi.instance = new Wagmi(config);
		}
		return Wagmi.instance;
	}

	public static getInstance() {
		if (!Wagmi.instance) {
			throw new Error("Wagmi not initialized");
		}
		return Wagmi.instance;
	}

	reconnect = async () => {
		await reconnect(this.config);
	};

	connect = async () => {
		await connect(this.config, {
			connector: this.config.connectors[0],
		});
	};
}
