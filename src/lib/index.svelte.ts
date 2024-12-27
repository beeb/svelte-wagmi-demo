import {
	http,
	type Connector,
	type CreateConfigParameters,
	type GetAccountReturnType,
	connect,
	createConfig,
	disconnect,
	getBlockNumber,
	getChainId,
	getConnectors,
	reconnect,
	watchAccount,
	watchBlockNumber,
	watchChainId,
} from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";

export class Wagmi {
	private static instance: Wagmi;

	config: ReturnType<typeof createConfig> = $state.raw(
		createConfig({
			chains: [mainnet],
			transports: {
				[mainnet.id]: http(),
			},
		}),
	);
	chainId = $state<number>();
	account = $state<GetAccountReturnType>({
		address: undefined,
		addresses: undefined,
		chain: undefined,
		chainId: undefined,
		connector: undefined,
		isConnected: false,
		isReconnecting: false,
		isConnecting: false,
		isDisconnected: true,
		status: "disconnected",
	});
	blockNumber = $state<bigint>();
	connectors = $derived(getConnectors(this.config));

	private constructor(config: CreateConfigParameters) {
		this.config = createConfig(config);
		this.initialUpdate();
		watchAccount(this.config, {
			onChange: (account) => {
				this.account = account;
			},
		});
		watchChainId(this.config, {
			onChange: (_chainId) => {
				this.initialUpdate();
			},
		});
		watchBlockNumber(this.config, {
			onBlockNumber: (blockNumber) => {
				this.blockNumber = blockNumber;
			},
		});
	}

	private initialUpdate = async () => {
		this.chainId = getChainId(this.config);
		this.blockNumber = await getBlockNumber(this.config);
	};

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
		console.log("reconnecting");
		await reconnect(this.config);
	};

	connect = async (connector: Connector) => {
		await connect(this.config, {
			connector,
		});
	};

	disconnect = async () => {
		await disconnect(this.config);
	};
}
