"use client";
import { useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchFactoryContract } from "../../../utils/helper";
import { useRouter } from "next/navigation";
import { isAddress } from "web3-validator";

interface CreateWalletProps {
  account: string;
}
const CreateWallet: React.FC<CreateWalletProps> = ({ account }) => {
  const router = useRouter();
  const [factory, setFactory] = useState<any>();
  const [owners, setOwners] = useState<any[]>([]);
  const [threshold, setThreshold] = useState<number>(0);
  const [autoExecute, setAutoExecute] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    let factory = fetchFactoryContract();
    setFactory(factory);
  }, []);
  useEffect(() => {
    setOwners([account, ""]);
  }, [account]);
  const createWallet = async () => {
    if (!title) {
      toast.error("Please Enter your wallet name");
      return;
    }
    if (owners.length < 2) {
      toast.error("Please provide atleast 2 signers");
    }
    let inValidSigner = owners.findIndex((owner: any) => !isAddress(owner));
    if (inValidSigner !== -1) {
      toast.error("Invalid Signer " + (inValidSigner + 1));
      return;
    }
    if (threshold > owners.length || !threshold) {
      toast.error("Invalid threshold");
      return;
    }
    try {
      const txn = await factory.methods
        .createNewMultiSigWallet(title, owners, threshold, autoExecute)
        .send({ from: account });
      if (txn?.events?.WalletCreated?.returnValues[0]) {
        router.push(`/wallets/${txn.events.WalletCreated.returnValues[0]}`);
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
    }
  };

  const handleOwnerChange = (index: number, value: string) => {
    const updatedOwners = [...owners];
    updatedOwners[index] = value;
    setOwners(updatedOwners);
  };

  const removeOwner = (index: number) => {
    if (index !== 0) {
      const updatedOwners = owners.filter((_, i) => i !== index);
      setOwners(updatedOwners);
    }
  };

  return (
    <div className="inset-0 flex items-center justify-center z-50 px-4 sm:px-6 lg:px-8 mt-5">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-lg sm:max-w-6xl relative">
        <h3 className="text-2xl font-semibold text-black mb-4">
          Create Multi-Sig Wallet
        </h3>
        <div className="relative mb-4">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Your wallet name"
            className="border border-gray-300 rounded-md p-4 w-full text-lg pt-6"
          />
          <label className="absolute top-0 left-3 bg-white px-1 text-gray-500 text-sm transform -translate-y-1/2">
            Name
          </label>
        </div>
        <hr className="mb-2" />
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setOwners([...owners, ""])}
            className="text-green-500 py-1 px-2 rounded-md hover:bg-green-50 flex items-center space-x-1 mt-2"
            aria-label="Add signer"
          >
            <span>Add Signer +</span>
          </button>
        </div>
        {owners.map((owner, index) => (
          <div key={index} className="relative mt-4 mb-4 flex items-center">
            <div className="relative w-full">
              <input
                type="text"
                value={owner}
                onChange={(event) =>
                  handleOwnerChange(index, event.target.value)
                }
                className="border border-gray-300 rounded-md p-4 text-lg w-full pr-12 pt-6"
                disabled={index == 0}
              />
              <TrashIcon
                onClick={() => removeOwner(index)}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-600"
              />
              <label className="absolute top-0 left-3 bg-white px-1 text-gray-500 text-sm transform -translate-y-1/2">
                Signer {index + 1}
              </label>
            </div>
          </div>
        ))}
        <hr className="mb-4" />
        <div className="mb-4 mt-4">
          <div className="relative">
            <input
              type="number"
              placeholder=" "
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="border border-gray-300 rounded-md p-4 w-full pt-6"
            />
            <label className="absolute top-0 left-3 bg-white px-1 text-gray-500 text-sm transform -translate-y-1/2">
              Threshold
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Note: Threshold should be less than or equal to the number of
            signers.
          </p>
        </div>
        <div className="mb-4 text-gray-500">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={autoExecute}
              onChange={(event) => setAutoExecute(event.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2">Auto Execute</span>
          </label>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => router.push("/wallets")}
            className="bg-gray-500 text-white py-3 px-10 rounded-md hover:bg-gray-600 w-full sm:w-auto"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={createWallet}
            className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-600 text-white py-2 px-6 rounded-md hover:bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 w-full sm:w-auto"
            aria-label="Create wallet"
          >
            Create Wallet
          </button>
        </div>
      </div>
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default CreateWallet;
