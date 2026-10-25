import React, { useState } from "react";
import {
  FileText,
  Award,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Download,
  BookOpen,
  ArrowRight,
  GitBranch,
  Lock,
  Cpu,
} from "lucide-react";

export const AboutReportView: React.FC = () => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const reportMarkdown = `# B.Tech Final Project Report Outline
## Project Title: GrievanceChain — Blockchain-Based Public Grievance Tracking System
**Candidate Name:** Anushka Tomar  
**Degree & Branch:** Bachelor of Technology in Information Technology (Section A)  
**Institution:** Amity University Madhya Pradesh  
**Academic Session:** 2026–2027  
**Case Study:** Topic 26 — Blockchain-Based Public Grievance Tracking  

---

### 1. Introduction & Problem Definition
Conventional public grievance management platforms rely on centralized, relational databases managed exclusively by municipal administrations. This architecture suffers from severe structural vulnerabilities:
1. **Opaque Resolution Statuses:** Complaints are frequently marked as "Resolved" in internal databases without physical field work, citizen verification, or verifiable timestamps.
2. **Silent Database Manipulation:** Malicious actors or negligent department personnel can update, alter, or delete complaint descriptions, categories, or timestamps with zero cryptographic accountability.
3. **Citizen Mistrust:** Citizens lack independent mathematical proof that their complaint reached municipal supervisors without alteration.

### 2. Proposed Blockchain Architecture
GrievanceChain introduces an Ethereum Virtual Machine (EVM) smart contract layer (\`GrievanceRegistry.sol\`) that acts as a tamper-evident, decentralized single source of truth:
- **Hybrid Data Model:** Sensitive personal details (phone/email) are stored strictly off-chain to maintain privacy and GDPR/DPDP compliance.
- **Keccak-256 Content Fingerprint:** A 32-byte cryptographic hash of the complaint (Title + Category + Description + Location + Timestamp) is permanently recorded on-chain.
- **Smart Contract State Machine:** Status transitions (\`Submitted\` -> \`UnderReview\` -> \`InProgress\` -> \`Resolved\` / \`Rejected\`) are strictly gated by the \`onlyAuthorizedOfficer\` modifier.
- **Full History Event Logs:** Every transition emits EVM indexed events, creating an immutable timeline linking every status update to the authorized officer's wallet address.

### 3. Technology Stack
- **Smart Contracts:** Solidity ^0.8.20 with IR-based compiler optimization
- **Blockchain Framework:** Hardhat v3 with in-memory & local EVM network
- **Web3 Interaction Library:** Ethers.js v6
- **Frontend Framework:** React 19, TypeScript, Vite
- **Styling Architecture:** Tailwind CSS (Navy/Teal theme)
- **Wallet Provider:** MetaMask (EIP-1193 / EIP-3085) & Built-in Hardhat Simulation Engine

### 4. Smart Contract Specifications (\`GrievanceRegistry.sol\`)
- \`registerGrievance(trackingCode, department, category, contentHash, isAnonymous)\`: Registers a new grievance and records block timestamp.
- \`updateGrievanceStatus(id, newStatus, remarks)\`: Role-checked status change by authorized department officers.
- \`verifyIntegrity(id, computedHash)\`: Cryptographically validates whether off-chain content has ever been altered.
- \`authorizeOfficer(officer, departmentScope)\` & \`revokeOfficer(officer)\`: Role-Based Access Control routines.

### 5. Automated Unit Test Cases
1. **ABI Compliance Test:** Verifies function signatures and EVM compatibility.
2. **Registration & Digest Test:** Validates Keccak-256 computation and unique tracking code indexing.
3. **Validation Test:** Asserts revert on empty tracking codes and duplicate identifiers.
4. **RBAC Security Test:** Verifies unauthorized citizens cannot modify complaint statuses.
5. **State Transition Test:** Ensures only forward logical status advances occur.
6. **Tamper Detection Test:** Injects a 1-character discrepancy into the off-chain description and asserts \`verifyIntegrity\` mismatch.

### 6. Limitations & Future Scope
- **IPFS Integration:** Decentralized storage for photos/documents of physical infrastructure defects.
- **Zero-Knowledge Proofs (zk-SNARKs):** Anonymous citizen whistleblowing with cryptographic validity proof.
- **Mobile Civic PWA:** Offline-first caching for municipal field engineers in low-connectivity areas.
`;

  const handleDownloadReport = () => {
    const blob = new Blob([reportMarkdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "GrievanceChain_BTech_Project_Report_Anushka_Tomar.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <Award className="w-4 h-4 text-orange-400" />
          <span>Academic Project Report & Documentation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Project Report & System Architecture
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Comprehensive project case study, technical architecture, and documentation prepared for B.Tech degree evaluation.
        </p>
      </div>

      {/* Candidate & Academic Profile Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1c3f] via-[#091530] to-[#071128] border border-teal-800/60 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-mono font-semibold">
              Case Study Topic 26
            </div>
            <h2 className="text-2xl font-bold text-white">
              GrievanceChain — Blockchain-Based Public Grievance Tracking
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-300">
              <div>
                <strong className="text-slate-400">Student:</strong>{" "}
                <span className="text-teal-300 font-semibold">Anushka Tomar</span>
              </div>
              <div>
                <strong className="text-slate-400">Institution:</strong> Amity University Madhya Pradesh
              </div>
              <div>
                <strong className="text-slate-400">Course & Section:</strong> B.Tech Information Technology, Section A
              </div>
              <div>
                <strong className="text-slate-400">Academic Session:</strong> 2026–2027
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-bold text-xs hover:from-teal-400 hover:to-cyan-500 transition-all shadow-lg cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{downloadSuccess ? "Report Downloaded!" : "Download Report (.md)"}</span>
          </button>
        </div>
      </div>

      {/* Comparison: Centralized DB vs Blockchain */}
      <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-400" />
          <span>Why Blockchain Architecture? (Centralized vs. GrievanceChain)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Comparing conventional SQL public portal architectures with GrievanceChain's EVM decentralized ledger.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-[#081229] text-slate-400 uppercase text-[10px] tracking-wider border-b border-teal-950">
              <tr>
                <th className="p-3">Evaluation Metric</th>
                <th className="p-3 text-rose-300">Conventional Centralized Portal</th>
                <th className="p-3 text-teal-300">GrievanceChain (Blockchain)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-950/60">
              <tr className="hover:bg-[#0f1d40]">
                <td className="p-3 font-semibold text-white">Record Immutability</td>
                <td className="p-3 text-slate-400">
                  Vulnerable to silent row updates, SQL injection, or administrative deletion.
                </td>
                <td className="p-3 text-teal-300 font-medium">
                  Append-only block structure. Past events and blocks can never be modified.
                </td>
              </tr>
              <tr className="hover:bg-[#0f1d40]">
                <td className="p-3 font-semibold text-white">Tamper Evidence</td>
                <td className="p-3 text-slate-400">
                  Modifying a complaint text leaves no mathematical or cryptographic traces.
                </td>
                <td className="p-3 text-teal-300 font-medium">
                  Keccak-256 content seal. Any 1-character discrepancy triggers instant verification failure.
                </td>
              </tr>
              <tr className="hover:bg-[#0f1d40]">
                <td className="p-3 font-semibold text-white">Department Accountability</td>
                <td className="p-3 text-slate-400">
                  Status can be changed by anonymous database sessions or batch jobs.
                </td>
                <td className="p-3 text-teal-300 font-medium">
                  Cryptographically signed transactions. Authorized officer's wallet address permanently attached to event.
                </td>
              </tr>
              <tr className="hover:bg-[#0f1d40]">
                <td className="p-3 font-semibold text-white">Citizen Privacy (GDPR/DPDP)</td>
                <td className="p-3 text-slate-400">
                  Full identity and contact details stored in vulnerable plain-text tables.
                </td>
                <td className="p-3 text-teal-300 font-medium">
                  Hybrid model: Only content digests on-chain. Zero PII stored in public contract state.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* System Architecture Diagram (Visual) */}
      <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-teal-400" />
          <span>System Architecture & End-to-End Transaction Flow</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Step 1 */}
          <div className="rounded-xl bg-[#081229] border border-teal-950 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center font-mono text-sm">
              01
            </div>
            <h4 className="font-bold text-white text-sm">Citizen Form Input</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Citizen enters civic complaint details. Client generates deterministic Keccak-256 digest:
              <br />
              <code className="text-teal-400 font-mono text-[10px]">
                keccak256(Title + Dept + Desc)
              </code>
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl bg-[#081229] border border-teal-950 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center font-mono text-sm">
              02
            </div>
            <h4 className="font-bold text-white text-sm">Web3 Transaction</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ethers.js packages payload into <code className="text-cyan-300 font-mono text-[10px]">registerGrievance()</code> call. MetaMask prompts citizen or simulated engine signs transaction.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl bg-[#081229] border border-teal-950 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center font-mono text-sm">
              03
            </div>
            <h4 className="font-bold text-white text-sm">Smart Contract Execution</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <code className="text-blue-300 font-mono text-[10px]">GrievanceRegistry.sol</code> validates inputs, records ID & content hash, generates tracking code, and emits event.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-xl bg-[#081229] border border-teal-950 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center font-mono text-sm">
              04
            </div>
            <h4 className="font-bold text-white text-sm">Officer Resolution</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Authorized municipal officer verifies field resolution and signs status change. The audit timeline is updated permanently.
            </p>
          </div>
        </div>
      </div>

      {/* Deployment & Testing Instructions */}
      <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-teal-400" />
          <span>Local Development & MetaMask Deployment Instructions</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-300">
          <p className="text-slate-400">
            For local Hardhat node execution and MetaMask testing on localhost:
          </p>

          <div className="bg-[#050b18] p-4 rounded-xl border border-teal-950 font-mono text-teal-300 space-y-2 text-xs">
            <div><span className="text-slate-500"># 1. Compile Solidity smart contract</span></div>
            <div>npm run compile:contracts</div>
            <div className="pt-2"><span className="text-slate-500"># 2. Run automated unit test suite</span></div>
            <div>npm run test:contracts</div>
            <div className="pt-2"><span className="text-slate-500"># 3. Start local Hardhat EVM blockchain node</span></div>
            <div>npx hardhat node</div>
            <div className="pt-2"><span className="text-slate-500"># 4. Deploy GrievanceRegistry to local node</span></div>
            <div>npm run deploy:contracts</div>
          </div>

          <div className="bg-[#081229] p-4 rounded-xl border border-teal-950 space-y-2 text-xs">
            <h4 className="font-semibold text-white">MetaMask Network Configuration:</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
              <li><strong>Network Name:</strong> Hardhat Localhost</li>
              <li><strong>RPC URL:</strong> <code className="text-teal-300 font-mono">http://127.0.0.1:8545</code></li>
              <li><strong>Chain ID:</strong> <code className="text-teal-300 font-mono">31337</code></li>
              <li><strong>Currency Symbol:</strong> ETH</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
