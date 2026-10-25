import React from "react";
import { ShieldCheck, Database, Award, ExternalLink } from "lucide-react";
import { DEFAULT_CONTRACT_ADDRESS, HARDHAT_CHAIN_ID } from "../blockchain/contractConfig";
import { formatAddress } from "../blockchain/hashUtils";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#060b18] border-t border-teal-950/80 text-slate-400 text-xs py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: System info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </div>
              <span className="font-bold text-white text-base">GrievanceChain</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                Solidity 0.8.20
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              A decentralized public grievance tracking and status verification platform built on Ethereum Virtual Machine (EVM) standards. Features cryptographic Keccak-256 tamper-evident integrity checking, role-based departmental access controls, and transparent citizen audit trails.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 font-mono">
                <Database className="w-3.5 h-3.5 text-teal-400" />
                Contract: {formatAddress(DEFAULT_CONTRACT_ADDRESS, 8, 6)}
              </span>
              <span>•</span>
              <span>Hardhat Chain ID: {HARDHAT_CHAIN_ID}</span>
            </div>
          </div>

          {/* Col 2: Academic Details */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-orange-400" />
              Academic Credentials
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><strong className="text-slate-300">Student:</strong> Anushka Tomar</li>
              <li><strong className="text-slate-300">Course:</strong> B.Tech Information Technology</li>
              <li><strong className="text-slate-300">Section:</strong> A</li>
              <li><strong className="text-slate-300">Institution:</strong> Amity University Madhya Pradesh</li>
              <li><strong className="text-slate-300">Academic Session:</strong> 2026–2027</li>
              <li><strong className="text-slate-300">Topic:</strong> Case Study 26 — Blockchain-Based Public Grievance Tracking</li>
            </ul>
          </div>

          {/* Col 3: Technology Stack */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Technology Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {["Solidity ^0.8.20", "Hardhat v3", "Ethers.js v6", "MetaMask Web3", "React 19", "TypeScript", "Tailwind CSS", "Keccak-256 SHA-3"].map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded bg-[#0f1b3d] text-teal-300 border border-teal-900/60 text-[10px]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            © 2026–2027 GrievanceChain • B.Tech Capstone Project • Amity University Madhya Pradesh
          </div>
          <div className="text-slate-400">
            Compliant with EVM Smart Contract Security & Non-Custodial Decentralized Architecutre
          </div>
        </div>
      </div>
    </footer>
  );
};
