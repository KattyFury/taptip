/**
 * The chi tiet giao dich - dinh nghia DUY NHAT, dung o ca hai noi:
 *  - modal noi tren Lich su tip (components/transactions.tsx)
 *  - trang rieng /dashboard/transaction/[id]
 * Sua kieu dang o day la ca hai noi doi theo.
 */

import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";

export interface TransactionDetailData {
  status: string;
  /** true = nhan tip, false = gui tip */
  received: boolean;
  /** So tien da lam tron 2 chu so, chua kem don vi */
  amount: string;
  /** Ten nguoi nhan/gui, hoac dia chi rut gon */
  counterparty: string;
  date: string;
  time: string;
  txHash?: string;
}

const ARCSCAN_TX_URL = "https://testnet.arcscan.app/tx/";

export function TransactionDetail({ data }: { data: TransactionDetailData }) {
  return (
    <>
      <div className="bg-surface rounded-xl p-[14px] flex flex-col gap-[14px]">
        <div className="flex justify-between items-center">
          <StatusPill status={data.status} />
          <span className="text-[14px] text-accent">
            {data.received ? "Tip received" : "Tip sent"}
          </span>
        </div>

        <div>
          <div className="text-[13px] text-accent">Amount</div>
          <div className="text-[20px] font-extrabold font-num">
            {data.amount} USDC
          </div>
        </div>

        <div>
          <div className="text-[13px] text-accent">
            {data.received ? "From" : "To"}
          </div>
          <div className="text-[17px] font-extrabold break-all">
            {data.counterparty}
          </div>
        </div>

        <div className="text-[13px] text-accent">
          {data.date} <span className="font-num">{data.time}</span>
        </div>
      </div>

      {data.txHash && (
        <Button variant="outline" size="row" className="text-[15px]" asChild>
          <a
            href={`${ARCSCAN_TX_URL}${data.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on ArcScan
          </a>
        </Button>
      )}
    </>
  );
}
