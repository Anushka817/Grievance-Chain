export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_CHAIN_NAME = "Hardhat Localhost";
export const HARDHAT_DEFAULT_RPC = "http://127.0.0.1:8545";
export const DEFAULT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const GRIEVANCE_REGISTRY_ABI = [
  "constructor()",
  "event GrievanceSubmitted(uint256 indexed grievanceId, string trackingCode, address indexed citizen, uint8 indexed department, bytes32 contentHash, uint256 timestamp)",
  "event GrievanceStatusUpdated(uint256 indexed grievanceId, string trackingCode, uint8 previousStatus, uint8 newStatus, address indexed updatedBy, string remarks, uint256 timestamp)",
  "event OfficerAuthorized(address indexed officer, uint8 departmentScope, address indexed authorizedBy)",
  "event OfficerRevoked(address indexed officer, address indexed revokedBy)",
  "event AdminTransferred(address indexed previousAdmin, address indexed newAdmin)",
  "event DemoModeToggled(bool enabled, address indexed toggledBy)",
  
  "function admin() external view returns (address)",
  "function grievanceCount() external view returns (uint256)",
  "function demoModeEnabled() external view returns (bool)",
  "function authorizedOfficers(address) external view returns (bool)",
  "function officerDepartmentScope(address) external view returns (uint8)",
  
  "function setDemoMode(bool _enabled) external",
  "function transferAdmin(address _newAdmin) external",
  "function authorizeOfficer(address _officer, uint8 _departmentScope) external",
  "function revokeOfficer(address _officer) external",
  "function isOfficer(address _account) external view returns (bool authorized, uint8 departmentScope)",
  
  "function registerGrievance(string calldata _trackingCode, uint8 _department, string calldata _category, bytes32 _contentHash, bool _isAnonymous) external returns (uint256)",
  "function updateGrievanceStatus(uint256 _id, uint8 _newStatus, string calldata _remarks) external",
  
  "function getGrievance(uint256 _id) external view returns (tuple(uint256 id, string trackingCode, address citizen, uint8 department, string category, bytes32 contentHash, uint8 currentStatus, uint256 createdAt, uint256 updatedAt, uint256 resolvedAt, bool exists))",
  "function getGrievanceByTrackingCode(string calldata _trackingCode) external view returns (tuple(uint256 id, string trackingCode, address citizen, uint8 department, string category, bytes32 contentHash, uint8 currentStatus, uint256 createdAt, uint256 updatedAt, uint256 resolvedAt, bool exists))",
  "function getStatusHistory(uint256 _id) external view returns (tuple(uint8 status, address updatedBy, string remarks, uint256 timestamp)[])",
  "function verifyIntegrity(uint256 _id, bytes32 _computedHash) external view returns (bool isValid)"
];

export const DEPARTMENT_NAMES: Record<number, string> = {
  0: "Water Supply",
  1: "Electricity",
  2: "Roads & Infrastructure",
  3: "Sanitation & Waste Management",
  4: "Public Safety & Civil",
  5: "Other Public Services",
};

export const DEPARTMENT_CATEGORIES: Record<number, string[]> = {
  0: [
    "Contaminated / Unsafe Tap Water",
    "Pipeline Leakage or Burst Pipe",
    "Low Water Pressure in Distribution",
    "Irregular Municipal Water Supply Timing",
    "Billing Discrepancy / Water Meter Fault",
  ],
  1: [
    "Unannounced Power Cut / Outage",
    "Damaged Transformer / Sparks",
    "Low / High Voltage Fluctuations",
    "Hanging / Exposed Live Electrical Wires",
    "Defective Electric Meter Reading",
  ],
  2: [
    "Hazardous Potholes on Main Road",
    "Broken Pavement / Missing Manhole Cover",
    "Non-Functional Streetlights at Night",
    "Incomplete Road Construction",
    "Waterlogging Due to Poor Gradient",
  ],
  3: [
    "Overflowing Garbage Dumpster",
    "Non-Collection of Household Waste",
    "Choked Open Drainage Line / Sewer Overflow",
    "Stagnant Sewage Causing Pest Outbreak",
    "Dead Animal Removal Request",
  ],
  4: [
    "Malfunctioning Traffic Signals",
    "Encroachment on Pedestrian Footpaths",
    "Absence of Security Patrols",
    "Illegal Parking Blocking Emergency Exit",
    "Public Nuisance / Stray Cattle Hazards",
  ],
  5: [
    "Public Park Maintenance / Broken Equipment",
    "Government Community Center Facilities",
    "Public Transport Shelter Damages",
    "Tree Trimming Blocking Visual Signage",
    "General Public Grievance",
  ],
};

export const STATUS_LABELS: Record<number, { label: string; color: string; bg: string; border: string }> = {
  0: { label: "Submitted", color: "text-amber-300", bg: "bg-amber-950/40", border: "border-amber-700/50" },
  1: { label: "Under Review", color: "text-blue-300", bg: "bg-blue-950/40", border: "border-blue-700/50" },
  2: { label: "In Progress", color: "text-cyan-300", bg: "bg-cyan-950/40", border: "border-cyan-700/50" },
  3: { label: "Resolved", color: "text-emerald-300", bg: "bg-emerald-950/40", border: "border-emerald-700/50" },
  4: { label: "Rejected", color: "text-rose-300", bg: "bg-rose-950/40", border: "border-rose-700/50" },
};
