import React from "react";
import {
  AlertTriangle,
  XCircle,
  ExternalLink,
  RefreshCw,
  X,
  ShieldAlert,
  ArrowRight,
  Layers,
} from "lucide-react";
import { HARDHAT_CHAIN_ID, HARDHAT_CHAIN_NAME, HARDHAT_DEFAULT_RPC } from "../blockchain/contractConfig";

export interface WalletModalNotice {
  type: "NOT_INSTALLED" | "USER_REJECTED" | "WRONG_NETWORK" | "GENERIC_ERROR";
  title: string;
  message: string;
  currentChainId?: number | null;
}

interface WalletModalProps {
  notice: WalletModalNotice | null;
  onClose: () => void;
  onSwitchNetwork: () => void;
  onSelectDemoMode: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  notice,
  onClose,
  onSwitchNetwork,
  onSelectDemoMode,
}) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0c1836] border border-teal-800/80 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5">
          {notice.type === "WRONG_NETWORK" ? (
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
          ) : notice.type === "NOT_INSTALLED" ? (
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-orange-400" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-rose-400" />
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-teal-400">
              MetaMask Web3 Notice
            </span>
            <h3 className="text-lg font-bold text-white leading-snug">
              {notice.title}
            </h3>
          </div>
        </div>

        {/* Notice Description */}
        <div className="rounded-xl bg-[#081229] p-4 border border-teal-950 text-xs text-slate-300 leading-relaxed">
          {notice.message}
        </div>

        {/* Specific guidance for Wrong Network */}
        {notice.type === "WRONG_NETWORK" && (
          <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-3.5 text-xs text-amber-200/90 space-y-1.5">
            <div className="font-semibold text-amber-300">Required Network Parameters:</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
              <div>Network: {HARDHAT_CHAIN_NAME}</div>
              <div>Chain ID: {HARDHAT_CHAIN_ID}</div>
              <div className="col-span-2">RPC: {HARDHAT_DEFAULT_RPC}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          {notice.type === "WRONG_NETWORK" ? (
            <button
              onClick={() => {
                onSwitchNetwork();
                onClose();
              }}
              className="w-full sm:flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-orange-400 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Switch to Hardhat (31337)</span>
            </button>
          ) : notice.type === "NOT_INSTALLED" ? (
            <>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs hover:from-orange-400 hover:to-amber-400 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <span>Install MetaMask</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => {
                  onSelectDemoMode();
                  onClose();
                }}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#111e42] border border-teal-800 text-teal-300 font-semibold text-xs hover:bg-[#162756] transition-colors cursor-pointer"
              >
                Use Built-in Node
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors cursor-pointer"
            >
              Understood
            </button>
          )}

          {notice.type !== "NOT_INSTALLED" && (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#081229] border border-teal-950 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
