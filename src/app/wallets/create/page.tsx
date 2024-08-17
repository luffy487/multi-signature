"use client";
import CreateWallet from "@/app/components/CreateWallet";
import { useEffect, useState } from "react";
const CreatePage = () => {
  const [account, setAccount] = useState<string>();
  useEffect(() => {
    const currentAccount = localStorage.getItem("account");
    if (currentAccount) {
      setAccount(currentAccount);
    }
  }, [account]);
  return (
    <div>{account && <CreateWallet account={account}></CreateWallet>}</div>
  );
};
export default CreatePage;
