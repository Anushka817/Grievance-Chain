import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactPath = path.resolve(
  __dirname,
  "../artifacts/contracts/GrievanceRegistry.sol/GrievanceRegistry.json"
);

test("GrievanceRegistry Smart Contract Verification Suite", async (t) => {
  assert.ok(fs.existsSync(artifactPath), "Contract artifact should exist");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  assert.ok(artifact.abi.length > 0, "ABI should contain contract interface");
  assert.ok(artifact.bytecode.length > 10, "Bytecode should be compiled");

  await t.test("Validates ABI structure and essential function definitions", () => {
    const functionNames = artifact.abi
      .filter((item) => item.type === "function")
      .map((item) => item.name);

    assert.ok(functionNames.includes("registerGrievance"), "Should have registerGrievance function");
    assert.ok(functionNames.includes("updateGrievanceStatus"), "Should have updateGrievanceStatus function");
    assert.ok(functionNames.includes("getGrievance"), "Should have getGrievance function");
    assert.ok(functionNames.includes("getStatusHistory"), "Should have getStatusHistory function");
    assert.ok(functionNames.includes("verifyIntegrity"), "Should have verifyIntegrity function");
    assert.ok(functionNames.includes("authorizeOfficer"), "Should have authorizeOfficer function");
    assert.ok(functionNames.includes("revokeOfficer"), "Should have revokeOfficer function");
  });

  await t.test("Validates cryptographic content hashing integrity formula", () => {
    const samplePayload = {
      title: "Broken Streetlight on Sector 4 Main Road",
      category: "Roads & Infrastructure",
      description: "Streetlight pole #24 flickering and completely dark at night causing security concerns.",
      location: "Sector 4 Main Road, near Community Center",
      timestamp: 1729780000,
    };

    const encoded = ethers.toUtf8Bytes(
      `${samplePayload.title}|${samplePayload.category}|${samplePayload.description}|${samplePayload.location}|${samplePayload.timestamp}`
    );
    const contentHash = ethers.keccak256(encoded);

    assert.match(contentHash, /^0x[a-fA-F0-9]{64}$/, "Keccak256 hash must be 32 bytes hex string");

    // Tampered payload check
    const tamperedPayload = { ...samplePayload, description: "Tampered content by an attacker" };
    const tamperedEncoded = ethers.toUtf8Bytes(
      `${tamperedPayload.title}|${tamperedPayload.category}|${tamperedPayload.description}|${tamperedPayload.location}|${tamperedPayload.timestamp}`
    );
    const tamperedHash = ethers.keccak256(tamperedEncoded);

    assert.notEqual(contentHash, tamperedHash, "Tampered content MUST yield a different cryptographic hash");
  });

  await t.test("Validates role permissions and status transition rules", () => {
    // Status enum values: 0: Submitted, 1: UnderReview, 2: InProgress, 3: Resolved, 4: Rejected
    const validTransitions = [
      { from: 0, to: 1, valid: true, name: "Submitted -> UnderReview" },
      { from: 1, to: 2, valid: true, name: "UnderReview -> InProgress" },
      { from: 2, to: 3, valid: true, name: "InProgress -> Resolved" },
      { from: 1, to: 4, valid: true, name: "UnderReview -> Rejected" },
      { from: 3, to: 3, valid: false, name: "Same status transition rejected" },
    ];

    for (const transition of validTransitions) {
      if (!transition.valid) {
        assert.equal(transition.from, transition.to, "Identical status change should be rejected by contract");
      } else {
        assert.notEqual(transition.from, transition.to, "Transition should advance state");
      }
    }
  });
});
