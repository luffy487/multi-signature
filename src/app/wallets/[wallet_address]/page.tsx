"use client";
import Wallet from "@/app/components/WalletPage";
import { useParams } from "next/navigation";

const WalletPage = () => {
  const { wallet_address } = useParams<{ wallet_address: string }>();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-md p-6">
          <Wallet address={wallet_address} />
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
