import { ethers, upgrades } from "hardhat";
import * as hre from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import * as utils from  "../test/utils/const";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {
    const [signer] = await ethers.getSigners();
    let provider = hre.ethers.provider;

    // Set up fake WETH
    const MockWETHContract = await ethers.getContractFactory("WETH9");
    const weth = await MockWETHContract.deploy();
    await weth.deployed();
    const WETHCode = await provider.getCode(weth.address);
    await helpers.setCode(utils.WETH, WETHCode);
    const WETH = MockWETHContract.attach(utils.WETH);
    console.log("WETH address: ", WETH.address);

    // Set up fake USDT
    const MockUSDTContract = await ethers.getContractFactory("MockERC20");
    const usdt = await MockUSDTContract.deploy("USDT", "USDT", 6);
    await usdt.deployed();
    const USDTCode = await provider.getCode(usdt.address);
    await helpers.setCode(utils.USDT, USDTCode);
    const USDT = MockUSDTContract.attach(utils.USDT);
    console.log("USDT address: ", USDT.address);

    // Deploy FloashSwap
    const UniswapFlashSwapContract = await ethers.getContractFactory("UniswapFlashSwap");
    console.log("Deploying UniswapFlashSwap...");
    const feeReceiver = signer.address;
    const UniswapFlashSwap = await UniswapFlashSwapContract.deploy();
    await UniswapFlashSwap.deployed();
    console.log("UniswapFlashSwap deployed to:", UniswapFlashSwap.address);

    // Deploy ETHWSWAP
    const ETHWSwapContract = await ethers.getContractFactory("ETHWSwap");
    console.log("Deploying ETHWSwap...");
    const feeRate = 1000; // 10%
    let ETHWSWAP = await ETHWSwapContract.deploy();
    await ETHWSWAP.initialize(feeRate, feeReceiver);
    console.log("ETHWSwapProxy deployed to:", ETHWSWAP.address);
    await ETHWSWAP.setFlash(UniswapFlashSwap.address);

    const poolAddr = "0x4e68ccd3e89f51c3074ca5072bbac773960dfa36";
    const poolAddr2 = "0x11b815efb8f581194ae79006d24e0d814b7697f6";
    // Mint and approve
    WETH.mint(signer.address, BigNumber.from(10).pow(18).mul(1000000000000000));
    USDT.mint(signer.address, BigNumber.from(10).pow(6).mul(1000000000000000));
    WETH.mint(poolAddr, BigNumber.from(10).pow(18).mul(220000));
    USDT.mint(poolAddr, BigNumber.from(10).pow(6).mul(15000000));
    WETH.mint(poolAddr2, BigNumber.from(10).pow(18).mul(1000000000000000));
    USDT.mint(poolAddr2, BigNumber.from(10).pow(6).mul(1000000000000000));
    WETH.approve(ETHWSWAP.address, await WETH.balanceOf(signer.address));
    USDT.approve(ETHWSWAP.address, await USDT.balanceOf(signer.address));

    await helpers.setBalance(WETH.address, BigNumber.from(10).pow(18).mul(100000000000))

    const router = await ethers.getContractAt("ISwapRouter", utils.UniswapV3Router);
    const params = {
        tokenIn: USDT.address,
        tokenOut:WETH.address,
        fee: 3000,
        recipient: signer.address,
        deadline: await helpers.time.latest() + 10,
        amountIn: BigNumber.from(10).pow(6).mul(1000000),
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    }

    const pool = await ethers.getContractAt("IUniswapV3Pool", poolAddr);

    const amountIn = BigNumber.from(10).pow(6).mul(5000000)
    ETHWSWAP.swapExactTokenIn(USDT.address, WETH.address, amountIn, await helpers.time.latest() + 10);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
