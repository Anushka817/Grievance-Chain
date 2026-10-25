import { BrowserProvider, Contract, ethers, formatEther } from "ethers";
import {
  GRIEVANCE_REGISTRY_ABI,
  HARDHAT_CHAIN_ID,
  HARDHAT_CHAIN_NAME,
  HARDHAT_DEFAULT_RPC,
  DEFAULT_CONTRACT_ADDRESS,
} from "./contractConfig";
import { WalletState } from "./types";
import {
  simulatedBlockchain,
  HARDHAT_ADMIN_ACCOUNT,
  HARDHAT_OFFICER_ACCOUNT,
  HARDHAT_CITIZEN_ACCOUNT,
} from "./simulatedBlockchain";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type Web3ErrorType =
  | "NOT_INSTALLED"
  | "USER_REJECTED"
  | "ALREADY_PENDING"
  | "WRONG_NETWORK"
  | "GENERIC_ERROR";

export interface ConnectResult {
  success: boolean;
  state?: WalletState;
  errorType?: Web3ErrorType;
  errorMessage?: string;
}

export class Web3Service {
  private browserProvider: BrowserProvider | null = null;
  private currentAccount: string | null = null;
  private currentChainId: number | null = null;

  /**
   * Resolves the Ethereum provider object (supports standard window.ethereum
   * or window.ethereum.providers array when multiple extensions are installed).
   */
  public getInjectedProvider(): any {
    if (typeof window === "undefined" || !window.ethereum) {
      return null;
    }
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      const metamaskProvider = window.ethereum.providers.find(
        (p: any) => p.isMetaMask
      );
      if (metamaskProvider) return metamaskProvider;
      return window.ethereum.providers[0];
    }
    return window.ethereum;
  }

  public isMetaMaskAvailable(): boolean {
    const provider = this.getInjectedProvider();
    return Boolean(provider);
  }

  /**
   * Silently checks if MetaMask already has authorized accounts
   * from a previous session without triggering a permission popup.
   */
  public async checkExistingConnection(): Promise<ConnectResult> {
    const provider = this.getInjectedProvider();
    if (!provider) {
      return { success: false, errorType: "NOT_INSTALLED" };
    }

    try {
      this.browserProvider = new BrowserProvider(provider);
      const accounts: string[] = await provider.request({
        method: "eth_accounts",
      });

      if (!accounts || accounts.length === 0) {
        return { success: false };
      }

      return await this.buildConnectedWalletState(accounts[0]);
    } catch {
      return { success: false };
    }
  }

  /**
   * Requests account access via MetaMask (eth_requestAccounts) using Ethers.js.
   */
  public async connectMetaMask(): Promise<ConnectResult> {
    const provider = this.getInjectedProvider();
    if (!provider) {
      return {
        success: false,
        errorType: "NOT_INSTALLED",
        errorMessage:
          "MetaMask extension was not detected in your browser. Please install MetaMask from metamask.io or use the built-in Hardhat simulation engine.",
      };
    }

    try {
      this.browserProvider = new BrowserProvider(provider);

      // Request user account authorization
      const accounts: string[] = await provider.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        return {
          success: false,
          errorType: "GENERIC_ERROR",
          errorMessage: "No accounts were selected in MetaMask.",
        };
      }

      return await this.buildConnectedWalletState(accounts[0]);
    } catch (err: any) {
      console.warn("MetaMask connection error:", err);

      // EIP-1193 user rejection code is 4001
      if (err.code === 4001 || err.message?.includes("User rejected")) {
        return {
          success: false,
          errorType: "USER_REJECTED",
          errorMessage:
            "Connection request was rejected in MetaMask. Please click 'Connect MetaMask Wallet' again and click 'Connect' in the MetaMask popup to approve.",
        };
      }

      // EIP-1193 request already pending is -32002
      if (err.code === -32002) {
        return {
          success: false,
          errorType: "ALREADY_PENDING",
          errorMessage:
            "A connection request is already pending in your MetaMask extension. Please open MetaMask from your browser toolbar to approve it.",
        };
      }

      return {
        success: false,
        errorType: "GENERIC_ERROR",
        errorMessage:
          err.message || "An unexpected error occurred while connecting to MetaMask.",
      };
    }
  }

  /**
   * Helper to build verified wallet state with balance, network check, and role mapping.
   */
  private async buildConnectedWalletState(accountAddress: string): Promise<ConnectResult> {
    const provider = this.getInjectedProvider();
    this.currentAccount = accountAddress;
    this.browserProvider = new BrowserProvider(provider);

    const network = await this.browserProvider.getNetwork();
    this.currentChainId = Number(network.chainId);

    let balanceEth = "0.0000";
    try {
      const balanceWei = await this.browserProvider.getBalance(this.currentAccount);
      balanceEth = parseFloat(formatEther(balanceWei)).toFixed(4);
    } catch (e) {
      console.warn("Could not fetch balance:", e);
    }

    // Verify blockchain network
    let chainError: string | null = null;
    if (this.currentChainId !== HARDHAT_CHAIN_ID) {
      chainError = `Connected to Chain ID ${this.currentChainId}. Expected Hardhat Chain (${HARDHAT_CHAIN_ID}).`;
    }

    // Check roles against contract / demo accounts
    const lower = this.currentAccount.toLowerCase();
    const isAdmin = lower === HARDHAT_ADMIN_ACCOUNT.toLowerCase();
    const isOfficer = isAdmin || lower === HARDHAT_OFFICER_ACCOUNT.toLowerCase();

    const state: WalletState = {
      isConnected: true,
      address: this.currentAccount,
      chainId: this.currentChainId,
      balance: `${balanceEth} ETH`,
      isAdmin,
      isOfficer,
      officerDepartmentScope: 0,
      providerType: "metamask",
      error: chainError,
    };

    return {
      success: true,
      state,
      errorType: chainError ? "WRONG_NETWORK" : undefined,
      errorMessage: chainError || undefined,
    };
  }

  /**
   * Switches to the Hardhat network (Chain 31337) or adds it to MetaMask via wallet_addEthereumChain.
   */
  public async switchOrAddHardhatChain(): Promise<{ success: boolean; error?: string }> {
    const provider = this.getInjectedProvider();
    if (!provider) {
      return { success: false, error: "MetaMask not detected." };
    }

    const hexChainId = "0x" + HARDHAT_CHAIN_ID.toString(16);

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
      return { success: true };
    } catch (switchError: any) {
      // 4902 indicates chain has not been added to MetaMask yet
      if (switchError.code === 4902 || switchError.message?.includes("Unrecognized chain")) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexChainId,
                chainName: HARDHAT_CHAIN_NAME,
                rpcUrls: [HARDHAT_DEFAULT_RPC],
                nativeCurrency: {
                  name: "Hardhat ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          });
          return { success: true };
        } catch (addError: any) {
          if (addError.code === 4001) {
            return { success: false, error: "Network addition request was rejected in MetaMask." };
          }
          return {
            success: false,
            error: addError.message || "Failed to add Hardhat chain to MetaMask.",
          };
        }
      }

      if (switchError.code === 4001) {
        return { success: false, error: "Network switch request was rejected in MetaMask." };
      }

      return {
        success: false,
        error: switchError.message || "Failed to switch chain in MetaMask.",
      };
    }
  }

  /**
   * Returns a disconnected state representation.
   */
  public getDisconnectedWalletState(): WalletState {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
      isOfficer: false,
      officerDepartmentScope: 0,
      isAdmin: false,
      providerType: "none",
      error: null,
    };
  }

  /**
   * Returns simulated wallet state for local testing.
   */
  public getSimulatedWalletState(role: "admin" | "officer" | "citizen" = "citizen"): WalletState {
    let address = HARDHAT_CITIZEN_ACCOUNT;
    let isAdmin = false;
    let isOfficer = false;

    if (role === "admin") {
      address = HARDHAT_ADMIN_ACCOUNT;
      isAdmin = true;
      isOfficer = true;
    } else if (role === "officer") {
      address = HARDHAT_OFFICER_ACCOUNT;
      isAdmin = false;
      isOfficer = true;
    }

    return {
      isConnected: true,
      address,
      chainId: HARDHAT_CHAIN_ID,
      balance: "1000.0000 ETH",
      isOfficer,
      officerDepartmentScope: 0,
      isAdmin,
      providerType: "simulated",
      error: null,
    };
  }

  /**
   * Subscribes to MetaMask account and chain changes via EIP-1193 event listeners.
   */
  public listenToMetaMaskEvents(
    onAccountChange: (account: string | null) => void,
    onChainChange: (chainId: number) => void
  ): () => void {
    const provider = this.getInjectedProvider();
    if (!provider || !provider.on) {
      return () => {};
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        onAccountChange(null);
      } else {
        onAccountChange(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      onChainChange(parseInt(chainIdHex, 16));
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      if (provider.removeListener) {
        provider.removeListener("accountsChanged", handleAccountsChanged);
        provider.removeListener("chainChanged", handleChainChanged);
      }
    };
  }
}

export const web3Service = new Web3Service();
