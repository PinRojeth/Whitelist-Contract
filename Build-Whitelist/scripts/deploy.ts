import { ethers } from "hardhat";

async function main() {
  const whitelistContract = await ethers.getContractFactory("Whitelist");

  const deployedWhitelistContract = await whitelistContract.deploy(10);

  await deployedWhitelistContract.deployed();

  console.log(
    "whitelist Contract Address", deployedWhitelistContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
