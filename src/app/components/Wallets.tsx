"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface WalletsProps {
  account: string;
  factory: any;
}

const Wallets: React.FC<WalletsProps> = ({ account, factory }) => {
  const router = useRouter();
  const [wallets, setWallets] = useState<any[]>([]);

  useEffect(() => {
    getWallets();
  }, []);

  const getWallets = async () => {
    try {
      const fetchedWallets = await factory.methods.fetchWallets(account).call();
      setWallets(fetchedWallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Wallets</h1>
        <button
          onClick={() => router.push("/wallets/create")}
          className="bg-green-500 text-white py-2 px-6 rounded-md shadow-lg hover:bg-green-600 transition-colors font-semibold"
          aria-label="Create new account"
        >
          Create Wallet
        </button>
      </div>

      {wallets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wallets.map((wallet: any, index) => (
            <div
              onClick={() => router.push(`/wallets/${wallet.walletAddress}`)}
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 border border-gray-300 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-900">
                  {wallet.title}
                </h4>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                {wallet.walletAddress.slice(0, 6)}...
                {wallet.walletAddress.slice(-6)}
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                {wallet.owners.map((owner: any, index: any) => (
                  <p key={index} className="text-gray-800">
                    Signer {index + 1}: {owner.slice(0, 10)}...{owner.slice(-6)}
                  </p>
                ))}
              </div>
              <div className="text-gray-800">
                <p className="font-medium">
                  No. of signatures required:{" "}
                  <span className="font-semibold">
                    {Number(wallet.threshold)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">No wallets available</p>
        </div>
      )}
    </div>
  );
};

export default Wallets;
