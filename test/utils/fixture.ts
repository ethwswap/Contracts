import { ethers, upgrades } from "hardhat";
import * as hre from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import * as utils from  "./const";
import { BigNumber } from "ethers";
import { MockERC20, ETHWSwap } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export interface ETHSwapfixture {
  WETH: MockERC20,
  USDT: MockERC20,
  ETHWSwap: ETHWSwap
}

export async function deployETHSwapfixture() {
  const [signer] = await ethers.getSigners();
  let provider = hre.ethers.provider;

  // Set up fake WETH
  const MockWETHContract = await ethers.getContractFactory("MockERC20");
  const weth = await MockWETHContract.deploy("WETH", "WETH", 18);
  await weth.deployed();
  const WETHCode = await provider.getCode(weth.address);
  await helpers.setCode(utils.WETH, WETHCode);
  const WETH = MockWETHContract.attach(utils.WETH);
  console.log("WETH address: ", WETH.address);

  // Set up fake USDT
  const MockUSDTContract = await ethers.getContractFactory("MockERC20");
  const usdt = await MockWETHContract.deploy("USDT", "USDT", 6);
  await usdt.deployed();
  const USDTCode = await provider.getCode(usdt.address);
  await helpers.setCode(utils.USDT, USDTCode);
  const USDT = MockWETHContract.attach(utils.USDT);
  console.log("USDT address: ", USDT.address);

  // Deploy ETHWSwap
  const ETHWSwapContract = await ethers.getContractFactory("ETHWSwap");
  console.log("Deploying ETHWSwap...");
  const feeRate = 1000; // 10%
  const feeReceiver = signer.address;
  let ETHWSwapProxy = await upgrades.deployProxy(
    ETHWSwapContract,
    [feeRate, feeReceiver],
    { initializer: 'initialize' }
  );
  console.log("ETHWSwap deployed to:", ETHWSwapProxy.address);
  const ETHWSwap = await ethers.getContractAt("ETHWSwap", ETHWSwapProxy.address);

  return { WETH, USDT, ETHWSwap };
}

export async function setupSigners(fixture: ETHSwapfixture, signer: SignerWithAddress) {
  // Mint for owner and users
  console.log("mint to signer");
  await fixture.WETH.mint(signer.address, BigNumber.from(1000).mul(BigNumber.from(10).pow(18)));
  await fixture.USDT.mint(signer.address, BigNumber.from(1000).mul(BigNumber.from(10).pow(6)));

  // Approve WETHSwap
  console.log("Approve WETHSwap");
  await fixture.WETH.connect(signer).approve(fixture.ETHWSwap.address, await fixture.WETH.balanceOf(signer.address));
  await fixture.USDT.connect(signer).approve(fixture.ETHWSwap.address, await fixture.USDT.balanceOf(signer.address));
}