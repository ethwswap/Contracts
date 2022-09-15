import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import "dotenv/config";

const MAINNET_DEPLOYER_PRIVATE_KEY =
  process.env.MAINNET_DEPLOYER_PRIVATE_KEY;

const MUMBAI_DEPLOYER_PRIVATE_KEY =
  process.env.MUMBAI_DEPLOYER_PRIVATE_KEY;

const RINKEBY_DEPLOYER_PRIVATE_KEY = 
  process.env.RINKEBY_DEPLOYER_PRIVATE_KEY;

const ETHERSCAN_API_KEY = 
  process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.7.6" },
      { version: "0.8.0" },
      { version: "0.8.2" },
      { version: "0.8.9" },
      { version: "0.4.18" },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_MAINNET_API_KEY}`,
        blockNumber: 15422029
      }
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_MAINNET_API_KEY}`,
      accounts: [`0x${MAINNET_DEPLOYER_PRIVATE_KEY}`],
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MUMBAI_API_KEY}`,
      accounts: [`0x${MUMBAI_DEPLOYER_PRIVATE_KEY}`],
      gasPrice: 500000000
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/9fba8edaf8684c1e9aad3099bb8cdc1b`,
      accounts: [`0x${RINKEBY_DEPLOYER_PRIVATE_KEY}`]
    },
  },
  etherscan: {
    apiKey: `${ETHERSCAN_API_KEY}`
  },
};

// set proxy
const proxyUrl = 'http://127.0.0.1:7890';   // change to yours, With the global proxy enabled, change the proxyUrl to your own proxy link. The port may be different for each client.
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent(proxyUrl);
setGlobalDispatcher(proxyAgent);

export default config;
