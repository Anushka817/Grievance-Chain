import { keccak256, toUtf8Bytes } from "ethers";
import {
  GrievanceRecord,
  GrievanceStatus,
  Department,
  MinedBlock,
  BlockchainTransaction,
  StatusLog,
} from "./types";
import { computeGrievanceContentHash } from "./hashUtils";

const STORAGE_KEY_GRIEVANCES = "grievancechain_records_v1";
const STORAGE_KEY_BLOCKS = "grievancechain_blocks_v1";
const STORAGE_KEY_TXS = "grievancechain_txs_v1";
const STORAGE_KEY_ROLES = "grievancechain_roles_v1";

export const HARDHAT_ADMIN_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
export const HARDHAT_OFFICER_ACCOUNT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
export const HARDHAT_CITIZEN_ACCOUNT = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

interface RoleConfig {
  admin: string;
  officers: Record<string, { authorized: boolean; scope: number }>;
  demoMode: boolean;
}

// Initial seed data with authentic timestamps and Keccak256 hashes
function getInitialSeedData(): {
  grievances: GrievanceRecord[];
  blocks: MinedBlock[];
  transactions: BlockchainTransaction[];
} {
  const baseTime = Math.floor(Date.now() / 1000) - 86400 * 3; // 3 days ago

  const g1Payload = {
    title: "Burst Municipal Water Main Pipe Near Sector 7 Circle",
    department: Department.WaterSupply,
    category: "Pipeline Leakage or Burst Pipe",
    description: "Major water pipeline broken causing high-pressure drinking water loss and street flooding near the Sector 7 intersection.",
    location: "Sector 7 Circle, Opposite City Library",
    createdAt: baseTime + 1200,
  };
  const g1Hash = computeGrievanceContentHash(g1Payload);

  const g2Payload = {
    title: "Faulty High-Tension Distribution Transformer",
    department: Department.Electricity,
    category: "Damaged Transformer / Sparks",
    description: "Repeated sparks and loud humming heard from transformer box pole #11. Poses severe electrocution hazard to passersby.",
    location: "Lane 4, Subhash Nagar",
    createdAt: baseTime + 14400,
  };
  const g2Hash = computeGrievanceContentHash(g2Payload);

  const g3Payload = {
    title: "Large Crater Potholes Threatening Motorcyclists",
    department: Department.Roads,
    category: "Hazardous Potholes on Main Road",
    description: "Multiple 8-inch deep potholes formed following heavy rain. Two two-wheeler skids occurred yesterday.",
    location: "Amity Campus Link Road, Km Stone 4",
    createdAt: baseTime + 28800,
  };
  const g3Hash = computeGrievanceContentHash(g3Payload);

  const g4Payload = {
    title: "Overflowing Open Solid Waste Container",
    department: Department.Sanitation,
    category: "Overflowing Garbage Dumpster",
    description: "Municipal container has not been cleared for 6 days. Foul odor spreading into nearby primary school compound.",
    location: "Ward 12, Behind Civil Hospital",
    createdAt: baseTime + 43200,
  };
  const g4Hash = computeGrievanceContentHash(g4Payload);

  const grievances: GrievanceRecord[] = [
    {
      id: 1,
      trackingCode: "GRV-2026-1001",
      citizenName: "Ramesh Sharma",
      citizenAddress: HARDHAT_CITIZEN_ACCOUNT,
      isAnonymous: false,
      department: Department.WaterSupply,
      category: g1Payload.category,
      title: g1Payload.title,
      description: g1Payload.description,
      location: g1Payload.location,
      urgency: "High",
      contentHash: g1Hash,
      currentStatus: GrievanceStatus.Resolved,
      createdAt: g1Payload.createdAt,
      updatedAt: baseTime + 36000,
      resolvedAt: baseTime + 36000,
      txHash: "0x8fa134d1bc945674e47a98a63dc0b4d4b1a4574971c5ef9db62f84bf8e719c12",
      blockNumber: 104,
      gasUsed: 114820,
      statusHistory: [
        {
          status: GrievanceStatus.Submitted,
          updatedBy: HARDHAT_CITIZEN_ACCOUNT,
          remarks: "Grievance submitted by citizen and sealed onto blockchain.",
          timestamp: g1Payload.createdAt,
        },
        {
          status: GrievanceStatus.UnderReview,
          updatedBy: HARDHAT_OFFICER_ACCOUNT,
          remarks: "Water Works Inspection Team dispatched to verify main valve shutdown.",
          timestamp: baseTime + 5400,
        },
        {
          status: GrievanceStatus.InProgress,
          updatedBy: HARDHAT_OFFICER_ACCOUNT,
          remarks: "Excavation completed, replacement 150mm ductile iron pipe section being welded.",
          timestamp: baseTime + 18000,
        },
        {
          status: GrievanceStatus.Resolved,
          updatedBy: HARDHAT_OFFICER_ACCOUNT,
          remarks: "Pipe repaired, pressure tested at 4.5 bar, and asphalt reinstatement scheduled. Supply restored.",
          timestamp: baseTime + 36000,
        },
      ],
    },
    {
      id: 2,
      trackingCode: "GRV-2026-1002",
      citizenName: "Anonymous Citizen",
      citizenAddress: "0x0000000000000000000000000000000000000000",
      isAnonymous: true,
      department: Department.Electricity,
      category: g2Payload.category,
      title: g2Payload.title,
      description: g2Payload.description,
      location: g2Payload.location,
      urgency: "Emergency",
      contentHash: g2Hash,
      currentStatus: GrievanceStatus.InProgress,
      createdAt: g2Payload.createdAt,
      updatedAt: baseTime + 22000,
      txHash: "0x3e89a5d1fc42b08a9c2936279f01bc49a7102e3b2e5971a8bc8f9b972e34fa91",
      blockNumber: 105,
      gasUsed: 116240,
      statusHistory: [
        {
          status: GrievanceStatus.Submitted,
          updatedBy: HARDHAT_CITIZEN_ACCOUNT,
          remarks: "Anonymous grievance recorded with cryptographic zero-knowledge citizen seal.",
          timestamp: g2Payload.createdAt,
        },
        {
          status: GrievanceStatus.UnderReview,
          updatedBy: HARDHAT_OFFICER_ACCOUNT,
          remarks: "Lineman assigned for high-voltage insulation and thermal inspection.",
          timestamp: baseTime + 16000,
        },
        {
          status: GrievanceStatus.InProgress,
          updatedBy: HARDHAT_OFFICER_ACCOUNT,
          remarks: "Faulty lightning arrestor isolated; capacitor bank replacement in progress.",
          timestamp: baseTime + 22000,
        },
      ],
    },
    {
      id: 3,
      trackingCode: "GRV-2026-1003",
      citizenName: "Pooja Verma",
      citizenAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      isAnonymous: false,
      department: Department.Roads,
      category: g3Payload.category,
      title: g3Payload.title,
      description: g3Payload.description,
      location: g3Payload.location,
      urgency: "High",
      contentHash: g3Hash,
      currentStatus: GrievanceStatus.UnderReview,
      createdAt: g3Payload.createdAt,
      updatedAt: baseTime + 32000,
      txHash: "0x91b2c45e7f10a8d3e629341ba081fca9471b028c31e97491ba90d47e1bc89a74",
      blockNumber: 106,
      gasUsed: 113900,
      statusHistory: [
        {
          status: GrievanceStatus.Submitted,
          updatedBy: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
          remarks: "Grievance submitted by citizen and sealed onto blockchain.",
          timestamp: g3Payload.createdAt,
        },
        {
          status: GrievanceStatus.UnderReview,
          updatedBy: HARDHAT_ADMIN_ACCOUNT,
          remarks: "Forwarded to Public Works Department (PWD) Division II for on-site assessment.",
          timestamp: baseTime + 32000,
        },
      ],
    },
    {
      id: 4,
      trackingCode: "GRV-2026-1004",
      citizenName: "Amitabh Sen",
      citizenAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
      isAnonymous: false,
      department: Department.Sanitation,
      category: g4Payload.category,
      title: g4Payload.title,
      description: g4Payload.description,
      location: g4Payload.location,
      urgency: "Medium",
      contentHash: g4Hash,
      currentStatus: GrievanceStatus.Submitted,
      createdAt: g4Payload.createdAt,
      updatedAt: g4Payload.createdAt,
      txHash: "0x5d41a8e9f02b3c4d719a6284b108e493a71b9c2049d5678a1bc8f9b972e41a98",
      blockNumber: 107,
      gasUsed: 112450,
      statusHistory: [
        {
          status: GrievanceStatus.Submitted,
          updatedBy: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
          remarks: "Grievance submitted by citizen and sealed onto blockchain.",
          timestamp: g4Payload.createdAt,
        },
      ],
    },
  ];

  const blocks: MinedBlock[] = [
    {
      blockNumber: 104,
      timestamp: baseTime + 1200,
      miner: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      previousHash: "0x0a194fc28b5e67d98129034afec194e82b79140ab1293c8ef71940bca81920ef",
      blockHash: "0xd8394afec9102b48a719c82b3d90471b029348acf819023bd719284ba9108c4e",
      txCount: 1,
      gasUsed: 114820,
      transactions: [grievances[0].txHash],
    },
    {
      blockNumber: 105,
      timestamp: baseTime + 14400,
      miner: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      previousHash: "0xd8394afec9102b48a719c82b3d90471b029348acf819023bd719284ba9108c4e",
      blockHash: "0x4e8920bc9184ba71029348afc8109284bc719023bd8192840ba9108e4719208a",
      txCount: 1,
      gasUsed: 116240,
      transactions: [grievances[1].txHash],
    },
    {
      blockNumber: 106,
      timestamp: baseTime + 28800,
      miner: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      previousHash: "0x4e8920bc9184ba71029348afc8109284bc719023bd8192840ba9108e4719208a",
      blockHash: "0x7a9108bc4e8920ba71029348afc8109284bc719023bd8192840ba9108e471920",
      txCount: 1,
      gasUsed: 113900,
      transactions: [grievances[2].txHash],
    },
    {
      blockNumber: 107,
      timestamp: baseTime + 43200,
      miner: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      previousHash: "0x7a9108bc4e8920ba71029348afc8109284bc719023bd8192840ba9108e471920",
      blockHash: "0x9c4108e4719208a7a9108bc4e8920ba71029348afc8109284bc719023bd81928",
      txCount: 1,
      gasUsed: 112450,
      transactions: [grievances[3].txHash],
    },
  ];

  const transactions: BlockchainTransaction[] = [
    {
      hash: grievances[0].txHash,
      blockNumber: 104,
      from: HARDHAT_CITIZEN_ACCOUNT,
      to: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      action: "registerGrievance",
      trackingCode: grievances[0].trackingCode,
      status: "Confirmed",
      timestamp: grievances[0].createdAt,
      gasUsed: 114820,
      inputDataSummary: `registerGrievance("${grievances[0].trackingCode}", Dept: WaterSupply, ContentHash: ${grievances[0].contentHash.slice(0, 10)}...)`,
    },
    {
      hash: grievances[1].txHash,
      blockNumber: 105,
      from: HARDHAT_CITIZEN_ACCOUNT,
      to: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      action: "registerGrievance",
      trackingCode: grievances[1].trackingCode,
      status: "Confirmed",
      timestamp: grievances[1].createdAt,
      gasUsed: 116240,
      inputDataSummary: `registerGrievance("${grievances[1].trackingCode}", Dept: Electricity, Anonymous: true)`,
    },
    {
      hash: grievances[2].txHash,
      blockNumber: 106,
      from: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      to: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      action: "registerGrievance",
      trackingCode: grievances[2].trackingCode,
      status: "Confirmed",
      timestamp: grievances[2].createdAt,
      gasUsed: 113900,
      inputDataSummary: `registerGrievance("${grievances[2].trackingCode}", Dept: Roads, ContentHash: ${grievances[2].contentHash.slice(0, 10)}...)`,
    },
    {
      hash: grievances[3].txHash,
      blockNumber: 107,
      from: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
      to: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      action: "registerGrievance",
      trackingCode: grievances[3].trackingCode,
      status: "Confirmed",
      timestamp: grievances[3].createdAt,
      gasUsed: 112450,
      inputDataSummary: `registerGrievance("${grievances[3].trackingCode}", Dept: Sanitation, ContentHash: ${grievances[3].contentHash.slice(0, 10)}...)`,
    },
  ];

  return { grievances, blocks, transactions };
}

export class SimulatedBlockchain {
  private grievances: GrievanceRecord[] = [];
  private blocks: MinedBlock[] = [];
  private transactions: BlockchainTransaction[] = [];
  private roles: RoleConfig = {
    admin: HARDHAT_ADMIN_ACCOUNT,
    officers: {
      [HARDHAT_OFFICER_ACCOUNT.toLowerCase()]: { authorized: true, scope: 0 },
    },
    demoMode: true,
  };

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const savedGrievances = localStorage.getItem(STORAGE_KEY_GRIEVANCES);
      const savedBlocks = localStorage.getItem(STORAGE_KEY_BLOCKS);
      const savedTxs = localStorage.getItem(STORAGE_KEY_TXS);
      const savedRoles = localStorage.getItem(STORAGE_KEY_ROLES);

      if (savedGrievances && savedBlocks && savedTxs) {
        this.grievances = JSON.parse(savedGrievances);
        this.blocks = JSON.parse(savedBlocks);
        this.transactions = JSON.parse(savedTxs);
        if (savedRoles) this.roles = JSON.parse(savedRoles);
      } else {
        const seed = getInitialSeedData();
        this.grievances = seed.grievances;
        this.blocks = seed.blocks;
        this.transactions = seed.transactions;
        this.persistState();
      }
    } catch {
      const seed = getInitialSeedData();
      this.grievances = seed.grievances;
      this.blocks = seed.blocks;
      this.transactions = seed.transactions;
    }
  }

  private persistState(): void {
    try {
      localStorage.setItem(STORAGE_KEY_GRIEVANCES, JSON.stringify(this.grievances));
      localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(this.blocks));
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(this.roles));
    } catch {
      // ignore storage quota issues
    }
  }

  public resetToDefaultSeed(): void {
    localStorage.removeItem(STORAGE_KEY_GRIEVANCES);
    localStorage.removeItem(STORAGE_KEY_BLOCKS);
    localStorage.removeItem(STORAGE_KEY_TXS);
    localStorage.removeItem(STORAGE_KEY_ROLES);
    const seed = getInitialSeedData();
    this.grievances = seed.grievances;
    this.blocks = seed.blocks;
    this.transactions = seed.transactions;
    this.persistState();
  }

  public getAllGrievances(): GrievanceRecord[] {
    return [...this.grievances];
  }

  public getGrievanceByTrackingCode(trackingCode: string): GrievanceRecord | null {
    const trimmed = trackingCode.trim().toUpperCase();
    return this.grievances.find((g) => g.trackingCode.toUpperCase() === trimmed) || null;
  }

  public getGrievanceById(id: number): GrievanceRecord | null {
    return this.grievances.find((g) => g.id === id) || null;
  }

  public getBlocks(): MinedBlock[] {
    return [...this.blocks];
  }

  public getTransactions(): BlockchainTransaction[] {
    return [...this.transactions];
  }

  public getLatestBlockNumber(): number {
    return this.blocks.length > 0 ? this.blocks[this.blocks.length - 1].blockNumber : 100;
  }

  public checkOfficerRole(account: string, department: Department): { isAuthorized: boolean; reason?: string } {
    const lower = account.toLowerCase();
    const isAdmin = lower === this.roles.admin.toLowerCase();
    if (isAdmin) return { isAuthorized: true };

    if (this.roles.demoMode) return { isAuthorized: true };

    const officer = this.roles.officers[lower];
    if (!officer || !officer.authorized) {
      return { isAuthorized: false, reason: "Account is not an authorized department officer or admin." };
    }

    if (officer.scope !== 0 && officer.scope !== (department + 1)) {
      return { isAuthorized: false, reason: "Officer not authorized for this specific department." };
    }

    return { isAuthorized: true };
  }

  public authorizeOfficer(officerAddress: string, departmentScope: number): void {
    this.roles.officers[officerAddress.toLowerCase()] = {
      authorized: true,
      scope: departmentScope,
    };
    this.persistState();
  }

  public revokeOfficer(officerAddress: string): void {
    if (this.roles.officers[officerAddress.toLowerCase()]) {
      this.roles.officers[officerAddress.toLowerCase()].authorized = false;
      this.persistState();
    }
  }

  public setDemoMode(enabled: boolean): void {
    this.roles.demoMode = enabled;
    this.persistState();
  }

  public getDemoMode(): boolean {
    return this.roles.demoMode;
  }

  /**
   * Registers a new grievance on-chain with simulated block mining and Keccak256 seal.
   */
  public registerGrievance(data: {
    citizenName?: string;
    citizenAddress: string;
    isAnonymous: boolean;
    department: Department;
    category: string;
    title: string;
    description: string;
    location?: string;
    urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  }): { grievance: GrievanceRecord; block: MinedBlock; tx: BlockchainTransaction } {
    const now = Math.floor(Date.now() / 1000);
    const newId = this.grievances.length + 1;
    
    // Generate authentic tracking code like GRV-2026-1049
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `GRV-2026-${randomSuffix}`;

    // Cryptographic Keccak-256 seal
    const contentHash = computeGrievanceContentHash({
      title: data.title,
      department: data.department,
      category: data.category,
      description: data.description,
      location: data.location,
      createdAt: now,
    });

    // Realistic EVM tx hash and block mining
    const prevBlock = this.blocks[this.blocks.length - 1];
    const newBlockNumber = prevBlock ? prevBlock.blockNumber + 1 : 108;
    const txHash = keccak256(toUtf8Bytes(`${trackingCode}|${now}|${newBlockNumber}|${Math.random()}`));
    const blockHash = keccak256(toUtf8Bytes(`${newBlockNumber}|${txHash}|${prevBlock?.blockHash || ""}`));
    const gasUsed = 112000 + Math.floor(Math.random() * 6000);

    const initialLog: StatusLog = {
      status: GrievanceStatus.Submitted,
      updatedBy: data.isAnonymous ? "0x0000000000000000000000000000000000000000" : data.citizenAddress,
      remarks: "Grievance submitted by citizen and sealed onto blockchain.",
      timestamp: now,
    };

    const newRecord: GrievanceRecord = {
      id: newId,
      trackingCode,
      citizenName: data.isAnonymous ? "Anonymous Citizen" : (data.citizenName || "Concerned Citizen"),
      citizenAddress: data.isAnonymous ? "0x0000000000000000000000000000000000000000" : data.citizenAddress,
      isAnonymous: data.isAnonymous,
      department: data.department,
      category: data.category,
      title: data.title,
      description: data.description,
      location: data.location || "Unspecified Ward Area",
      urgency: data.urgency,
      contentHash,
      currentStatus: GrievanceStatus.Submitted,
      createdAt: now,
      updatedAt: now,
      txHash,
      blockNumber: newBlockNumber,
      gasUsed,
      statusHistory: [initialLog],
    };

    const tx: BlockchainTransaction = {
      hash: txHash,
      blockNumber: newBlockNumber,
      from: data.citizenAddress,
      to: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      action: "registerGrievance",
      trackingCode,
      status: "Confirmed",
      timestamp: now,
      gasUsed,
      inputDataSummary: `registerGrievance("${trackingCode}", Dept: ${data.department}, Hash: ${contentHash.slice(0, 10)}...)`,
    };

    const block: MinedBlock = {
      blockNumber: newBlockNumber,
      timestamp: now,
      miner: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      previousHash: prevBlock ? prevBlock.blockHash : "0x0",
      blockHash,
      txCount: 1,
      gasUsed,
      transactions: [txHash],
    };

    this.grievances.unshift(newRecord);
    this.transactions.unshift(tx);
    this.blocks.push(block);
    this.persistState();

    return { grievance: newRecord, block, tx };
  }

  /**
   * Updates grievance status by authorized officer
   */
  public updateGrievanceStatus(params: {
    id: number;
    newStatus: GrievanceStatus;
    remarks: string;
    officerAddress: string;
  }): { success: boolean; record?: GrievanceRecord; error?: string } {
    const record = this.grievances.find((g) => g.id === params.id);
    if (!record) {
      return { success: false, error: "Grievance ID not found" };
    }

    if (record.currentStatus === params.newStatus) {
      return { success: false, error: "New status must differ from current status" };
    }

    const roleCheck = this.checkOfficerRole(params.officerAddress, record.department);
    if (!roleCheck.isAuthorized) {
      return { success: false, error: roleCheck.reason || "Unauthorized" };
    }

    const now = Math.floor(Date.now() / 1000);
    const prevBlock = this.blocks[this.blocks.length - 1];
    const newBlockNumber = prevBlock ? prevBlock.blockNumber + 1 : 109;
    const txHash = keccak256(toUtf8Bytes(`UPDATE|${record.trackingCode}|${params.newStatus}|${now}`));
    const blockHash = keccak256(toUtf8Bytes(`${newBlockNumber}|${txHash}|${prevBlock?.blockHash || ""}`));
    const gasUsed = 42100 + Math.floor(Math.random() * 2000);

    const log: StatusLog = {
      status: params.newStatus,
      updatedBy: params.officerAddress,
      remarks: params.remarks,
      timestamp: now,
    };

    record.currentStatus = params.newStatus;
    record.updatedAt = now;
    if (params.newStatus === GrievanceStatus.Resolved) {
      record.resolvedAt = now;
    }
    record.statusHistory.push(log);

    const tx: BlockchainTransaction = {
      hash: txHash,
      blockNumber: newBlockNumber,
      from: params.officerAddress,
      to: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      action: "updateGrievanceStatus",
      trackingCode: record.trackingCode,
      status: "Confirmed",
      timestamp: now,
      gasUsed,
      inputDataSummary: `updateGrievanceStatus(Id: ${record.id}, NewStatus: ${params.newStatus}, Officer: ${params.officerAddress.slice(0, 8)}...)`,
    };

    const block: MinedBlock = {
      blockNumber: newBlockNumber,
      timestamp: now,
      miner: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      previousHash: prevBlock ? prevBlock.blockHash : "0x0",
      blockHash,
      txCount: 1,
      gasUsed,
      transactions: [txHash],
    };

    this.transactions.unshift(tx);
    this.blocks.push(block);
    this.persistState();

    return { success: true, record };
  }

  /**
   * For student demonstrations: simulate a tamper attack on the off-chain description
   * to prove that verifyIntegrity catches it!
   */
  public simulateTamperGrievance(id: number, tamperedDescription: string): boolean {
    const record = this.grievances.find((g) => g.id === id);
    if (!record) return false;
    record.description = tamperedDescription;
    this.persistState();
    return true;
  }
}

export const simulatedBlockchain = new SimulatedBlockchain();
