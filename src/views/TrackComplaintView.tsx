import React, { useState, useEffect } from "react";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Tag,
  User,
  MapPin,
  Hash,
  Boxes,
  FileCheck,
  ChevronRight,
  RefreshCw,
  Copy,
  ExternalLink,
  Flame,
} from "lucide-react";
import { GrievanceRecord, GrievanceStatus } from "../blockchain/types";
import { DEPARTMENT_NAMES, STATUS_LABELS } from "../blockchain/contractConfig";
import {
  formatAddress,
  formatTimestamp,
  verifyContentIntegrity,
  computeGrievanceContentHash,
} from "../blockchain/hashUtils";

interface TrackComplaintViewProps {
  grievances: GrievanceRecord[];
  initialSearchCode?: string;
  onSimulateTamper: (id: number, tamperedDescription: string) => void;
  onResetSeed: () => void;
}

export const TrackComplaintView: React.FC<TrackComplaintViewProps> = ({
  grievances,
  initialSearchCode = "",
  onSimulateTamper,
  onResetSeed,
}) => {
  const [searchInput, setSearchInput] = useState(initialSearchCode);
  const [selectedRecord, setSelectedRecord] = useState<GrievanceRecord | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Integrity Check State
  const [integrityState, setIntegrityState] = useState<{
    tested: boolean;
    isValid: boolean;
    recomputedHash: string;
  }>({ tested: false, isValid: true, recomputedHash: "" });

  // Handle initial search
  useEffect(() => {
    if (initialSearchCode) {
      setSearchInput(initialSearchCode);
      const match = grievances.find(
        (g) => g.trackingCode.toUpperCase() === initialSearchCode.trim().toUpperCase()
      );
      setSelectedRecord(match || null);
      setSearchAttempted(true);
      if (match) {
        checkIntegrity(match);
      }
    } else if (grievances.length > 0 && !selectedRecord) {
      // Default to first record
      setSelectedRecord(grievances[0]);
      checkIntegrity(grievances[0]);
    }
  }, [initialSearchCode, grievances]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchAttempted(true);
    const code = searchInput.trim().toUpperCase();
    const match = grievances.find((g) => g.trackingCode.toUpperCase() === code);
    setSelectedRecord(match || null);
    if (match) {
      checkIntegrity(match);
    }
  };

  const checkIntegrity = (record: GrievanceRecord) => {
    const result = verifyContentIntegrity(
      {
        title: record.title,
        department: record.department,
        category: record.category,
        description: record.description,
        location: record.location,
        createdAt: record.createdAt,
      },
      record.contentHash
    );

    setIntegrityState({
      tested: true,
      isValid: result.isValid,
      recomputedHash: result.recomputedHash,
    });
  };

  const handleTamperTest = () => {
    if (!selectedRecord) return;
    const tampered =
      selectedRecord.description +
      " [MALICIOUS UNAUTHORIZED ALTERATION BY LOCAL DATABASE INTRUSION]";
    onSimulateTamper(selectedRecord.id, tampered);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <Search className="w-4 h-4 text-teal-400" />
          <span>Real-time On-Chain Search & Audit</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Track Grievance Lifecycle
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Query complaint status and verify its cryptographic integrity against the blockchain ledger.
        </p>
      </div>

      {/* Search Bar & Quick Tags */}
      <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-6 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter unique tracking code (e.g. GRV-2026-1001)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#081229] border border-teal-950 focus:border-teal-500 focus:outline-none text-white text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-bold text-sm hover:from-teal-400 hover:to-cyan-500 transition-all shadow-md cursor-pointer shrink-0"
          >
            Track Status
          </button>
        </form>

        {/* Quick Click Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400">Quick Samples:</span>
          {grievances.slice(0, 4).map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setSearchInput(g.trackingCode);
                setSelectedRecord(g);
                checkIntegrity(g);
              }}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs font-medium border transition-all cursor-pointer ${
                selectedRecord?.id === g.id
                  ? "bg-teal-500/20 text-teal-300 border-teal-500/50"
                  : "bg-[#081229] text-slate-400 border-teal-950 hover:text-slate-200"
              }`}
            >
              {g.trackingCode} ({STATUS_LABELS[g.currentStatus].label})
            </button>
          ))}
        </div>
      </div>

      {/* Search Not Found Banner */}
      {searchAttempted && !selectedRecord && (
        <div className="rounded-2xl bg-rose-950/30 border border-rose-500/40 p-8 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Grievance Record Not Found</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No grievance was found on the blockchain matching tracking code{" "}
            <span className="font-mono text-rose-300 font-semibold">{searchInput}</span>. Please verify your tracking ID or select one of the available sample records above.
          </p>
        </div>
      )}

      {/* Complaint Detail Card */}
      {selectedRecord && (
        <div className="space-y-6">
          {/* Main Record Header */}
          <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-teal-950">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-bold text-teal-300">
                    {selectedRecord.trackingCode}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      STATUS_LABELS[selectedRecord.currentStatus].bg
                    } ${STATUS_LABELS[selectedRecord.currentStatus].color} ${
                      STATUS_LABELS[selectedRecord.currentStatus].border
                    }`}
                  >
                    {STATUS_LABELS[selectedRecord.currentStatus].label}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[10px] font-bold">
                    {selectedRecord.urgency} Urgency
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedRecord.title}</h2>
              </div>

              {/* Block & Timestamp Badge */}
              <div className="text-right sm:border-l sm:border-teal-950 sm:pl-5 space-y-1 text-xs">
                <div className="text-slate-400">Sealed at Block:</div>
                <div className="text-cyan-300 font-mono font-bold text-sm">
                  #{selectedRecord.blockNumber}
                </div>
                <div className="text-slate-400 text-[11px]">
                  {formatTimestamp(selectedRecord.createdAt)}
                </div>
              </div>
            </div>

            {/* Department, Category, Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#081229] p-4 rounded-xl border border-teal-950 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  Department
                </span>
                <span className="text-slate-200 font-semibold text-sm">
                  {DEPARTMENT_NAMES[selectedRecord.department]}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-teal-400" />
                  Category
                </span>
                <span className="text-slate-200 font-semibold">{selectedRecord.category}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  Location
                </span>
                <span className="text-slate-200 font-semibold">
                  {selectedRecord.location || "General Area"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Official Citizen Complaint Description:
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed bg-[#081229] p-4 rounded-xl border border-teal-950">
                {selectedRecord.description}
              </p>
            </div>

            {/* On-Chain Cryptographic Proof Box */}
            <div className="rounded-xl bg-[#060e21] border border-teal-900/60 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-teal-400" />
                  <span>On-Chain Keccak-256 Content Hash (Immutable Smart Contract State):</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyHash(selectedRecord.contentHash)}
                    className="p-1 rounded bg-teal-950 hover:bg-teal-900 text-teal-300 text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedHash ? "Copied" : "Copy Hash"}</span>
                  </button>
                </div>
              </div>

              <div className="font-mono text-xs text-teal-300 break-all bg-[#040814] p-3 rounded-lg border border-teal-950">
                {selectedRecord.contentHash}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                <span>
                  Submitter:{" "}
                  <strong className="text-slate-300">
                    {selectedRecord.isAnonymous ? "Anonymous Citizen (0x0000...)" : selectedRecord.citizenName}
                  </strong>
                </span>
                <span>
                  Tx Hash:{" "}
                  <span className="font-mono text-slate-400">
                    {formatAddress(selectedRecord.txHash, 8, 6)}
                  </span>
                </span>
              </div>
            </div>

            {/* Cryptographic Tamper-Evidence Verification Console */}
            <div className="rounded-xl bg-[#081533] border border-teal-800/60 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      integrityState.isValid ? "bg-emerald-400" : "bg-rose-500 animate-ping"
                    }`}
                  />
                  <h4 className="text-sm font-bold text-white">
                    Cryptographic Integrity & Tamper-Evident Verification
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => checkIntegrity(selectedRecord)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-verify Proof</span>
                  </button>
                  <button
                    onClick={handleTamperTest}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all cursor-pointer"
                    title="Simulate unauthorized tampering to test SHA-3 mismatch"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Simulate Tamper Attack (Demo)</span>
                  </button>
                </div>
              </div>

              {integrityState.tested && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    integrityState.isValid
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                      : "bg-rose-950/40 border-rose-500/60 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {integrityState.isValid ? (
                      <>
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300">
                          INTEGRITY VERIFIED: Off-Chain Data Matches On-Chain Seal 100%
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                        <span className="text-rose-300">
                          TAMPERING DETECTED! Cryptographic Hash Discrepancy Found!
                        </span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    {integrityState.isValid
                      ? "The recalculation of Keccak-256(Title + Dept + Category + Description + Location) matches the smart contract storage hash byte-for-byte. The record is authentic and untampered."
                      : "The off-chain complaint content was modified! The computed hash no longer matches the immutable on-chain smart contract hash. In a traditional database, this unauthorized modification would remain undetected, but blockchain catches it instantly!"}
                  </p>
                  {!integrityState.isValid && (
                    <div className="pt-2 flex items-center justify-between">
                      <div className="font-mono text-[10px] break-all">
                        Computed: {integrityState.recomputedHash}
                      </div>
                      <button
                        onClick={onResetSeed}
                        className="px-2.5 py-1 rounded bg-teal-500 text-slate-950 font-bold text-xs shrink-0 ml-2 cursor-pointer"
                      >
                        Restore Original Record
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Complete Status History Audit Trail */}
          <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-400" />
                  <span>Immutable Status Audit Trail (Smart Contract Event Logs)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological event trail recorded by authorized department officers
                </p>
              </div>
              <span className="text-xs font-mono text-teal-300">
                {selectedRecord.statusHistory.length} events logged
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-teal-900/70">
              {selectedRecord.statusHistory.map((log, index) => {
                const meta = STATUS_LABELS[log.status];
                return (
                  <div key={index} className="relative group">
                    {/* Timeline bullet */}
                    <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[#081229] border-2 border-teal-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-teal-400" />
                    </div>

                    <div className="rounded-xl bg-[#081229] border border-teal-950 p-4 space-y-2 hover:border-teal-800 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.bg} ${meta.color} ${meta.border}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            by {formatAddress(log.updatedBy)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {log.remarks}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
