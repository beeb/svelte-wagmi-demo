import { browser } from "$app/environment";
import { type AppKit, type AppKitOptions, createAppKit } from "@reown/appkit";
import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { Address } from "viem";

export class Web3 {
	private static instance: Web3;

	adapter: WagmiAdapter;
	modal: AppKit | undefined;

	chainId = $state<string | number>();
	address = $state<Address>();

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

			this.modal.subscribeAccount((newState) => {
				this.address = newState.address as Address | undefined;
			});
			this.modal.subscribeNetwork((newState) => {
				this.chainId = newState.chainId;
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
