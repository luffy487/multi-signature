"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WalletIcon } from "@heroicons/react/24/solid";
import { UserIcon } from "@heroicons/react/24/outline";

const Topbar: React.FC = () => {
  const router = useRouter();
  const [account, setAccount] = useState<string>("");
  useEffect(() => {
    const currentAccount = localStorage.getItem("account");
    if(currentAccount){
      setAccount(currentAccount);
    }
  }, [])
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts: string[] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          const newAccount = accounts[0];
          setAccount(newAccount);
          localStorage.setItem("account", newAccount);
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      console.error("Ethereum provider not found. Please install MetaMask.");
    }
  };
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: any) => {
        setAccount(accounts[0]);
        localStorage.setItem("account", accounts[0]);
      });
    }
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-600 text-white py-4 px-6 flex justify-between items-center fixed top-0 left-0 w-full z-50">
      <div
        className="text-xl font-semibold cursor-pointer"
        onClick={() => router.push("/")}
      >
        Multi-Sig Wallet
      </div>
      <div className="flex items-center space-x-4">
        <Link
          href="/wallets"
          className="flex items-center text-white hover:text-gray-200 transition-colors duration-200 mr-2"
        >
          <WalletIcon className="w-6 h-6 mr-1" />
          <span className="font-semibold">Wallets</span>
        </Link>
        <div className="flex items-center space-x-2">
          {!account ? (
            <button
              onClick={connectWallet}
              className="bg-white text-indigo-600 hover:bg-gray-200 font-semibold py-2 px-4 rounded-md shadow-lg transition-all duration-200"
            >
              Connect
            </button>
          ) : (
            <div className="flex items-center bg-white text-white px-4 py-2 rounded-md shadow-md">
              <UserIcon className="w-5 h-5 text-black mr-2" />
              <span className="text-black">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
