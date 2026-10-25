import { keccak256, toUtf8Bytes } from "ethers";

/**
 * Computes deterministic Keccak-256 cryptographic digest of a grievance payload.
 * Compliant with EVM keccak256 hashing standards.
 */
export function computeGrievanceContentHash(payload: {
  title: string;
  department: number;
  category: string;
  description: string;
  location?: string;
  createdAt: number;
}): string {
  const normalizedString = [
    payload.title.trim(),
    payload.department.toString(),
    payload.category.trim(),
    payload.description.trim(),
    (payload.location || "").trim(),
    payload.createdAt.toString(),
  ].join("|");

  return keccak256(toUtf8Bytes(normalizedString));
}

/**
 * Verifies if off-chain content matches an on-chain content hash
 */
export function verifyContentIntegrity(
  payload: {
    title: string;
    department: number;
    category: string;
    description: string;
    location?: string;
    createdAt: number;
  },
  expectedHash: string
): { isValid: boolean; recomputedHash: string } {
  const recomputedHash = computeGrievanceContentHash(payload);
  const isValid = recomputedHash.toLowerCase() === expectedHash.toLowerCase();
  return { isValid, recomputedHash };
}

/**
 * Truncates an Ethereum address or hash for UI display
 */
export function formatAddress(address: string | null | undefined, head = 6, tail = 4): string {
  if (!address) return "0x0000...0000";
  if (address === "0x0000000000000000000000000000000000000000") return "Anonymous (0x0000...)";
  if (address.length <= head + tail) return address;
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

/**
 * Formats a Unix timestamp into a readable date and time string
 */
export function formatTimestamp(timestamp: number): string {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
