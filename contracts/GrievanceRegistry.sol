// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GrievanceRegistry
 * @dev Decentralized Public Grievance Tracking System
 * Student: Anushka Tomar | B.Tech IT Section A | Amity University Madhya Pradesh
 * Academic Session: 2026-2027 | Case Study 26
 * 
 * Provides transparent, tamper-evident recording of citizen complaints,
 * cryptographic content hash verification, status audit trails, and role-based department access.
 */
contract GrievanceRegistry {
    // --- Enums ---
    enum Status {
        Submitted,      // 0
        UnderReview,    // 1
        InProgress,     // 2
        Resolved,       // 3
        Rejected        // 4
    }

    enum Department {
        WaterSupply,    // 0
        Electricity,    // 1
        Roads,          // 2
        Sanitation,     // 3
        PublicSafety,   // 4
        Other           // 5
    }

    // --- Structs ---
    struct StatusLog {
        Status status;
        address updatedBy;
        string remarks;
        uint256 timestamp;
    }

    struct Grievance {
        uint256 id;
        string trackingCode;
        address citizen;          // citizen wallet or address(0) if anonymous
        Department department;
        string category;
        bytes32 contentHash;      // Keccak256 hash of complaint content
        Status currentStatus;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 resolvedAt;
        bool exists;
    }

    // --- State Variables ---
    address public admin;
    uint256 public grievanceCount;
    bool public demoModeEnabled; // Allows students / examiners to test officer actions in demo environment

    // Role-based access control
    mapping(address => bool) public authorizedOfficers;
    // 0 = all departments, 1..6 = Department enum + 1
    mapping(address => uint8) public officerDepartmentScope;

    mapping(uint256 => Grievance) public grievances;
    mapping(string => uint256) public trackingCodeToId;
    mapping(uint256 => StatusLog[]) private grievanceHistory;

    // --- Events ---
    event GrievanceSubmitted(
        uint256 indexed grievanceId,
        string trackingCode,
        address indexed citizen,
        Department indexed department,
        bytes32 contentHash,
        uint256 timestamp
    );

    event GrievanceStatusUpdated(
        uint256 indexed grievanceId,
        string trackingCode,
        Status previousStatus,
        Status newStatus,
        address indexed updatedBy,
        string remarks,
        uint256 timestamp
    );

    event OfficerAuthorized(address indexed officer, uint8 departmentScope, address indexed authorizedBy);
    event OfficerRevoked(address indexed officer, address indexed revokedBy);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    event DemoModeToggled(bool enabled, address indexed toggledBy);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "GrievanceRegistry: Caller is not the system administrator");
        _;
    }

    modifier onlyAuthorizedOfficer(Department _dept) {
        bool isDirectAdmin = (msg.sender == admin);
        bool isAuthOfficer = authorizedOfficers[msg.sender];
        uint8 scope = officerDepartmentScope[msg.sender];
        bool deptMatches = (scope == 0 || scope == (uint8(_dept) + 1));

        require(
            isDirectAdmin || (isAuthOfficer && deptMatches) || demoModeEnabled,
            "GrievanceRegistry: Unauthorized. Requires Department Officer or Admin privileges"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedOfficers[msg.sender] = true;
        officerDepartmentScope[msg.sender] = 0; // all departments
        demoModeEnabled = true; // Enabled by default for educational testbed
    }

    // --- Admin Management ---
    function setDemoMode(bool _enabled) external onlyAdmin {
        demoModeEnabled = _enabled;
        emit DemoModeToggled(_enabled, msg.sender);
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "GrievanceRegistry: Invalid address");
        address prev = admin;
        admin = _newAdmin;
        authorizedOfficers[_newAdmin] = true;
        officerDepartmentScope[_newAdmin] = 0;
        emit AdminTransferred(prev, _newAdmin);
    }

    function authorizeOfficer(address _officer, uint8 _departmentScope) external onlyAdmin {
        require(_officer != address(0), "GrievanceRegistry: Invalid officer address");
        require(_departmentScope <= 6, "GrievanceRegistry: Invalid department scope");
        authorizedOfficers[_officer] = true;
        officerDepartmentScope[_officer] = _departmentScope;
        emit OfficerAuthorized(_officer, _departmentScope, msg.sender);
    }

    function revokeOfficer(address _officer) external onlyAdmin {
        require(_officer != admin, "GrievanceRegistry: Cannot revoke main administrator");
        authorizedOfficers[_officer] = false;
        officerDepartmentScope[_officer] = 0;
        emit OfficerRevoked(_officer, msg.sender);
    }

    function isOfficer(address _account) external view returns (bool authorized, uint8 departmentScope) {
        if (_account == admin) {
            return (true, 0);
        }
        return (authorizedOfficers[_account], officerDepartmentScope[_account]);
    }

    // --- Core Grievance Lifecycle ---

    /**
     * @notice Registers a new citizen grievance on-chain
     * @param _trackingCode Unique identifier (e.g. GRV-2026-XXXX)
     * @param _department Department enum
     * @param _category Complaint category string
     * @param _contentHash Keccak256 hash of off-chain complaint content
     * @param _isAnonymous Whether citizen requested anonymity
     */
    function registerGrievance(
        string calldata _trackingCode,
        Department _department,
        string calldata _category,
        bytes32 _contentHash,
        bool _isAnonymous
    ) external returns (uint256) {
        require(bytes(_trackingCode).length > 0, "GrievanceRegistry: Tracking code required");
        require(trackingCodeToId[_trackingCode] == 0, "GrievanceRegistry: Tracking code already exists");
        require(_contentHash != bytes32(0), "GrievanceRegistry: Content hash cannot be empty");
        require(bytes(_category).length > 0, "GrievanceRegistry: Category cannot be empty");
        require(uint8(_department) <= uint8(Department.Other), "GrievanceRegistry: Invalid department");

        grievanceCount++;
        uint256 newId = grievanceCount;

        address citizenAddress = _isAnonymous ? address(0) : msg.sender;

        Grievance storage g = grievances[newId];
        g.id = newId;
        g.trackingCode = _trackingCode;
        g.citizen = citizenAddress;
        g.department = _department;
        g.category = _category;
        g.contentHash = _contentHash;
        g.currentStatus = Status.Submitted;
        g.createdAt = block.timestamp;
        g.updatedAt = block.timestamp;
        g.resolvedAt = 0;
        g.exists = true;

        trackingCodeToId[_trackingCode] = newId;

        // Record initial status entry in history
        grievanceHistory[newId].push(StatusLog({
            status: Status.Submitted,
            updatedBy: msg.sender,
            remarks: "Grievance submitted by citizen and sealed onto blockchain.",
            timestamp: block.timestamp
        }));

        emit GrievanceSubmitted(
            newId,
            _trackingCode,
            citizenAddress,
            _department,
            _contentHash,
            block.timestamp
        );

        return newId;
    }

    /**
     * @notice Updates status of an existing grievance by authorized officer or admin
     * @param _id Grievance ID
     * @param _newStatus New Status enum
     * @param _remarks Official notes/resolution remarks
     */
    function updateGrievanceStatus(
        uint256 _id,
        Status _newStatus,
        string calldata _remarks
    ) external onlyAuthorizedOfficer(grievances[_id].department) {
        require(_id > 0 && _id <= grievanceCount, "GrievanceRegistry: Grievance does not exist");
        Grievance storage g = grievances[_id];
        require(g.exists, "GrievanceRegistry: Grievance does not exist");
        require(bytes(_remarks).length > 0, "GrievanceRegistry: Remarks cannot be empty");

        Status prevStatus = g.currentStatus;
        require(prevStatus != _newStatus, "GrievanceRegistry: New status must differ from current status");

        g.currentStatus = _newStatus;
        g.updatedAt = block.timestamp;

        if (_newStatus == Status.Resolved) {
            g.resolvedAt = block.timestamp;
        }

        grievanceHistory[_id].push(StatusLog({
            status: _newStatus,
            updatedBy: msg.sender,
            remarks: _remarks,
            timestamp: block.timestamp
        }));

        emit GrievanceStatusUpdated(
            _id,
            g.trackingCode,
            prevStatus,
            _newStatus,
            msg.sender,
            _remarks,
            block.timestamp
        );
    }

    // --- Query & Verification Functions ---

    function getGrievance(uint256 _id) external view returns (Grievance memory) {
        require(_id > 0 && _id <= grievanceCount, "GrievanceRegistry: Not found");
        Grievance storage g = grievances[_id];
        require(g.exists, "GrievanceRegistry: Not found");
        return g;
    }

    function getGrievanceByTrackingCode(string calldata _trackingCode) external view returns (Grievance memory) {
        uint256 foundId = trackingCodeToId[_trackingCode];
        require(foundId != 0, "GrievanceRegistry: Tracking code not found");
        return grievances[foundId];
    }

    function getStatusHistory(uint256 _id) external view returns (StatusLog[] memory) {
        require(_id > 0 && _id <= grievanceCount, "GrievanceRegistry: Grievance does not exist");
        require(grievances[_id].exists, "GrievanceRegistry: Grievance does not exist");
        return grievanceHistory[_id];
    }

    /**
     * @notice Cryptographically verifies if off-chain grievance data matches on-chain content hash
     * @param _id Grievance ID
     * @param _computedHash Keccak256 hash computed from citizen's payload
     */
    function verifyIntegrity(uint256 _id, bytes32 _computedHash) external view returns (bool isValid) {
        require(_id > 0 && _id <= grievanceCount, "GrievanceRegistry: Grievance does not exist");
        return (grievances[_id].contentHash == _computedHash);
    }
}
