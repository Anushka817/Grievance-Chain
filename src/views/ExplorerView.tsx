import React, { useState } from "react";
import {
  Cpu,
  Layers,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Boxes,
  FileCode,
  Hash,
  ExternalLink,
  ShieldCheck,
  Zap,
  Copy,
} from "lucide-react";
import { MinedBlock, BlockchainTransaction } from "../blockchain/types";
import {
  DEFAULT_CONTRACT_ADDRESS,
  HARDHAT_CHAIN_ID,
  GRIEVANCE_REGISTRY_ABI,
  HARDHAT_DEFAULT_RPC,
} from "../blockchain/contractConfig";
import { formatAddress, formatTimestamp } from "../blockchain/hashUtils";
import { runFrontendContractTests, TestCaseResult } from "../blockchain/contractTestSuite";
import { HARDHAT_ADMIN_ACCOUNT } from "../blockchain/simulatedBlockchain";

interface ExplorerViewProps {
  blocks: MinedBlock[];
  transactions: BlockchainTransaction[];
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({ blocks, transactions }) => {
  const [activeSubTab, setActiveSubTab] = useState<"tests" | "blocks" | "txs" | "contract">("tests");
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    setTestResults(null);
    setTimeout(async () => {
      const results = await runFrontendContractTests();
      setTestResults(results);
      setIsRunningTests(false);
    }, 600);
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>EVM Blockchain Explorer & Smart Contract Verification Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            GrievanceRegistry Contract & Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit deployed bytecode, inspect real-time mined blocks, transactions, and run automated unit tests.
          </p>
        </div>

        {/* Contract Quick Badge */}
        <div className="rounded-xl bg-[#0c1836] border border-teal-900/60 p-4 text-xs space-y-1 shrink-0">
          <div className="text-slate-400">Deployed Contract:</div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-teal-300 font-bold">
              {formatAddress(DEFAULT_CONTRACT_ADDRESS, 8, 6)}
            </span>
            <button
              onClick={() => copyAddress(DEFAULT_CONTRACT_ADDRESS)}
              className="p-1 rounded bg-[#081229] hover:bg-teal-900/40 text-slate-300 hover:text-teal-300"
              title="Copy Address"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {copiedContract && <span className="text-[10px] text-emerald-400">Copied!</span>}
          </div>
          <div className="text-[11px] text-slate-400">
            Hardhat Localhost (Chain ID: {HARDHAT_CHAIN_ID})
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-teal-950 pb-3">
        {[
          { id: "tests", label: "Automated Contract Tests", icon: Zap },
          { id: "blocks", label: `Mined Blocks (${blocks.length})`, icon: Boxes },
          { id: "txs", label: `Transactions (${transactions.length})`, icon: Hash },
          { id: "contract", label: "Solidity Source & ABI", icon: FileCode },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                  : "bg-[#0c1836] text-slate-300 hover:text-white border border-teal-950"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Automated Contract Tests */}
      {activeSubTab === "tests" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <span>Automated Smart Contract Verification Suite</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Executes formal unit tests against the GrievanceRegistry contract specifications: registration, cryptographic Keccak-256 digests, unauthorized rejection, and state machines.
              </p>
            </div>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-bold text-xs hover:from-teal-400 hover:to-cyan-500 transition-all shadow-md shadow-teal-500/20 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isRunningTests ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Executing Contract Assertions...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Unit Tests</span>
                </>
              )}
            </button>
          </div>

          {/* Test results container */}
          {testResults ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2 text-xs text-slate-400">
                <span>
                  Test Execution Summary:{" "}
                  <strong className="text-emerald-400">
                    {testResults.filter((t) => t.passed).length} Passed
                  </strong>{" "}
                  / <strong>{testResults.length} Total</strong>
                </span>
                <span className="font-mono text-teal-300">
                  Total Time: {testResults.reduce((acc, t) => acc + t.durationMs, 0)}ms
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {testResults.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl bg-[#081229] border border-teal-950 p-4 space-y-2 hover:border-teal-800 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {t.passed ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                            <XCircle className="w-4 h-4 text-rose-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-teal-400">
                              [{t.id}]
                            </span>
                            <span className="text-sm font-bold text-white">{t.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0e1b3d] text-teal-300 border border-teal-900">
                              {t.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                        </div>
                      </div>

                      <div className="text-right text-xs shrink-0">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold font-mono">
                          PASSED ({t.durationMs}ms)
                        </span>
                        {t.gasUsed && (
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            Gas: {t.gasUsed.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#050b17] p-2.5 rounded-lg border border-teal-950/80 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                      <span>{t.details}</span>
                      {t.txHash && (
                        <span className="text-teal-400/80 text-[10px] hidden sm:inline">
                          Tx: {formatAddress(t.txHash, 6, 4)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#081229] border border-teal-950 p-12 text-center space-y-3">
              <Zap className="w-12 h-12 text-teal-400 mx-auto opacity-70" />
              <h3 className="text-base font-bold text-white">
                Ready to Execute Contract Unit Tests
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click <strong>"Execute Unit Tests"</strong> above to run test assertions covering ABI structure, Keccak-256 digest creation, unauthorized access blocking, and lifecycle transitions.
              </p>
              <div className="pt-2 text-xs font-mono text-slate-400">
                Also executable via terminal: <code className="text-teal-300">npm run test:contracts</code>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Mined Blocks */}
      {activeSubTab === "blocks" && (
        <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-teal-950">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-teal-400" />
              <span>Mined Ethereum Blocks (Hardhat Local Chain)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological cryptographic blocks containing finalized grievance transactions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#081229] text-slate-400 uppercase text-[10px] tracking-wider border-b border-teal-950">
                <tr>
                  <th className="px-5 py-3">Block Height</th>
                  <th className="px-4 py-3">Block Hash</th>
                  <th className="px-4 py-3">Previous Hash</th>
                  <th className="px-4 py-3">Miner</th>
                  <th className="px-4 py-3">Tx Count</th>
                  <th className="px-4 py-3">Gas Used</th>
                  <th className="px-5 py-3 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-950/60 font-mono">
                {blocks.slice().reverse().map((b) => (
                  <tr key={b.blockNumber} className="hover:bg-[#102047]/60 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-cyan-300">#{b.blockNumber}</td>
                    <td className="px-4 py-3.5 text-teal-400" title={b.blockHash}>
                      {formatAddress(b.blockHash, 8, 6)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400" title={b.previousHash}>
                      {formatAddress(b.previousHash, 6, 4)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300" title={b.miner}>
                      {formatAddress(b.miner, 6, 4)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-200">{b.txCount} tx</td>
                    <td className="px-4 py-3.5 text-emerald-400">
                      {b.gasUsed.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 text-[11px]">
                      {formatTimestamp(b.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Transactions */}
      {activeSubTab === "txs" && (
        <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-teal-950">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-teal-400" />
              <span>EVM Transactions Audit Log</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              All confirmed smart contract function invocations with gas telemetry
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#081229] text-slate-400 uppercase text-[10px] tracking-wider border-b border-teal-950">
                <tr>
                  <th className="px-5 py-3">Tx Hash</th>
                  <th className="px-4 py-3">Method Invoked</th>
                  <th className="px-4 py-3">Block #</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To (Contract)</th>
                  <th className="px-4 py-3">Gas Used</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-950/60 font-mono">
                {transactions.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-[#102047]/60 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-teal-300" title={tx.hash}>
                      {formatAddress(tx.hash, 8, 6)}
                    </td>
                    <td className="px-4 py-3.5 font-sans font-medium text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 text-[11px] font-mono">
                        {tx.action}()
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-cyan-300">#{tx.blockNumber}</td>
                    <td className="px-4 py-3.5 text-slate-400">{formatAddress(tx.from, 6, 4)}</td>
                    <td className="px-4 py-3.5 text-slate-400">{formatAddress(tx.to, 6, 4)}</td>
                    <td className="px-4 py-3.5 text-emerald-400">{tx.gasUsed.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Contract Code & ABI */}
      {activeSubTab === "contract" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-950">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-teal-400" />
                  <span>Solidity Smart Contract Source: contracts/GrievanceRegistry.sol</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Compiled with Solc 0.8.20 • IR Pipeline Enabled • Target EVM: Shanghai
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono">
                  Solidity 0.8.20
                </span>
                <span className="px-2.5 py-1 rounded bg-[#081229] text-slate-300 border border-teal-950 font-mono">
                  viaIR: true
                </span>
              </div>
            </div>

            <div className="bg-[#050b18] p-4 rounded-xl border border-teal-950 max-h-96 overflow-y-auto text-xs font-mono text-slate-300 space-y-1">
              <pre className="text-teal-400">// SPDX-License-Identifier: MIT</pre>
              <pre className="text-teal-400">pragma solidity ^0.8.20;</pre>
              <pre className="text-slate-400">/**</pre>
              <pre className="text-slate-400"> * @title GrievanceRegistry</pre>
              <pre className="text-slate-400"> * Student: Anushka Tomar | Amity University MP</pre>
              <pre className="text-slate-400"> */</pre>
              <pre className="text-white">contract GrievanceRegistry &#123;</pre>
              <pre className="text-slate-400">    enum Status &#123; Submitted, UnderReview, InProgress, Resolved, Rejected &#125;</pre>
              <pre className="text-slate-400">    enum Department &#123; WaterSupply, Electricity, Roads, Sanitation, PublicSafety, Other &#125;</pre>
              <pre className="text-slate-300">    // Role-based access control</pre>
              <pre className="text-slate-300">    address public admin;</pre>
              <pre className="text-slate-300">    mapping(address =&gt; bool) public authorizedOfficers;</pre>
              <pre className="text-slate-300">    mapping(address =&gt; uint8) public officerDepartmentScope;</pre>
              <pre className="text-slate-300">    mapping(uint256 =&gt; Grievance) public grievances;</pre>
              <pre className="text-slate-300">    mapping(string =&gt; uint256) public trackingCodeToId;</pre>
              <pre className="text-cyan-400">    function registerGrievance(...) external returns (uint256);</pre>
              <pre className="text-cyan-400">    function updateGrievanceStatus(...) external onlyAuthorizedOfficer(...);</pre>
              <pre className="text-cyan-400">    function verifyIntegrity(uint256 _id, bytes32 _computedHash) external view returns (bool);</pre>
              <pre className="text-white">&#125;</pre>
            </div>
          </div>

          {/* ABI Viewer */}
          <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-6 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-teal-400" />
              <span>Application Binary Interface (ABI) Specification</span>
            </h3>
            <p className="text-xs text-slate-400">
              Human-readable ABI signatures utilized by Ethers.js for smart contract RPC dispatch
            </p>
            <div className="bg-[#050b18] p-4 rounded-xl border border-teal-950 max-h-64 overflow-y-auto font-mono text-xs text-teal-300/90 space-y-1">
              {GRIEVANCE_REGISTRY_ABI.map((sig, i) => (
                <div key={i} className="hover:text-white transition-colors">
                  {sig}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
