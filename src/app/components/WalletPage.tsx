"use client";
import React, { useEffect, useState } from "react";
import {
  fetchMultiSigContract,
  fetchContractByABIandAddress,
  fetchBalance,
} from "../../../utils/helper";
import { isAddress } from "web3-validator";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validateValue, convertValue } from "../../../utils/validator";
import TransactionsTable from "./Transactions";

interface WalletProps {
  address: string;
}

const Wallet: React.FC<WalletProps> = ({ address }) => {
  const [contract, setContract] = useState<any>();
  const [account, setAccount] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [send, setSend] = useState<boolean>(false);
  const [value, setValue] = useState<number>(0);
  const [to, setTo] = useState<string>("");
  const [interaction, setInteraction] = useState<boolean>(false);
  const [contractABI, setContractABI] = useState<any>();
  const [smartContract, setSmartContract] = useState<any>();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [inputs, setInputs] = useState<any[]>([]);
  const [params, setParams] = useState<any>({});
  const [autoExecute, setAutoExecute] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(0);
  let data: string = "";
  useEffect(() => {
    let currentAccount = localStorage.getItem("account");
    if (currentAccount) {
      setAccount(currentAccount);
    }
    init();
  }, [address]);
  const init = async () => {
    try {
      let contract: any = fetchMultiSigContract(address);
      let [name, transactions, autoExecute, threshold, balance] =
        await Promise.all([
          contract.methods.getWalletName().call(),
          contract.methods.getAllTransactions().call(),
          contract.methods.getAutoExecute().call(),
          contract.methods.fetchThreshold().call(),
          fetchBalance(address),
        ]);
      transactions = transactions.sort((a:any, b:any) => {
        return Number(b.createdAt) - Number(a.createdAt);
      })
      setName(name);
      setTransactions(transactions);
      setAutoExecute(autoExecute);
      setBalance(Number(balance) / 10 ** 18);
      setThreshold(threshold);
      setContract(contract);
    } catch (err) {
      console.log("Error in initializing the contract");
    }
  };
  const fetchTransactions = async () => {
    let transactions =  await contract.methods.getAllTransactions().call();
    return transactions.sort((a: any, b: any) => {
      return Number(b.createdAt) - Number(a.createdAt);
    });
  }
  const prepareTransaction = async () => {
    if (!selectedMethod) {
      toast.error("Please select a method");
      return;
    }

    if (inputs.length) {
      let invalidInput = inputs.findIndex(
        (input) =>
          !params[input.name] || !validateValue(params[input.name], input.type)
      );
      if (invalidInput !== -1) {
        toast.error("Invalid Params");
        return;
      }
      let functionArgs: any = [];
      inputs.forEach((input) => {
        const convertedValue = convertValue(params[input.name], input.type);
        functionArgs.push(convertedValue);
      });
      setParams({ ...functionArgs });

      try {
        setValue(0);
        data = await smartContract.methods[selectedMethod](
          ...functionArgs
        ).encodeABI();
        await new Promise((resolve) => setTimeout(resolve, 0));
        await propose();
      } catch (err) {
        toast.error("Something went wrong !");
      }
    } else {
      try {
        setValue(0);
        data = await smartContract.methods[selectedMethod]().encodeABI();
        await new Promise((resolve) => setTimeout(resolve, 0));
        await propose();
      } catch (err) {
        console.error("Error in creating the Hash:", err);
      }
    }
  };
  const propose = async () => {
    try {
      if (!isAddress(to)) {
        toast.error("Invalid Address");
        return;
      }
      if (!data && !value) {
        toast.error("Invalid value / data");
        return;
      }
      if (Number(value) / 10 ** 18 > balance) {
        toast.error("Insufficient Balance");
        return;
      }
      setSend(false);
      setInteraction(false);
      await contract.methods
        .proposeTransaction(data ? data : "0x", to, value)
        .send({ from: account });
      clearContract();
      let transactions = await fetchTransactions()
      setTransactions(transactions);
      setInteraction(false);
    } catch (err) {
      console.log("error", err);
    }
  };
  const approve = async (txId: Number) => {
    try {
      await contract.methods.approveTransaction(txId).send({ from: account });
      let transactions = await fetchTransactions()
      setTransactions(transactions);
    } catch (err) {
      console.log("Err", err);
    }
  };

  const execute = async (txId: Number) => {
    try {
      await contract.methods.executeTransaction(txId).send({ from: account });
      let transactions = await fetchTransactions()
      setTransactions(transactions);
    } catch (err) {
      console.log("Err", err);
    }
  };
  const handleContractAddress = (event: any) => {
    setTo(event.target.value);
    fetchInteractionContract();
  };
  const handleContractABIChange = (event: any) => {
    setContractABI(event.target.value);
    fetchInteractionContract();
  };
  const handleMethodChange = (event: any) => {
    setSelectedMethod(event.target.value);
    let method = methods.find((fd: any) => fd.name === event.target.value);
    if (method && method.inputs) {
      setInputs(method.inputs);
    }
  };
  const clearContract = () => {
    setSmartContract(null);
    setMethods([]);
    setInputs([]);
  };
  const fetchInteractionContract = () => {
    if (!isAddress(to)) {
      clearContract();
      return;
    }
    try {
      let parsedABI;
      try {
        parsedABI = JSON.parse(contractABI);
      } catch (error) {
        clearContract();
        return;
      }
      let contract = fetchContractByABIandAddress(parsedABI, to);
      if (!contract) {
        clearContract();
        return;
      }
      setSmartContract(contract);
      let methods = parsedABI.filter(
        (item: any) =>
          item.type === "function" &&
          (item.stateMutability === "nonpayable" ||
            item.stateMutability === "payable")
      );
      setMethods(methods);
    } catch (error) {
      toast.error("An unexpected error occurred while fetching the contract.");
      console.error("fetchInteractionContract error:", error);
    }
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <h2>{balance + " ETH"}</h2>
          <span className="block text-gray-500">{address}</span>
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => setSend(true)}
          >
            Send ETH
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => setInteraction(true)}
          >
            Build Transaction
          </button>
        </div>
      </div>
      <TransactionsTable
        transactions={transactions}
        approve={approve}
        execute={execute}
        account={account}
        autoExecute={autoExecute}
        threshold={threshold}
      ></TransactionsTable>
      {send && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">Send ETH</h2>
            <div className="relative mb-4">
              <input
                type="text"
                value={to}
                onChange={(event: any) => setTo(event.target.value)}
                placeholder="Recipient Address"
                className="border border-gray-300 rounded-md p-4 w-full text-lg pt-6"
              />
              <label className="absolute top-0 left-3 bg-white px-1 text-gray-500 text-sm transform -translate-y-1/2">
                To
              </label>
            </div>
            <div className="relative mb-4">
              <input
                type="number"
                value={value}
                onChange={(event: any) => setValue(Number(event.target.value))}
                placeholder="Amount to Send in wei"
                className="border border-gray-300 rounded-md p-4 w-full text-lg pt-6"
              />
              <label className="absolute top-0 left-3 bg-white px-1 text-gray-500 text-sm transform -translate-y-1/2">
                {"Value (in wei)"}
              </label>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setSend(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={propose}
              >
                Initiate
              </button>
            </div>
          </div>
        </div>
      )}

      {interaction && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] h-[90%] max-w-full max-h-full overflow-auto flex flex-col">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-300 z-10">
              <h2 className="text-xl font-semibold">Build Transaction</h2>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  value={to}
                  onInput={handleContractAddress}
                  placeholder="Contract Address"
                  className="border border-gray-300 rounded-md p-4 w-full text-lg pt-6"
                />
                <label className="absolute top-0 left-3 bg-white px-1 text-gray-500 text-sm transform -translate-y-1/2">
                  Contract Address
                </label>
              </div>
              <div className="relative mb-4">
                <textarea
                  value={contractABI}
                  onInput={handleContractABIChange}
                  placeholder="Contract ABI"
                  className="border border-gray-300 rounded-md p-4 w-full text-lg h-64 pt-6"
                />
                <label className="absolute top-0 left-3 bg-white px-1 text-gray-500 text-sm transform -translate-y-1/2">
                  Contract ABI
                </label>
              </div>
              {methods.length > 0 && (
                <div className="relative mb-4">
                  <select
                    value={selectedMethod}
                    onChange={handleMethodChange}
                    className="border border-gray-300 rounded-md p-4 w-full text-lg bg-white"
                  >
                    <option value="">Select Method</option>
                    {methods.map((method: any, index) => (
                      <option value={method.name} key={index}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  <label className="absolute top-0 left-3 bg-white px-1 text-gray-500 text-sm transform -translate-y-1/2">
                    Method
                  </label>
                </div>
              )}
              {inputs.length > 0 && (
                <div className="mt-4">
                  {inputs.map((input: any, index) => (
                    <div key={index} className="relative mb-4">
                      <input
                        type="text"
                        value={params[input.name] || ""}
                        onInput={(event: any) =>
                          setParams({
                            ...params,
                            [input.name]: event.target.value,
                          })
                        }
                        placeholder={`${input.name} - ${input.type}`}
                        className="border border-gray-300 rounded-md p-4 w-full text-lg pt-6"
                      />
                      <label className="absolute top-0 left-3 bg-white px-1 text-gray-500 text-sm transform -translate-y-1/2">
                        {input.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-gray-100 p-3 border-t border-gray-300 flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setInteraction(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={prepareTransaction}
              >
                Initiate
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default Wallet;
