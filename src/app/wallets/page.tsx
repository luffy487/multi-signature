"use client";
import { useEffect, useState } from "react";
import Wallets from "../components/Wallets";
import { fetchFactoryContract } from "../../../utils/helper";

const AllWallets = () => {
  const [account, setAccount] = useState<string>("");
  const [factory, setFactory] = useState<any>();

  useEffect(() => {
    const currentAccount = localStorage.getItem("account");
    if (currentAccount) {
      setAccount(currentAccount);
    }
    const factoryContract: any = fetchFactoryContract();
    setFactory(factoryContract);
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      {account && factory && <Wallets account={account} factory={factory} />}
    </div>
  );
};

export default AllWallets;
