import React, { useState } from "react";
import {
  ShieldCheck,
  Cpu,
  Layers,
  FilePlus2,
  Search,
  SlidersHorizontal,
  FileText,
  Wallet,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  UserCheck,
} from "lucide-react";
import { WalletState } from "../blockchain/types";
import { formatAddress } from "../blockchain/hashUtils";
import { HARDHAT_CHAIN_ID } from "../blockchain/contractConfig";
import {
  HARDHAT_ADMIN_ACCOUNT,
  HARDHAT_OFFICER_ACCOUNT,
  HARDHAT_CITIZEN_ACCOUNT,
} from "../blockchain/simulatedBlockchain";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wallet: WalletState;
  isConnectingMetaMask: boolean;
  onConnectMetaMask: () => void;
  onDisconnectWallet: () => void;
  onSwitchToHardhat: () => void;
  onSelectSimulatedRole: (role: "admin" | "officer" | "citizen") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  wallet,
  isConnectingMetaMask,
  onConnectMetaMask,
  onDisconnectWallet,
  onSwitchToHardhat,
  onSelectSimulatedRole,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const isMetaMaskConnected = wallet.isConnected && wallet.providerType === "metamask";
  const isWrongNetwork = isMetaMaskConnected && wallet.chainId !== HARDHAT_CHAIN_ID;

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Layers },
    { id: "submit", label: "Submit Grievance", icon: FilePlus2 },
    { id: "track", label: "Track Complaint", icon: Search },
    { id: "admin", label: "Administration", icon: SlidersHorizontal },
    { id: "explorer", label: "Chain Explorer & Tests", icon: Cpu },
    { id: "about", label: "Report & Architecture", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#091127]/95 backdrop-blur-md border-b border-teal-950/60 shadow-lg">
      {/* Top Academic Info Strip */}
      <div className="bg-gradient-to-r from-[#0d1c3e] via-[#0b2438] to-[#0d1c3e] border-b border-teal-900/40 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
            Case Study 26
          </span>
          <span className="font-medium text-slate-200">
            B.Tech Information Technology (Section A) • Amity University Madhya Pradesh
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            Candidate: <strong className="text-teal-300 font-semibold">Anushka Tomar</strong>
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">Session 2026–2027</span>
        </div>
      </div>

      {/* Network Warning Bar (if connected to wrong chain) */}
      {isWrongNetwork && (
        <div className="bg-gradient-to-r from-amber-950/90 via-amber-900/90 to-amber-950/90 border-b border-amber-500/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>
              <strong>Incorrect Blockchain Network:</strong> MetaMask is connected to Chain ID{" "}
              <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-amber-300">
                {wallet.chainId ?? "Unknown"}
              </code>
              . GrievanceChain requires Hardhat Localhost (Chain ID:{" "}
              <strong className="text-amber-300">{HARDHAT_CHAIN_ID}</strong>).
            </span>
          </div>
          <button
            onClick={onSwitchToHardhat}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shadow-sm cursor-pointer shrink-0 ml-3"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to Hardhat (31337)</span>
          </button>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white">Grievance</span>
                <span className="text-xl font-bold tracking-tight text-teal-400">Chain</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 ml-1">
                  EVM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Blockchain-Based Public Grievance Tracking
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Wallet Controls */}
          <div className="flex items-center gap-2.5">
            {/* Demo Role Switcher for Educational Viva / Offline Testing */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#111d42] border border-teal-800/40 text-slate-200 hover:border-teal-600 transition-colors cursor-pointer"
                title="Switch persona for role-based permission demonstration"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Role:</span>
                <span className="font-semibold text-teal-300">
                  {wallet.isAdmin ? "Admin" : wallet.isOfficer ? "Officer" : "Citizen"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0e1b3d] border border-teal-800/60 shadow-2xl py-2 z-50 text-xs animate-fade-in">
                  <div className="px-3 py-1.5 border-b border-teal-900/40 text-[11px] text-slate-400">
                    Switch Test Account (Hardhat 31337)
                  </div>
                  <button
                    onClick={() => {
                      onSelectSimulatedRole("citizen");
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-teal-900/20 flex items-center justify-between text-slate-200 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-slate-100">Citizen Persona</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatAddress(HARDHAT_CITIZEN_ACCOUNT)}
                      </div>
                    </div>
                    {!wallet.isAdmin && !wallet.isOfficer && (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onSelectSimulatedRole("officer");
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-teal-900/20 flex items-center justify-between text-slate-200 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-slate-100">Department Officer</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatAddress(HARDHAT_OFFICER_ACCOUNT)}
                      </div>
                    </div>
                    {!wallet.isAdmin && wallet.isOfficer && (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onSelectSimulatedRole("admin");
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-teal-900/20 flex items-center justify-between text-slate-200 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-slate-100">System Admin</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatAddress(HARDHAT_ADMIN_ACCOUNT)}
                      </div>
                    </div>
                    {wallet.isAdmin && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* REAL METAMASK WALLET CONNECTION STATE */}
            {isMetaMaskConnected ? (
              <div className="flex items-center gap-1.5 bg-[#0e1e47] border border-teal-500/50 rounded-xl px-3 py-1.5 text-xs text-slate-200 shadow-sm">
                {/* Connected indicator dot */}
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />

                {/* Connected Address */}
                <div className="flex items-center gap-1">
                  <span className="font-mono text-teal-300 font-bold">
                    {formatAddress(wallet.address, 5, 4)}
                  </span>
                  <button
                    onClick={() => wallet.address && handleCopy(wallet.address)}
                    title="Copy connected wallet address"
                    className="p-1 hover:text-teal-300 transition-colors text-slate-400 cursor-pointer"
                  >
                    {copiedAddress ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Balance display */}
                {wallet.balance && (
                  <span className="hidden sm:inline font-mono text-[11px] text-slate-400 border-l border-teal-900 pl-1.5">
                    {wallet.balance}
                  </span>
                )}

                {/* Network Pill */}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    isWrongNetwork
                      ? "bg-amber-950 text-amber-300 border-amber-600 animate-pulse cursor-pointer"
                      : "bg-teal-950 text-teal-300 border-teal-800"
                  }`}
                  onClick={isWrongNetwork ? onSwitchToHardhat : undefined}
                  title={isWrongNetwork ? "Click to switch to Hardhat" : "Connected Network"}
                >
                  {isWrongNetwork ? `Wrong Chain (${wallet.chainId})` : "Hardhat"}
                </span>

                {/* Disconnect Button */}
                <button
                  onClick={onDisconnectWallet}
                  title="Disconnect MetaMask from session"
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors ml-0.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* PROMINENT "Connect MetaMask Wallet" BUTTON */
              <button
                onClick={onConnectMetaMask}
                disabled={isConnectingMetaMask}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-teal-500 text-slate-950 hover:from-orange-400 hover:via-amber-400 hover:to-teal-400 transition-all shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 shrink-0 border border-amber-400/40"
                title="Connect with MetaMask via Ethers.js"
              >
                {/* MetaMask Fox SVG Icon */}
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M29.56 16.03L26.3 3.42c-.22-.84-1.29-1.12-1.9-.5l-5.32 5.4c-.45.45-.71 1.05-.71 1.68v.17l5.48-1.57.8 4.7-6.28-1.74v.17c0 .64.25 1.25.71 1.7l5.31 5.32c.62.62 1.69.34 1.9-.5l3.26-2.66zm-27.12 0l3.26 12.61c.21.84 1.28 1.12 1.9.5l5.31-5.32c.46-.45.71-1.06.71-1.7v-.17l-6.28 1.74.8-4.7 5.48 1.57v-.17c0-.63-.26-1.23-.71-1.68L7.6 3.42c-.61-.62-1.68-.34-1.9.5l-3.26 12.61v-.5z"
                    fill="#E2761B"
                  />
                  <path
                    d="M8.76 16.71l-1.04 6.13 4.29 2.39-3.25-8.52zm14.48 0l-3.25 8.52 4.29-2.39-1.04-6.13z"
                    fill="#E4761B"
                  />
                  <path
                    d="M16 22.86l-3.99-2.22 1.45 3.82 2.54 1.34 2.54-1.34 1.45-3.82-3.99 2.22z"
                    fill="#D7C1B3"
                  />
                  <path
                    d="M16 28.57l-3.99-1.42.47 1.26c.38 1.02 1.52 1.59 2.57 1.29l.95-.27.95.27c1.05.3 2.19-.27 2.57-1.29l.47-1.26-3.99 1.42z"
                    fill="#233447"
                  />
                </svg>

                {isConnectingMetaMask ? (
                  <span>Connecting...</span>
                ) : (
                  <span>Connect MetaMask Wallet</span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1 border-t border-teal-950">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs whitespace-nowrap font-medium cursor-pointer ${
                  isActive
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
