import Spinner from "@/components/spinner";
import { api } from "@/utils/api";
import { useAuth } from "@clerk/nextjs";
import { type NextPage } from "next";
import { useRouter } from "next/router";

const Ledger: NextPage = () => {
  const router = useRouter();
  const { userId } = useAuth();

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

  const {
    mutate: makeNewLedgerEntry,
    isLoading: isNewLedgerEntryLoading,
    data: newLedgerEntry,
  } = api.ledgerEntries.newLedgerEntry.useMutation({
    onSuccess(data) {
      console.log(data);
    },
  });

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
            <button
              className="mt-4 rounded border border-neutral-900 p-2"
              onClick={() =>
                makeNewLedgerEntry({
                  kind: "recurring",
                  recurring: {
                    amount: 100,
                    frequency: "annually",
                    startAt: new Date().toISOString(),
                  },
                  ledgerId: ledger.id,
                  name: "Test Ledger Entry",
                  purchaserId: userId as string,
                })
              }
            >
              New Entry
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Ledger;
