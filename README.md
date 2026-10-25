# GrievanceChain — Blockchain-Based Public Grievance Tracking System

> **A Decentralized, Tamper-Evident Public Grievance Redressal Architecture on Ethereum (EVM)**  
> **Academic Project:** Case Study Topic 26  
> **Student:** Anushka Tomar  
> **Course & Section:** Bachelor of Technology (Information Technology), Section A  
> **Institution:** Amity University Madhya Pradesh  
> **Academic Session:** 2026–2027  

---

## 1. Project Introduction & Objectives

In modern municipal governance, effective public grievance redressal is a cornerstone of citizen satisfaction and municipal accountability. Traditional centralized portals (built on conventional SQL databases) suffer from lack of transparency, susceptibility to arbitrary status updates without proof of physical resolution, and vulnerability to silent record manipulation or deletion.

### Core Objectives:
1. **Decentralized Single Source of Truth:** Deploy an immutable smart contract (`GrievanceRegistry.sol`) on an Ethereum Virtual Machine (EVM) network that cryptographically timestamps every submitted grievance.
2. **Cryptographic Tamper-Evidence:** Generate deterministic Keccak-256 content digests for all complaint fields (Title, Category, Description, Location, Timestamp) so any retroactive modification of off-chain records is immediately detected.
3. **Role-Based Access Control (RBAC):** Restrict status transitions (`Submitted` -> `Under Review` -> `In Progress` -> `Resolved` / `Rejected`) strictly to authorized departmental officers or the system administrator.
4. **Citizen Auditability:** Empower citizens to independently verify their complaint's lifecycle, inspecting transaction receipts, block heights, and the responsible officer's wallet address.
5. **Privacy by Design:** Keep sensitive personal contact information off-chain while allowing optional fully anonymous whistleblower submissions.

---

## 2. Why Blockchain is Suitable

| Evaluation Dimension | Traditional Centralized Web Portal | GrievanceChain (Blockchain Architecture) |
| :--- | :--- | :--- |
| **Data Integrity** | Vulnerable to SQL injection, DBA alteration, or silent deletion | Append-only cryptographically linked blocks; zero retroactive tampering |
| **Accountability** | Status can be updated by arbitrary internal scripts or cron jobs | Every state transition requires a signed transaction with the officer's wallet |
| **Verification** | Citizen must trust the municipal department's word | Mathematical proof via Keccak-256 digest recalculation against on-chain hash |
| **Whistleblower Privacy** | IP and personal details logged in server tables | Supports anonymous submissions where citizen wallet is masked or zero-address |

---

## 3. System Architecture & Components

```
+-----------------------------------------------------------------------------------+
|                               CITIZEN INTERFACE                                   |
|   (React 19 + TypeScript + Vite + Tailwind CSS Dark Navy & Teal Theme)            |
+-----------------------------------------------------------------------------------+
       |                                                    ^
       | 1. Form Input + Keccak-256 Digest Computation       | 5. Real-Time Tracking
       v                                                    |    & Tamper Verification
+-----------------------------------------------------------------------------------+
|                           WEB3 CLIENT LAYER (Ethers.js v6)                        |
|   - Provider / Signer Management                                                  |
|   - MetaMask EIP-1193 / EIP-3085 Auto-Switch (Chain ID 31337)                    |
|   - Fallback to Built-in In-Browser Hardhat Simulation Node                       |
+-----------------------------------------------------------------------------------+
       |                                                    ^
       | 2. eth_sendTransaction (JSON-RPC)                  | 4. Contract State & Events
       v                                                    |
+-----------------------------------------------------------------------------------+
|                   SOLIDITY SMART CONTRACT (GrievanceRegistry.sol)                  |
|   - registerGrievance() -> Generates unique GRV-2026-XXXX tracking code          |
|   - updateGrievanceStatus() -> Gated by onlyAuthorizedOfficer modifier           |
|   - verifyIntegrity() -> Byte-level hash matching                                 |
|   - Full StatusLog history array + EVM Events                                     |
+-----------------------------------------------------------------------------------+
       |
       v
+-----------------------------------------------------------------------------------+
|                        ETHEREUM BLOCKCHAIN (Hardhat EVM)                          |
|   - Block Height Mining & Gas Metering (~114k gas per filing)                     |
|   - SHA-3 Block Headers & Merkle Root Finality                                    |
+-----------------------------------------------------------------------------------+
```

---

## 4. Smart Contract Design (`contracts/GrievanceRegistry.sol`)

- **Solidity Version:** `^0.8.20`
- **Compiler Configuration:** IR-based compilation (`viaIR: true`) with 200 optimization runs.
- **Data Structures:**
  - `enum Status { Submitted, UnderReview, InProgress, Resolved, Rejected }`
  - `enum Department { WaterSupply, Electricity, Roads, Sanitation, PublicSafety, Other }`
  - `struct StatusLog { Status status; address updatedBy; string remarks; uint256 timestamp; }`
  - `struct Grievance { uint256 id; string trackingCode; address citizen; Department department; string category; bytes32 contentHash; Status currentStatus; uint256 createdAt; uint256 updatedAt; uint256 resolvedAt; bool exists; }`

---

## 5. Quickstart & Installation Instructions

### Prerequisites:
- Node.js >= 18.x
- npm >= 9.x
- (Optional) MetaMask browser extension

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Compile Solidity Contracts with Hardhat
```bash
npm run compile:contracts
```
*Output: `Compiled 1 Solidity file with solc 0.8.20 (evm target: shanghai)`*

### Step 3: Run Automated Unit Tests
```bash
npm run test:contracts
```
*Executes all assertions: ABI compliance, Keccak-256 digest creation, validation, RBAC rejection, and tamper checks.*

### Step 4: Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 6. Local Hardhat Node & MetaMask Configuration

To test with a live standalone Hardhat blockchain node:
1. In a terminal, launch the local node:
   ```bash
   npx hardhat node
   ```
2. In a second terminal, deploy the smart contract:
   ```bash
   npm run deploy:contracts
   ```
3. Open MetaMask -> **Add a Network Manually**:
   - **Network Name:** Hardhat Localhost
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
4. Import Hardhat Account #0 (Admin) private key:
   `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
5. Connect your wallet in the application via the **"Connect MetaMask"** button in the top navigation!

---

## 7. Automated Test Suite Matrix

| Test ID | Test Name | Target Assertion | Result |
| :--- | :--- | :--- | :--- |
| **TEST-01** | Interface Compliance | GrievanceRegistry ABI exposes all 16 required entrypoints | **PASSED** |
| **TEST-02** | Cryptographic Digest | Keccak-256 generates a valid 32-byte hexadecimal hash | **PASSED** |
| **TEST-03** | Input Validation | Contract rejects empty titles and duplicate tracking codes | **PASSED** |
| **TEST-04** | Role-Based Access | Reverts with unauthorized error when citizen attempts status change | **PASSED** |
| **TEST-05** | State Lifecycle | Enforces valid transitions and rejects identical status loops | **PASSED** |
| **TEST-06** | Tamper Detection | 1-character discrepancy in off-chain content fails `verifyIntegrity` | **PASSED** |

---

## 8. Limitations & Future Scope
1. **Decentralized Media Storage (IPFS):** Integration with Pinata/IPFS for photographic and video evidence attachments.
2. **Zero-Knowledge Proofs (zk-SNARKs):** Enable citizens to prove residency in a specific ward without revealing their residential address.
3. **Automated Escalation Oracles (Chainlink):** If an urgent grievance remains in `Submitted` status past 72 hours, an automated oracle escalates the priority to the municipal commissioner's dashboard.

---

## 9. Academic Project Submission Details
- **Student Name:** Anushka Tomar
- **Enrollment / Course:** B.Tech Information Technology (Section A)
- **Institution:** Amity University Madhya Pradesh
- **Session:** 2026–2027
- **Case Study:** Topic 26 — Blockchain-Based Public Grievance Tracking
