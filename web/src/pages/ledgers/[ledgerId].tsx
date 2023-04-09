import Spinner from "@/components/spinner";
import { api } from "@/utils/api";
import { type NextPage } from "next";
import { useRouter } from "next/router";

const Ledger: NextPage = () => {
  const router = useRouter();
  const { ledgerId } = router.query as { ledgerId: string | undefined };

  const { data: ledger, isLoading: isLedgerLoading } =
    api.ledgers.getLedger.useQuery(
      {
        ledgerId: ledgerId as string,
      },
      {
        enabled: ledgerId !== undefined,
      }
    );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-200">
      <div className="container flex flex-grow flex-col items-center justify-center">
        {isLedgerLoading ? (
          <Spinner />
        ) : !ledger ? (
          <div>not found</div>
        ) : (
          <div className="flex flex-grow flex-col items-center justify-center">
            <p>{ledger.name}</p>
            <button className="mt-4 rounded border border-neutral-900 p-2">
              New Entry
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Ledger;
