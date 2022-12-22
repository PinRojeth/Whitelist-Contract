import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";   
import *as dotenv from "dotenv";
dotenv.config();


const API_KEY_URL = process.env.API_KEY_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.17",
  defaultNetork: "goerli",
  networks: {
    goerli: {
      url: API_KEY_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey:"BFJ7KDYTECV5NQDRSPWKKRXMXIVVZ8IPEP"
  },
};



