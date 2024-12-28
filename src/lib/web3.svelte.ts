import { browser } from "$app/environment";
import {
	type AccountControllerState,
	type AppKit,
	type AppKitOptions,
	type ThemeMode,
	createAppKit,
} from "@reown/appkit";
import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { CaipNetwork, ChainNamespace } from "@reown/appkit-common";

export class Web3 {
	private static instance: Web3;

	adapter: WagmiAdapter;
	modal: AppKit | undefined;

	initialized = $state(false);
	loading = $state(false);
	open = $state(false); // Modal open state
	activeChain = $state<ChainNamespace>(); // 'eip155' | 'solana' | 'polkadot' | 'bip122'
	network = $state<CaipNetwork>();
	isConnected = $state(false);
	status = $state<AccountControllerState["status"]>("disconnected");
	address = $state<string>(); // Connected wallet address
	themeMode = $state<ThemeMode>("light");

	private constructor(
		adapter: WagmiAdapter,
		options: Omit<AppKitOptions, "adapters">,
	) {
		this.adapter = adapter;

		if (browser) {
			this.modal = createAppKit({
				adapters: [adapter],
				...options,
			});

			this.modal.subscribeAccount((account) => {
				this.address = account.address;
				this.isConnected = account.isConnected;
				this.status = account.status;
			});
			this.modal.subscribeNetwork((network) => {
				this.network = network.caipNetwork;
			});
			this.modal.subscribeState((state) => {
				this.activeChain = state.activeChain;
				this.initialized = state.initialized;
				this.loading = state.loading;
				this.open = state.open;
			});
			this.themeMode = this.modal.getThemeMode();
			this.modal.subscribeTheme((theme) => {
				this.themeMode = theme.themeMode;
			});
		}
	}

	public static init(
		adapter: WagmiAdapter,
		options: Omit<AppKitOptions, "adapters">,
	) {
		if (!Web3.instance) {
			Web3.instance = new Web3(adapter, options);
		}
		return Web3.instance;
	}

	public static getInstance() {
		if (!Web3.instance) {
			throw new Error("Web3 not initialized");
		}
		return Web3.instance;
	}
}
