import Web3 from "web3";
import { FACTORY_ABI, FACTORY_ADDRESS, MULTI_SIG_ABI } from "./constants";

const fetchWeb3 = () => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    return web3;
  }
};

const fetchFactoryContract = () => {
  const web3: any = fetchWeb3();
  const factoryContract = new web3.eth.Contract(FACTORY_ABI, FACTORY_ADDRESS);
  return factoryContract;
};

const fetchMultiSigContract = (MULTI_SIG_ADDRESS: string) => {
  const web3: any = fetchWeb3();
  const multiSigContract = new web3.eth.Contract(
    MULTI_SIG_ABI,
    MULTI_SIG_ADDRESS
  );
  return multiSigContract;
};

const fetchContractByABIandAddress = (ABI: any, ADDRESS: string) => {
  try {
    const web3: any = fetchWeb3();
    console.log("ABI",ABI);
    console.log("ADDRESS",ADDRESS);
    const contract = new web3.eth.Contract(ABI, ADDRESS);
    return contract;
  } catch (err) {
    return false;
  }
};

const fetchBalance = async (address: string) => {
  try { 
    const web3: any = fetchWeb3();
    return await web3.eth.getBalance(address);
  } catch (err) {
    console.log("fetch balance error", err);
  }
};

export {
  fetchWeb3,
  fetchContractByABIandAddress,
  fetchFactoryContract,
  fetchMultiSigContract,
  fetchBalance,
};
