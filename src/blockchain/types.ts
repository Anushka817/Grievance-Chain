export enum GrievanceStatus {
  Submitted = 0,
  UnderReview = 1,
  InProgress = 2,
  Resolved = 3,
  Rejected = 4,
}

export enum Department {
  WaterSupply = 0,
  Electricity = 1,
  Roads = 2,
  Sanitation = 3,
  PublicSafety = 4,
  Other = 5,
}

export interface StatusLog {
  status: GrievanceStatus;
  updatedBy: string;
  remarks: string;
  timestamp: number; // Unix timestamp in seconds
}

export interface GrievanceRecord {
  id: number;
  trackingCode: string;
  citizenName?: string;
  citizenAddress: string;
  isAnonymous: boolean;
  department: Department;
  category: string;
  title: string;
  description: string;
  location?: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  contentHash: string; // 32-byte Keccak-256 hash
  currentStatus: GrievanceStatus;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  txHash: string;
  blockNumber: number;
  gasUsed: number;
  statusHistory: StatusLog[];
}

export interface MinedBlock {
  blockNumber: number;
  timestamp: number;
  miner: string;
  previousHash: string;
  blockHash: string;
  txCount: number;
  gasUsed: number;
  transactions: string[];
}

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  action: string;
  trackingCode?: string;
  status: 'Confirmed' | 'Failed';
  timestamp: number;
  gasUsed: number;
  inputDataSummary: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isOfficer: boolean;
  officerDepartmentScope: number; // 0 = all, 1-6 = specific department
  isAdmin: boolean;
  providerType: 'metamask' | 'simulated' | 'none';
  error: string | null;
}
