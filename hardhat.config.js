require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    pushTestnet: {
      url: "https://evm.rpc-testnet-donut-node1.push.org/",
      chainId: 42101,
      accounts: ["824ab816921f0769d5cdc63ff91dfb0aae4f3f848b6aad401e94e38f0bcf8f92"],
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      pushTestnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "pushTestnet",
        chainId: 42101,
        urls: {
          apiURL: "https://donut.push.network/api",
          browserURL: "https://donut.push.network",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
