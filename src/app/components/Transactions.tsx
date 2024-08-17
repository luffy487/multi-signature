import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
} from "@nextui-org/react";

interface Transaction { 
  txId: number;
  to: string;
  value: string | number;
  data: string;
  createdBy: string;
  createdAt: string;
  executed: boolean;
  executedAt?: string;
  approvals: string[];
}

interface TransactionsTableProps {
  transactions: Transaction[];
  approve: (txId: number) => void;
  execute: (txId: number) => void;
  account: string;
  autoExecute: boolean;
  threshold: number
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  approve,
  execute,
  account,
  autoExecute,
  threshold
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const convertedDate = (timestamp :any) => {
    let date =  new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  }

  return (
    <>
      <Table
        aria-label="Transactions Table"
        removeWrapper
        selectionMode="none"
        className="bg-white shadow-md rounded-lg p-4 mt-4 border border-gray-200"
      >
        <TableHeader className="bg-gray-100 rounded-t-lg text-left">
          <TableColumn className="px-4 py-2 font-semibold text-gray-700">
            Txn ID
          </TableColumn>
          <TableColumn className="px-4 py-2 font-semibold text-gray-700">
            To
          </TableColumn>
          <TableColumn className="px-4 py-2 font-semibold text-gray-700">
            Amount
          </TableColumn>
          <TableColumn className="px-4 py-2 font-semibold text-gray-700">
            Txn Data
          </TableColumn>
          <TableColumn className="px-4 py-2 font-semibold text-gray-700">
            Status
          </TableColumn>
          <TableColumn className="px-4 py-2 font-semibold text-gray-700">
            Initiated by
          </TableColumn>
          <TableColumn className="px-4 py-2 font-semibold text-gray-700">
            Initiated At
          </TableColumn>
          
          <TableColumn className="px-4 py-2 font-semibold text-gray-700">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody>
          {currentItems.map((txn: any, index: any) => (
            <TableRow
              key={index}
              className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <TableCell className="px-4 py-3 text-base text-gray-700 text-center">
                {Number(txn.txId)}
              </TableCell>
              <TableCell className="px-4 py-3 text-base text-gray-700 text-center">
                {txn.to.slice(0, 6)}...{txn.to.slice(-4)}
              </TableCell>
              <TableCell className="px-4 py-3 text-base text-gray-700 text-center">
                {(Number(txn.value) / 10 ** 18) + " ETH"}
              </TableCell>
              <TableCell className="px-4 py-3 text-base text-gray-700 text-center">
                {txn.data.slice(0,6)}...{txn.data.slice(-4)}
              </TableCell>
              <TableCell className="px-4 py-3 text-base text-center">
                {txn.executed ? (
                  <Chip color="success" className="bg-green-300 rounded-full px-3 py-1">
                    Executed
                  </Chip>
                ) : (
                  <Chip color="warning" className="bg-yellow-300 rounded-full px-3 py-1">
                    Pending
                  </Chip>
                )}
              </TableCell>
              <TableCell className="px-4 py-3 text-base text-gray-700 text-center">
                {txn.createdBy.slice(0, 6)}...{txn.createdBy.slice(-4)}
              </TableCell>
              <TableCell className="px-4 py-3 text-base text-gray-700 text-center">
              <span className="text-gray-500 text-sm">
                  {convertedDate(txn.createdAt)}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3 text-base text-center">
                {txn.executed ? (
                  <span className="text-gray-500">
                  {`Executed on `} <br/><span className="text-sm">{convertedDate(txn.executedAt)}</span>
                </span>
                ) : txn.approvals
                    .map((addr: any) => addr.toLowerCase())
                    .includes(account.toLowerCase()) ? (
                  !autoExecute && threshold != txn.approvals.length ? (
                    <span className="text-gray-500">
                      Waiting for others
                    </span>
                  ) : (
                    <button
                      onClick={() => execute(txn.txId)}
                      className="bg-green-500 hover:bg-green-600  text-white py-1 px-3 rounded"
                    >
                      Execute
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => approve(txn.txId)}
                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                  >
                    Approve
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 text-sm bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={indexOfLastItem >= transactions.length}
          className="px-3 py-1 mx-1 text-sm bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
};

export default TransactionsTable;
