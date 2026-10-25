import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Send,
  User,
  EyeOff,
  Building2,
  Tag,
  AlignLeft,
  MapPin,
  Flame,
  CheckCircle2,
  Copy,
  ExternalLink,
  Lock,
  Hash,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Department, GrievanceRecord } from "../blockchain/types";
import { DEPARTMENT_NAMES, DEPARTMENT_CATEGORIES } from "../blockchain/contractConfig";
import { computeGrievanceContentHash, formatAddress } from "../blockchain/hashUtils";

interface SubmitGrievanceViewProps {
  onRegisterGrievance: (data: {
    citizenName?: string;
    citizenAddress: string;
    isAnonymous: boolean;
    department: Department;
    category: string;
    title: string;
    description: string;
    location?: string;
    urgency: "Low" | "Medium" | "High" | "Emergency";
  }) => { grievance: GrievanceRecord; block: any; tx: any };
  connectedAddress: string | null;
  onTrackNewGrievance: (trackingCode: string) => void;
}

export const SubmitGrievanceView: React.FC<SubmitGrievanceViewProps> = ({
  onRegisterGrievance,
  connectedAddress,
  onTrackNewGrievance,
}) => {
  // Form State
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [citizenName, setCitizenName] = useState("");
  const [citizenContact, setCitizenContact] = useState("");
  const [department, setDepartment] = useState<Department>(Department.WaterSupply);
  const [category, setCategory] = useState<string>(DEPARTMENT_CATEGORIES[Department.WaterSupply][0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState<"Low" | "Medium" | "High" | "Emergency">("Medium");

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    record: GrievanceRecord;
    txHash: string;
    blockNumber: number;
    gasUsed: number;
  } | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Update category when department changes
  const handleDepartmentChange = (newDept: Department) => {
    setDepartment(newDept);
    setCategory(DEPARTMENT_CATEGORIES[newDept][0]);
  };

  // Compute live Keccak-256 hash preview
  const liveContentHash = useMemo(() => {
    if (!title.trim() && !description.trim()) {
      return "0x0000000000000000000000000000000000000000000000000000000000000000";
    }
    return computeGrievanceContentHash({
      title: title || "Draft",
      department,
      category,
      description: description || "Draft",
      location: location || "",
      createdAt: Math.floor(Date.now() / 1000),
    });
  }, [title, department, category, description, location]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isAnonymous && !citizenName.trim()) {
      newErrors.citizenName = "Please enter your name or select Anonymous submission.";
    }

    if (!title.trim()) {
      newErrors.title = "Complaint title is required.";
    } else if (title.trim().length < 8) {
      newErrors.title = "Title must be at least 8 characters long.";
    }

    if (!description.trim()) {
      newErrors.description = "Detailed complaint description is required.";
    } else if (description.trim().length < 20) {
      newErrors.description = "Please provide more details (at least 20 characters) for department evaluation.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const callerAddress = connectedAddress || "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

        const result = onRegisterGrievance({
          citizenName: isAnonymous ? "Anonymous Citizen" : citizenName,
          citizenAddress: callerAddress,
          isAnonymous,
          department,
          category,
          title,
          description,
          location,
          urgency,
        });

        setSubmissionSuccess({
          record: result.grievance,
          txHash: result.tx.hash,
          blockNumber: result.block.blockNumber,
          gasUsed: result.tx.gasUsed,
        });
      } catch (err: any) {
        setErrors({ submit: err.message || "Failed to seal grievance on blockchain." });
      } finally {
        setIsSubmitting(false);
      }
    }, 700);
  };

  const copyToClipboard = (text: string, type: "hash" | "code") => {
    navigator.clipboard.writeText(text);
    if (type === "hash") {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>EVM Cryptographic Filing Protocol</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Submit Citizen Grievance
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          File an authentic civic complaint. The summary and content digest are sealed onto the Ethereum blockchain for permanent auditability.
        </p>
      </div>

      {/* Success Modal / Banner */}
      {submissionSuccess ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#0c2242] to-[#071730] border-2 border-emerald-500/50 p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                Transaction Confirmed & Block Mined
              </span>
              <h2 className="text-xl font-bold text-white">
                Grievance Successfully Sealed on Blockchain
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#061024]/80 rounded-xl p-5 border border-teal-950">
            {/* Tracking Code */}
            <div>
              <div className="text-xs text-slate-400 mb-1">Generated Tracking Code:</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono font-bold text-teal-300">
                  {submissionSuccess.record.trackingCode}
                </span>
                <button
                  onClick={() => copyToClipboard(submissionSuccess.record.trackingCode, "code")}
                  className="p-1.5 rounded-lg bg-[#0e1d42] hover:bg-teal-900/40 text-slate-300 hover:text-teal-300 transition-colors"
                  title="Copy Tracking Code"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copiedCode && <span className="text-xs text-emerald-400">Copied!</span>}
              </div>
            </div>

            {/* Block Number */}
            <div>
              <div className="text-xs text-slate-400 mb-1">Mined Block Height:</div>
              <div className="text-2xl font-mono font-bold text-cyan-300">
                #{submissionSuccess.blockNumber}
              </div>
            </div>

            {/* Content Hash */}
            <div className="sm:col-span-2">
              <div className="text-xs text-slate-400 mb-1">Keccak-256 Content Fingerprint:</div>
              <div className="flex items-center justify-between gap-2 bg-[#091530] p-2.5 rounded-lg border border-teal-900 font-mono text-xs text-teal-300 break-all">
                <span>{submissionSuccess.record.contentHash}</span>
                <button
                  onClick={() => copyToClipboard(submissionSuccess.record.contentHash, "hash")}
                  className="p-1 rounded bg-teal-950 hover:bg-teal-900 text-teal-400 transition-colors shrink-0"
                  title="Copy Full Hash"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedHash && <span className="text-xs text-emerald-400 mt-1 block">Hash copied!</span>}
            </div>

            {/* Tx Hash & Gas */}
            <div className="text-xs text-slate-400">
              <span>Tx Hash: </span>
              <span className="font-mono text-slate-300">
                {formatAddress(submissionSuccess.txHash, 10, 8)}
              </span>
            </div>

            <div className="text-xs text-slate-400">
              <span>Gas Consumed: </span>
              <span className="font-mono text-emerald-400 font-semibold">
                {submissionSuccess.gasUsed.toLocaleString()} units
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onTrackNewGrievance(submissionSuccess.record.trackingCode)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-bold text-sm hover:from-teal-400 hover:to-cyan-500 transition-all shadow-lg cursor-pointer"
            >
              <span>Track This Grievance Now</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSubmissionSuccess(null);
                setTitle("");
                setDescription("");
                setLocation("");
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0e1b3d] border border-slate-700 text-slate-300 text-sm font-medium hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Submit Another Grievance
            </button>
          </div>
        </div>
      ) : (
        /* Grievance Submission Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl bg-[#0c1836] border border-teal-900/50 p-6 sm:p-8 shadow-xl space-y-6">
            {/* Identity & Anonymity Section */}
            <div className="space-y-3 pb-6 border-b border-teal-950">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-400" />
                  <span>Citizen Identification</span>
                </label>

                {/* Anonymous Toggle */}
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isAnonymous
                      ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                      : "bg-[#111e42] text-slate-300 border-teal-900 hover:border-teal-700"
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{isAnonymous ? "Anonymous Mode Active" : "Enable Anonymous Submission"}</span>
                </button>
              </div>

              {isAnonymous ? (
                <div className="rounded-xl bg-[#081229] border border-orange-500/30 p-3.5 flex items-start gap-3 text-xs text-orange-200/90">
                  <Lock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-orange-300">Privacy Safeguard: </span>
                    Your real identity and contact info will NOT be recorded. On the blockchain, the submitter address will be recorded as zero-address (0x0000...0000) or a masked relay identifier.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">
                      Citizen Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Sharma"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#081229] border border-teal-950 focus:border-teal-500 focus:outline-none text-white text-sm"
                    />
                    {errors.citizenName && (
                      <p className="text-xs text-rose-400 mt-1">{errors.citizenName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">
                      Optional Phone / Email (Stored Off-Chain)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. citizen@example.com / +91-9876543210"
                      value={citizenContact}
                      onChange={(e) => setCitizenContact(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#081229] border border-teal-950 focus:border-teal-500 focus:outline-none text-white text-sm"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Never stored on-chain to protect citizen data privacy.
                    </p>
                  </div>
                </div>
              )}

              {!isAnonymous && connectedAddress && (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-teal-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>On-Chain Submitter Wallet Address:</span>
                  <span className="font-mono text-white bg-[#050c1f] px-2 py-0.5 rounded border border-teal-900">
                    {formatAddress(connectedAddress, 8, 6)}
                  </span>
                </div>
              )}
            </div>

            {/* Department & Dynamic Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Target Municipal Department <span className="text-rose-400">*</span></span>
                </label>
                <select
                  value={department}
                  onChange={(e) => handleDepartmentChange(Number(e.target.value) as Department)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081229] border border-teal-950 focus:border-teal-500 focus:outline-none text-white text-sm cursor-pointer"
                >
                  {Object.entries(DEPARTMENT_NAMES).map(([val, name]) => (
                    <option key={val} value={val}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-teal-400" />
                  <span>Complaint Category <span className="text-rose-400">*</span></span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081229] border border-teal-950 focus:border-teal-500 focus:outline-none text-white text-sm cursor-pointer"
                >
                  {DEPARTMENT_CATEGORIES[department].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Complaint Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-teal-400" />
                <span>Complaint Title / Subject <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="text"
                placeholder="e.g. Hazardous Water Main Burst Causing Street Flooding"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#081229] border border-teal-950 focus:border-teal-500 focus:outline-none text-white text-sm"
              />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Detailed Description & Impact <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe the issue, specific landmarks, when it started, and the hazard posed to citizens..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#081229] border border-teal-950 focus:border-teal-500 focus:outline-none text-white text-sm resize-none"
              />
              {errors.description && (
                <p className="text-xs text-rose-400 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Location & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>Location / Ward / Landmark (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Community Center, Ward 14, Sector 7"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081229] border border-teal-950 focus:border-teal-500 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Reported Urgency</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["Low", "Medium", "High", "Emergency"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgency(lvl)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        urgency === lvl
                          ? lvl === "Emergency"
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                            : lvl === "High"
                            ? "bg-orange-500 text-slate-950"
                            : "bg-teal-500 text-slate-950"
                          : "bg-[#081229] text-slate-300 hover:bg-[#111e42] border border-teal-950"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cryptographic Keccak-256 Digest Preview */}
            <div className="rounded-xl bg-[#081229] border border-teal-900/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-teal-400" />
                  <span>Real-time On-Chain Cryptographic Content Digest (Keccak-256):</span>
                </span>
                <span className="text-[10px] text-teal-400 font-mono">EVM SHA-3</span>
              </div>
              <div className="font-mono text-xs text-teal-300/90 break-all bg-[#050b1a] p-2.5 rounded-lg border border-teal-950">
                {liveContentHash}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                This 256-bit hash will be sealed in the smart contract storage. Any unauthorized tampering with the complaint description or category off-chain will immediately invalidate this hash!
              </p>
            </div>

            {/* Error banner */}
            {errors.submit && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 text-slate-950 font-bold text-sm hover:from-teal-400 hover:to-cyan-500 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Mining Block & Sealing On-Chain...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Seal & Submit Grievance onto Blockchain</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
