const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config.js")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

// Method 1 of deployment
// function deployFunc(hre) {}
// module.exports.default = deployFunc

// Method 2
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // console.log(`ChainId = ${chainId}`)

    // If chainId is X use address A
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        // ethUsdPriceFeedAddress = "0x8a753747a1fa494ec906ce90e9f37563a8af630e"
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
        // console.log(
        //     `ethUsdPriceFeedAddress = ${networkConfig[chainId]["ethUsdPriceFeed"]}`
        // )
    }

    // Mock Contract => If the contract doesn't exist, we deploy a minimal version of it for our local testing

    // When going for localhost or hardhat we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // Price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1, //
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("-------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
