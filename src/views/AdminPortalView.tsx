import React, { useState } from "react";
import {
  SlidersHorizontal,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  UserX,
  FileEdit,
  Layers,
  HelpCircle,
} from "lucide-react";
import { GrievanceRecord, GrievanceStatus, Department, WalletState } from "../blockchain/types";
import { DEPARTMENT_NAMES, STATUS_LABELS } from "../blockchain/contractConfig";
import { formatAddress, formatTimestamp } from "../blockchain/hashUtils";

interface AdminPortalViewProps {
  grievances: GrievanceRecord[];
  wallet: WalletState;
  onUpdateStatus: (params: {
    id: number;
    newStatus: GrievanceStatus;
    remarks: string;
    officerAddress: string;
  }) => { success: boolean; record?: GrievanceRecord; error?: string };
  demoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  onAuthorizeOfficer: (officerAddress: string, scope: number) => void;
  onRevokeOfficer: (officerAddress: string) => void;
  onTrackGrievance: (trackingCode: string) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  grievances,
  wallet,
  onUpdateStatus,
  demoMode,
  onToggleDemoMode,
  onAuthorizeOfficer,
  onRevokeOfficer,
  onTrackGrievance,
}) => {
  // Filters
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<number | "all">("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<number | "all">("all");

  // Status Update Modal State
  const [activeModalGrievance, setActiveModalGrievance] = useState<GrievanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<GrievanceStatus>(GrievanceStatus.UnderReview);
  const [remarks, setRemarks] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtered grievances
  const filtered = grievances.filter((g) => {
    if (selectedDeptFilter !== "all" && g.department !== selectedDeptFilter) return false;
    if (selectedStatusFilter !== "all" && g.currentStatus !== selectedStatusFilter) return false;
    return true;
  });

  const handleOpenActionModal = (g: GrievanceRecord) => {
    setActiveModalGrievance(g);
    setActionError(null);
    setRemarks("");
    // Default next logical status
    if (g.currentStatus === GrievanceStatus.Submitted) {
      setNewStatus(GrievanceStatus.UnderReview);
    } else if (g.currentStatus === GrievanceStatus.UnderReview) {
      setNewStatus(GrievanceStatus.InProgress);
    } else if (g.currentStatus === GrievanceStatus.InProgress) {
      setNewStatus(GrievanceStatus.Resolved);
    } else {
      setNewStatus(GrievanceStatus.UnderReview);
    }
  };

  const handleExecuteStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalGrievance) return;

    if (!remarks.trim()) {
      setActionError("Official department remarks are mandatory for blockchain audit logging.");
      return;
    }

    if (newStatus === activeModalGrievance.currentStatus) {
      setActionError("New status must differ from the current status.");
      return;
    }

    setIsProcessing(true);
    setActionError(null);

    setTimeout(() => {
      const caller = wallet.address || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      const res = onUpdateStatus({
        id: activeModalGrievance.id,
        newStatus,
        remarks,
        officerAddress: caller,
      });

      setIsProcessing(false);

      if (res.success) {
        setActiveModalGrievance(null);
        setRemarks("");
      } else {
        setActionError(res.error || "Transaction reverted by smart contract access control.");
      }
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-400" />
            <span>Authorized Officer & Administration Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Department Grievance Redressal Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review filed complaints, dispatch maintenance operations, and record cryptographic status updates.
          </p>
        </div>

        {/* Access Status Card */}
        <div className="rounded-xl bg-[#0c1836] border border-teal-900/60 p-4 text-xs space-y-1.5 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Officer Wallet:</span>
            <span className="font-mono text-teal-300 font-semibold">
              {formatAddress(wallet.address, 6, 4)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Permissions:</span>
            <span className="font-semibold text-slate-200">
              {wallet.isAdmin
                ? "System Administrator (Full Access)"
                : wallet.isOfficer
                ? "Authorized Department Officer"
                : demoMode
                ? "Demo Mode (Open Access)"
                : "Citizen (Unauthorized)"}
            </span>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Educational Test Console */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1a3b] to-[#07132b] border border-teal-800/60 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-teal-950">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Smart Contract Role-Based Access Control (RBAC) Settings</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enforces <code className="text-teal-300 font-mono">onlyAuthorizedOfficer</code> modifier in <code className="text-teal-300 font-mono">GrievanceRegistry.sol</code>.
            </p>
          </div>

          {/* Demo Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-medium">Demo Mode:</span>
            <button
              onClick={() => onToggleDemoMode(!demoMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                demoMode ? "bg-teal-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  demoMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-xs font-mono font-semibold text-teal-300">
              {demoMode ? "ENABLED (Examiner Mode)" : "STRICT RBAC"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-[#081229] p-3 rounded-xl border border-teal-950">
            <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Testing Unauthorized Rejection:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Turn Demo Mode OFF and use the top navigation role switcher to select <strong>Citizen Persona</strong>. Any attempt to update status will revert with <span className="text-rose-400 font-mono">"Unauthorized. Requires Department Officer or Admin privileges"</span>!
            </p>
          </div>

          <div className="bg-[#081229] p-3 rounded-xl border border-teal-950">
            <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Department Officer Scope:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Contract maps <span className="font-mono text-teal-300">officerDepartmentScope</span>. Scope 0 grants authority across all municipal branches; scope 1-6 restricts to a specific civic division.
            </p>
          </div>

          <div className="bg-[#081229] p-3 rounded-xl border border-teal-950">
            <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Trail Immutability:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Every transition logs <span className="font-mono text-teal-300">GrievanceStatusUpdated</span> with the officer's wallet address, timestamp, and justification.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0c1836] p-4 rounded-xl border border-teal-900/40 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <span>Department:</span>
          </span>
          <button
            onClick={() => setSelectedDeptFilter("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedDeptFilter === "all"
                ? "bg-teal-500 text-slate-950 font-bold"
                : "bg-[#081229] text-slate-300 hover:text-white"
            }`}
          >
            All Departments
          </button>
          {Object.entries(DEPARTMENT_NAMES).map(([k, name]) => (
            <button
              key={k}
              onClick={() => setSelectedDeptFilter(Number(k))}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedDeptFilter === Number(k)
                  ? "bg-teal-500 text-slate-950 font-bold"
                  : "bg-[#081229] text-slate-300 hover:text-white"
              }`}
            >
              {name.split(" ")[0]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Status:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) =>
              setSelectedStatusFilter(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="px-2.5 py-1 rounded-lg bg-[#081229] border border-teal-950 text-slate-200 text-xs focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value={GrievanceStatus.Submitted}>Submitted</option>
            <option value={GrievanceStatus.UnderReview}>Under Review</option>
            <option value={GrievanceStatus.InProgress}>In Progress</option>
            <option value={GrievanceStatus.Resolved}>Resolved</option>
            <option value={GrievanceStatus.Rejected}>Rejected</option>
          </select>
        </div>
      </div>

      {/* Grievances List for Review */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-12 text-center text-slate-400 text-sm">
            No grievances match the selected filter criteria.
          </div>
        ) : (
          filtered.map((g) => {
            const statusMeta = STATUS_LABELS[g.currentStatus];
            return (
              <div
                key={g.id}
                className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-5 sm:p-6 shadow-lg hover:border-teal-700/60 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-mono font-bold text-teal-300">
                      {g.trackingCode}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}
                    >
                      {statusMeta.label}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 text-xs">
                      {DEPARTMENT_NAMES[g.department]}
                    </span>
                    <span className="text-xs text-orange-400 font-semibold">
                      {g.urgency} Urgency
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Block #{g.blockNumber} • {formatTimestamp(g.createdAt)}
                  </div>
                </div>

                {/* Complaint Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{g.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {g.description}
                  </p>
                </div>

                {/* Meta details & action buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-teal-950/80 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-slate-400">
                    <span>
                      Citizen:{" "}
                      <strong className="text-slate-200">
                        {g.isAnonymous ? "Anonymous" : g.citizenName}
                      </strong>
                    </span>
                    <span>
                      Location: <strong className="text-slate-200">{g.location}</strong>
                    </span>
                    <span className="font-mono text-teal-400/80">
                      Hash: {formatAddress(g.contentHash, 6, 4)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTrackGrievance(g.trackingCode)}
                      className="px-3 py-1.5 rounded-lg bg-[#081229] text-slate-300 hover:text-white border border-teal-950 text-xs font-medium cursor-pointer"
                    >
                      View Audit Log
                    </button>
                    <button
                      onClick={() => handleOpenActionModal(g)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors shadow-md cursor-pointer"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Review & Update Status</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review & Update Status Modal */}
      {activeModalGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0c1836] border border-teal-700/80 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-teal-950">
              <div>
                <span className="text-xs uppercase font-bold text-teal-400">
                  Officer Action Terminal
                </span>
                <h3 className="text-lg font-bold text-white">
                  Update Grievance: {activeModalGrievance.trackingCode}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalGrievance(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteStatusUpdate} className="space-y-4">
              {/* Current info */}
              <div className="bg-[#081229] p-3.5 rounded-xl border border-teal-950 text-xs space-y-1">
                <div className="text-slate-400">Complaint:</div>
                <div className="font-semibold text-white">{activeModalGrievance.title}</div>
                <div className="text-slate-400 text-[11px] pt-1">
                  Department: {DEPARTMENT_NAMES[activeModalGrievance.department]} • Category: {activeModalGrievance.category}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Select New Lifecycle Status:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { status: GrievanceStatus.UnderReview, label: "Under Review" },
                    { status: GrievanceStatus.InProgress, label: "In Progress" },
                    { status: GrievanceStatus.Resolved, label: "Resolved" },
                    { status: GrievanceStatus.Rejected, label: "Rejected" },
                  ].map((s) => (
                    <button
                      key={s.status}
                      type="button"
                      onClick={() => setNewStatus(s.status)}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        newStatus === s.status
                          ? s.status === GrievanceStatus.Resolved
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                            : s.status === GrievanceStatus.Rejected
                            ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20"
                            : "bg-teal-500 text-slate-950 border-teal-400"
                          : "bg-[#081229] text-slate-300 border-teal-950 hover:bg-[#111e42]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks / Justification */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Official Department Remarks / Action Notes <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Field inspection completed by Ward Engineer. Work order #WO-891 issued for pipe replacement..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081229] border border-teal-950 focus:border-teal-500 focus:outline-none text-white text-xs resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  These remarks will be permanently sealed onto the smart contract history log.
                </p>
              </div>

              {/* Error message */}
              {actionError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveModalGrievance(null)}
                  className="px-4 py-2 rounded-xl bg-[#081229] text-slate-300 text-xs font-semibold hover:text-white border border-teal-950 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-bold text-xs hover:from-teal-400 hover:to-cyan-500 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Broadcasting Transaction...</span>
                    </>
                  ) : (
                    <span>Sign & Update on Blockchain</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
