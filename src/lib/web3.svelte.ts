import { browser } from "$app/environment";
import {
	type AccountControllerState,
	type AppKit,
	type AppKitOptions,
	type ThemeMode,
	createAppKit,
} from "@reown/appkit";
import {
	type SolanaAdapter,
	SolHelpersUtil,
} from "@reown/appkit-adapter-solana";
import { solana } from "@reown/appkit/networks";
import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { CaipNetwork, ChainNamespace } from "@reown/appkit-common";
import { Connection } from "@solana/web3.js";

export type Web3Args = {
	evmAdapter?: WagmiAdapter;
	solanaAdapter?: SolanaAdapter;
	appkitOptions: Omit<AppKitOptions, "adapters">;
};

export class Web3 {
	private static instance: Web3;
	private projectId: string;

	evm: WagmiAdapter | undefined;
	solana: SolanaAdapter | undefined;
	appkit: AppKit | undefined;

	initialized = $state(false);
	loading = $state(false);
	open = $state(false); // Modal open state
	activeChain = $state<ChainNamespace>(); // 'eip155' | 'solana' | 'polkadot' | 'bip122'
	network = $state<CaipNetwork>();
	isConnected = $state(false);
	status = $state<AccountControllerState["status"]>("disconnected");
	address = $state<string>(); // Connected wallet address
	themeMode = $state<ThemeMode>("light");

	private constructor(options: Web3Args) {
		this.projectId = options.appkitOptions.projectId;
		this.evm = options.evmAdapter;
		this.solana = options.solanaAdapter;

		if (browser) {
			this.appkit = createAppKit({
				adapters: [options.evmAdapter, options.solanaAdapter].filter(
					(item) => item !== undefined,
				),
				...options.appkitOptions,
			});

			this.appkit.subscribeAccount((account) => {
				this.address = account.address;
				this.isConnected = account.isConnected;
				this.status = account.status;
			});
			this.appkit.subscribeNetwork((network) => {
				this.network = network.caipNetwork;
			});
			this.appkit.subscribeState((state) => {
				this.activeChain = state.activeChain;
				this.initialized = state.initialized;
				this.loading = state.loading;
				this.open = state.open;
			});
			this.themeMode = this.appkit.getThemeMode();
			this.appkit.subscribeTheme((theme) => {
				this.themeMode = theme.themeMode;
			});
		}
	}

	public static init(options: Web3Args) {
		if (!Web3.instance) {
			Web3.instance = new Web3(options);
		}
		return Web3.instance;
	}

	public static getInstance() {
		if (!Web3.instance) {
			throw new Error("Web3 not initialized");
		}
		return Web3.instance;
	}

	get wagmi() {
		if (!this.evm) {
			throw new Error("EVM/Wagmi adapter not initialized");
		}
		return this.evm.wagmiConfig;
	}

	get solConnection() {
		if (!this.solana) {
			throw new Error("Solana adapter not initialized");
		}
		if (this.network?.chainNamespace !== "solana") {
			throw new Error("Connected network is not in the Solana namespace");
		}
		const rpcUrl = this.network.rpcUrls.default.http[0];
		return new Connection(rpcUrl, "confirmed");
	}
}
