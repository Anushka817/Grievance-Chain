import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("=================================================");
  console.log("GrievanceChain — Smart Contract Deployment Script");
  console.log("Student: Anushka Tomar | Amity University MP");
  console.log("=================================================");

  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/GrievanceRegistry.sol/GrievanceRegistry.json"
  );

  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found! Please run 'npx hardhat compile' first.");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  // Connect to local node (e.g. 127.0.0.1:8545) or simulated provider
  const rpcUrl = process.env.HARDHAT_RPC_URL || "http://127.0.0.1:8545";
  console.log(`Connecting to provider at: ${rpcUrl}`);

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    console.log(`Connected to Network: Chain ID ${network.chainId.toString()}`);

    const signer = await provider.getSigner(0);
    const deployerAddress = await signer.getAddress();
    console.log(`Deployer Account: ${deployerAddress}`);

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    console.log("Deploying GrievanceRegistry contract...");

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    console.log(`GrievanceRegistry successfully deployed to: ${deployedAddress}`);
    console.log(`Contract Admin set to: ${deployerAddress}`);
    console.log("=================================================");

    // Save deployment details to frontend configuration
    const deploymentInfo = {
      address: deployedAddress,
      network: network.name,
      chainId: Number(network.chainId),
      deployer: deployerAddress,
      deployedAt: new Date().toISOString(),
    };

    const outDir = path.resolve(__dirname, "../src/blockchain");
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(outDir, "deployed-address.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("Saved deployment configuration to src/blockchain/deployed-address.json");
  } catch (err) {
    console.warn("Local node not running or not reachable on " + rpcUrl);
    console.warn("Reason:", err.message);
    console.log("Note: To run a local Hardhat node, execute: 'npx hardhat node'");
  }
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
