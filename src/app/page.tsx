"use client";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10">
      <div className="text-center w-full max-w-5xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Multi-Sig Wallet
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Our Multi-Sig Wallets offer unparalleled security for managing your digital assets. Transactions require multiple approvals, ensuring every action is intentional and secure.
        </p>

        <button
          onClick={() => router.push("/wallets/create")}
          className="bg-green-500 text-white py-3 px-8 rounded-md shadow-lg hover:bg-green-600 transition-colors font-semibold"
        >
          Get Started
        </button>
      </div>
    </main>
  );
};

export default Home;
