import React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ShieldCheck,
  Search,
  PlusCircle,
  ExternalLink,
  Cpu,
  Layers,
  Hash,
  Boxes,
  ArrowRight,
} from "lucide-react";
import { GrievanceRecord, GrievanceStatus, Department } from "../blockchain/types";
import { DEPARTMENT_NAMES, STATUS_LABELS } from "../blockchain/contractConfig";
import { formatAddress, formatTimestamp } from "../blockchain/hashUtils";

interface DashboardViewProps {
  grievances: GrievanceRecord[];
  onTrackGrievance: (trackingCode: string) => void;
  onNavigate: (tab: string) => void;
  latestBlockNumber: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  grievances,
  onTrackGrievance,
  onNavigate,
  latestBlockNumber,
}) => {
  // Compute analytics
  const total = grievances.length;
  const pendingCount = grievances.filter(
    (g) => g.currentStatus === GrievanceStatus.Submitted || g.currentStatus === GrievanceStatus.UnderReview
  ).length;
  const inProgressCount = grievances.filter((g) => g.currentStatus === GrievanceStatus.InProgress).length;
  const resolvedCount = grievances.filter((g) => g.currentStatus === GrievanceStatus.Resolved).length;
  const rejectedCount = grievances.filter((g) => g.currentStatus === GrievanceStatus.Rejected).length;

  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  // Department counts
  const departmentCounts: Record<number, number> = {};
  for (let d = 0; d <= 5; d++) {
    departmentCounts[d] = grievances.filter((g) => g.department === d).length;
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c193c] via-[#091530] to-[#071026] border border-teal-900/50 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Decentralized Public Grievance Verification Protocol</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Transparent, Tamper-Evident <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
              Public Grievance Redressal
            </span>{" "}
            on Ethereum
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            GrievanceChain records municipal complaints directly onto an immutable blockchain ledger. Every submission is sealed with a Keccak-256 cryptographic digest, ensuring status updates and departmental resolutions can never be manipulated or hidden.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("submit")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-semibold text-sm hover:from-teal-400 hover:to-cyan-500 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Grievance</span>
            </button>
            <button
              onClick={() => onNavigate("track")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111e47] border border-teal-700/50 text-slate-100 font-semibold text-sm hover:bg-teal-900/30 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-teal-400" />
              <span>Track Complaint Status</span>
            </button>
            <button
              onClick={() => onNavigate("explorer")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a1329] border border-slate-800 text-slate-300 font-medium text-sm hover:text-white hover:border-slate-700 transition-all"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Inspect Smart Contract</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="rounded-xl bg-[#0d1a3a]/80 border border-teal-900/40 p-4 shadow-sm hover:border-teal-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Grievances</span>
            <FileText className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{total}</div>
          <div className="text-[11px] text-teal-400/90 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>100% on-chain verified</span>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-xl bg-[#0d1a3a]/80 border border-teal-900/40 p-4 shadow-sm hover:border-teal-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-300">{pendingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Submitted or in triage</div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl bg-[#0d1a3a]/80 border border-teal-900/40 p-4 shadow-sm hover:border-teal-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>In Progress</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-cyan-300">{inProgressCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active field work assigned</div>
        </div>

        {/* Resolved */}
        <div className="rounded-xl bg-[#0d1a3a]/80 border border-teal-900/40 p-4 shadow-sm hover:border-teal-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-300">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-400/90 mt-1">
            {resolutionRate}% resolution rate
          </div>
        </div>

        {/* Rejected */}
        <div className="rounded-xl bg-[#0d1a3a]/80 border border-teal-900/40 p-4 shadow-sm hover:border-teal-700 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Rejected / Invalid</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-300">{rejectedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Logged with formal justification</div>
        </div>
      </div>

      {/* Blockchain Live Status Strip */}
      <div className="rounded-xl bg-[#081229] border border-teal-800/40 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="text-slate-400 font-medium">EVM Execution State: </span>
            <span className="text-emerald-300 font-semibold">Active & Synced</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-300 font-mono text-[11px]">
          <div>
            <span className="text-slate-400">Block Height: </span>
            <span className="text-teal-300 font-bold">#{latestBlockNumber}</span>
          </div>
          <div>
            <span className="text-slate-400">Chain ID: </span>
            <span className="text-teal-300">31337 (Local Hardhat)</span>
          </div>
          <div>
            <span className="text-slate-400">Consensus: </span>
            <span className="text-teal-300">Proof of Authority / Dev</span>
          </div>
          <div>
            <span className="text-slate-400">Gas Price: </span>
            <span className="text-teal-300">0.0000 Gwei</span>
          </div>
        </div>
      </div>

      {/* Department Breakdown Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <span>Grievances by Municipal Department</span>
          </h2>
          <span className="text-xs text-slate-400">Click department to view in Administration</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(DEPARTMENT_NAMES).map(([key, name]) => {
            const deptIndex = Number(key);
            const count = departmentCounts[deptIndex] || 0;
            return (
              <div
                key={key}
                onClick={() => onNavigate("admin")}
                className="rounded-xl bg-[#0c1836] border border-teal-900/40 hover:border-teal-500/60 p-3.5 cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                <div className="text-xs font-semibold text-slate-300 group-hover:text-teal-300 transition-colors line-clamp-1">
                  {name}
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold text-white">{count}</span>
                  <span className="text-[10px] text-slate-400">grievances</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Complaint Records Table */}
      <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-teal-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-teal-400" />
              <span>Recent Blockchain-Sealed Grievance Records</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live immutable entries ordered by most recent transaction block
            </p>
          </div>
          <button
            onClick={() => onNavigate("track")}
            className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold"
          >
            <span>Search All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081229] text-slate-400 uppercase text-[10px] tracking-wider border-b border-teal-950">
              <tr>
                <th className="px-5 py-3">Tracking Code</th>
                <th className="px-4 py-3">Department & Category</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Citizen Status</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Content Hash</th>
                <th className="px-4 py-3">Block #</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-950/60">
              {grievances.map((g) => {
                const statusMeta = STATUS_LABELS[g.currentStatus];
                return (
                  <tr key={g.id} className="hover:bg-[#102047]/60 transition-colors">
                    {/* Code */}
                    <td className="px-5 py-3.5 font-mono font-bold text-teal-300 whitespace-nowrap">
                      {g.trackingCode}
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-slate-200">
                        {DEPARTMENT_NAMES[g.department]}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {g.category}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-100 max-w-xs truncate">
                        {g.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatTimestamp(g.createdAt)}
                      </div>
                    </td>

                    {/* Citizen */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {g.isAnonymous ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          Anonymous
                        </span>
                      ) : (
                        <div>
                          <div className="text-slate-200 font-medium">{g.citizenName}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {formatAddress(g.citizenAddress)}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Hash */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      <span className="text-teal-400/80" title={g.contentHash}>
                        {formatAddress(g.contentHash, 6, 4)}
                      </span>
                    </td>

                    {/* Block */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-300">
                      #{g.blockNumber}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onTrackGrievance(g.trackingCode)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:bg-teal-500/20 transition-all cursor-pointer"
                      >
                        <Search className="w-3 h-3" />
                        <span>Track</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
