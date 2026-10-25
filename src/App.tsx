import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { WalletModal, WalletModalNotice } from "./components/WalletModal";
import { DashboardView } from "./views/DashboardView";
import { SubmitGrievanceView } from "./views/SubmitGrievanceView";
import { TrackComplaintView } from "./views/TrackComplaintView";
import { AdminPortalView } from "./views/AdminPortalView";
import { ExplorerView } from "./views/ExplorerView";
import { AboutReportView } from "./views/AboutReportView";
import { simulatedBlockchain } from "./blockchain/simulatedBlockchain";
import { web3Service } from "./blockchain/web3Service";
import { GrievanceRecord, GrievanceStatus, WalletState } from "./blockchain/types";
import { HARDHAT_CHAIN_ID } from "./blockchain/contractConfig";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [grievances, setGrievances] = useState<GrievanceRecord[]>([]);
  const [blocks, setBlocks] = useState(simulatedBlockchain.getBlocks());
  const [transactions, setTransactions] = useState(simulatedBlockchain.getTransactions());
  const [searchCodeForTracker, setSearchCodeForTracker] = useState<string>("");
  const [demoMode, setDemoMode] = useState<boolean>(simulatedBlockchain.getDemoMode());

  // Wallet State — Starts disconnected so "Connect MetaMask Wallet" is prominently visible
  const [wallet, setWallet] = useState<WalletState>(
    web3Service.getDisconnectedWalletState()
  );
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);
  const [walletModalNotice, setWalletModalNotice] = useState<WalletModalNotice | null>(null);

  // Load initial blockchain records
  const refreshBlockchainData = () => {
    setGrievances(simulatedBlockchain.getAllGrievances());
    setBlocks(simulatedBlockchain.getBlocks());
    setTransactions(simulatedBlockchain.getTransactions());
    setDemoMode(simulatedBlockchain.getDemoMode());
  };

  useEffect(() => {
    refreshBlockchainData();

    // Check if MetaMask already had authorized accounts from earlier session
    const checkPriorAuth = async () => {
      const prior = await web3Service.checkExistingConnection();
      if (prior.success && prior.state) {
        setWallet(prior.state);
        if (prior.errorType === "WRONG_NETWORK") {
          setWalletModalNotice({
            type: "WRONG_NETWORK",
            title: "Incorrect Blockchain Network",
            message: `MetaMask is currently connected to Chain ID ${prior.state.chainId}. GrievanceChain requires Hardhat Localhost (${HARDHAT_CHAIN_ID}).`,
            currentChainId: prior.state.chainId,
          });
        }
      }
    };
    checkPriorAuth();

    // Listen to MetaMask account/chain events via EIP-1193
    const cleanup = web3Service.listenToMetaMaskEvents(
      (newAccount) => {
        if (!newAccount) {
          setWallet(web3Service.getDisconnectedWalletState());
        } else {
          setWallet((prev) => ({
            ...prev,
            address: newAccount,
            isConnected: true,
            providerType: "metamask",
          }));
        }
      },
      (newChainId) => {
        setWallet((prev) => {
          const isWrong = newChainId !== HARDHAT_CHAIN_ID;
          return {
            ...prev,
            chainId: newChainId,
            error: isWrong
              ? `Connected to Chain ID ${newChainId}. Expected Hardhat (${HARDHAT_CHAIN_ID}).`
              : null,
          };
        });

        if (newChainId !== HARDHAT_CHAIN_ID) {
          setWalletModalNotice({
            type: "WRONG_NETWORK",
            title: "Incorrect Blockchain Network",
            message: `MetaMask switched to Chain ID ${newChainId}. GrievanceChain smart contracts run on Hardhat Localhost (${HARDHAT_CHAIN_ID}).`,
            currentChainId: newChainId,
          });
        } else {
          setWalletModalNotice(null);
        }
      }
    );

    return cleanup;
  }, []);

  // Handlers
  const handleTrackGrievance = (trackingCode: string) => {
    setSearchCodeForTracker(trackingCode);
    setActiveTab("track");
  };

  const handleRegisterGrievance = (data: any) => {
    const result = simulatedBlockchain.registerGrievance(data);
    refreshBlockchainData();
    return result;
  };

  const handleUpdateStatus = (params: {
    id: number;
    newStatus: GrievanceStatus;
    remarks: string;
    officerAddress: string;
  }) => {
    const result = simulatedBlockchain.updateGrievanceStatus(params);
    refreshBlockchainData();
    return result;
  };

  const handleSimulateTamper = (id: number, tamperedDescription: string) => {
    simulatedBlockchain.simulateTamperGrievance(id, tamperedDescription);
    refreshBlockchainData();
  };

  const handleResetSeed = () => {
    simulatedBlockchain.resetToDefaultSeed();
    refreshBlockchainData();
  };

  // Real MetaMask Connection handler with comprehensive error handling
  const handleConnectMetaMask = async () => {
    setIsConnectingMetaMask(true);
    setWalletModalNotice(null);

    const res = await web3Service.connectMetaMask();
    setIsConnectingMetaMask(false);

    if (res.success && res.state) {
      setWallet(res.state);

      if (res.errorType === "WRONG_NETWORK") {
        setWalletModalNotice({
          type: "WRONG_NETWORK",
          title: "Incorrect Blockchain Network",
          message: `MetaMask successfully connected to address ${res.state.address?.slice(0, 8)}..., but is on Chain ID ${res.state.chainId}. Please switch to the Hardhat network (${HARDHAT_CHAIN_ID}) to interact with GrievanceRegistry.`,
          currentChainId: res.state.chainId,
        });
      }
    } else {
      if (res.errorType === "NOT_INSTALLED") {
        setWalletModalNotice({
          type: "NOT_INSTALLED",
          title: "MetaMask Extension Not Detected",
          message:
            "Ethers.js could not detect an injected Ethereum provider (window.ethereum) in your browser. To connect with a live Web3 wallet, please install the MetaMask extension from metamask.io or test with the built-in Hardhat simulation engine.",
        });
      } else if (res.errorType === "USER_REJECTED") {
        setWalletModalNotice({
          type: "USER_REJECTED",
          title: "Connection Request Rejected",
          message:
            "The account connection request was declined in MetaMask (EIP-1193 Error 4001). To connect your real wallet, please click 'Connect MetaMask Wallet' again and click 'Connect' in the MetaMask popup.",
        });
      } else if (res.errorType === "ALREADY_PENDING") {
        setWalletModalNotice({
          type: "GENERIC_ERROR",
          title: "Connection Request Already Pending",
          message:
            "A MetaMask authorization prompt is already open. Please look for the MetaMask icon in your browser toolbar or extensions menu to approve the request.",
        });
      } else {
        setWalletModalNotice({
          type: "GENERIC_ERROR",
          title: "MetaMask Connection Issue",
          message: res.errorMessage || "Failed to establish a connection with MetaMask.",
        });
      }
    }
  };

  const handleDisconnectWallet = () => {
    setWallet(web3Service.getDisconnectedWalletState());
    setWalletModalNotice(null);
  };

  const handleSwitchToHardhat = async () => {
    const res = await web3Service.switchOrAddHardhatChain();
    if (!res.success && res.error) {
      setWalletModalNotice({
        type: "GENERIC_ERROR",
        title: "Network Switch Failed",
        message: res.error,
      });
    } else {
      setWalletModalNotice(null);
    }
  };

  const handleSelectSimulatedRole = (role: "admin" | "officer" | "citizen") => {
    setWallet(web3Service.getSimulatedWalletState(role));
    setWalletModalNotice(null);
  };

  const handleToggleDemoMode = (enabled: boolean) => {
    simulatedBlockchain.setDemoMode(enabled);
    setDemoMode(enabled);
  };

  return (
    <div className="min-h-screen bg-[#070c1b] text-slate-100 flex flex-col selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wallet={wallet}
        isConnectingMetaMask={isConnectingMetaMask}
        onConnectMetaMask={handleConnectMetaMask}
        onDisconnectWallet={handleDisconnectWallet}
        onSwitchToHardhat={handleSwitchToHardhat}
        onSelectSimulatedRole={handleSelectSimulatedRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <DashboardView
            grievances={grievances}
            onTrackGrievance={handleTrackGrievance}
            onNavigate={setActiveTab}
            latestBlockNumber={simulatedBlockchain.getLatestBlockNumber()}
          />
        )}

        {activeTab === "submit" && (
          <SubmitGrievanceView
            onRegisterGrievance={handleRegisterGrievance}
            connectedAddress={wallet.address}
            onTrackNewGrievance={handleTrackGrievance}
          />
        )}

        {activeTab === "track" && (
          <TrackComplaintView
            grievances={grievances}
            initialSearchCode={searchCodeForTracker}
            onSimulateTamper={handleSimulateTamper}
            onResetSeed={handleResetSeed}
          />
        )}

        {activeTab === "admin" && (
          <AdminPortalView
            grievances={grievances}
            wallet={wallet}
            onUpdateStatus={handleUpdateStatus}
            demoMode={demoMode}
            onToggleDemoMode={handleToggleDemoMode}
            onAuthorizeOfficer={(officer, scope) => {
              simulatedBlockchain.authorizeOfficer(officer, scope);
              refreshBlockchainData();
            }}
            onRevokeOfficer={(officer) => {
              simulatedBlockchain.revokeOfficer(officer);
              refreshBlockchainData();
            }}
            onTrackGrievance={handleTrackGrievance}
          />
        )}

        {activeTab === "explorer" && (
          <ExplorerView blocks={blocks} transactions={transactions} />
        )}

        {activeTab === "about" && <AboutReportView />}
      </main>

      {/* Academic Footer */}
      <Footer />

      {/* Accessible In-App Wallet Modal for missing wallet, rejection, and network errors */}
      <WalletModal
        notice={walletModalNotice}
        onClose={() => setWalletModalNotice(null)}
        onSwitchNetwork={handleSwitchToHardhat}
        onSelectDemoMode={() => handleSelectSimulatedRole("citizen")}
      />
    </div>
  );
}
