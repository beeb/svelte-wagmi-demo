import { browser } from "$app/environment";
import {
	type AccountControllerState,
	type AppKit,
	type AppKitOptions,
	type ThemeMode,
	createAppKit,
} from "@reown/appkit";
import type { SolanaAdapter } from "@reown/appkit-adapter-solana";
import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { CaipNetwork, ChainNamespace } from "@reown/appkit-common";
import {
	type Rpc,
	type SolanaRpcApiMainnet,
	createSolanaRpc,
} from "@solana/kit";

export type Web3Args = {
	evmAdapter?: WagmiAdapter;
	solanaAdapter?: SolanaAdapter;
	appkitOptions: Omit<AppKitOptions, "adapters">;
};

export class Web3 {
	private static instance: Web3;

	evm: WagmiAdapter | undefined;
	solana: SolanaAdapter | undefined;
	appkit: AppKit | undefined;

	initialized = $state(false);
	loading = $state(false);
	open = $state(false); // Modal open state
	activeChain = $state<ChainNamespace>(); // 'eip155' | 'solana' | 'polkadot' | 'bip122'
	network = $state<CaipNetwork>();
	solRpc = $state<Rpc<SolanaRpcApiMainnet>>();
	isConnected = $state(false);
	status = $state<AccountControllerState["status"]>("disconnected");
	address = $state<string>(); // Connected wallet address
	themeMode = $state<ThemeMode>("light");

	private constructor(options: Web3Args) {
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
				this.updateSolConnection();
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

	private updateSolConnection() {
		if (!this.solana || this.network?.chainNamespace !== "solana") {
			this.solRpc = undefined;
			return;
		}
		const rpcUrl = this.network.rpcUrls.default.http[0];
		this.solRpc = createSolanaRpc(rpcUrl);
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
}
