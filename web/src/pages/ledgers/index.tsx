import Spinner from "@/components/spinner";
import { api } from "@/utils/api";
import { useAuth } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { type RefCallback, useCallback, useRef, useState } from "react";

const Ledgers: NextPage = () => {
  const [ledgerName, setLedgerName] = useState("");
  const { isSignedIn } = useAuth();

  const {
    data,
    isLoading: isLedgersLoading,
    hasNextPage,
    fetchNextPage,
  } = api.ledgers.listLedgers.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      enabled: !!isSignedIn,
      getNextPageParam: (lastPage) => {
        const lastItem = lastPage.items[lastPage.items.length - 1];
        return lastPage.hasMore && lastItem?.id;
      },
    }
  );

  const { mutate: newLedger, isLoading } = api.ledgers.newLedger.useMutation();

  const observer = useRef<IntersectionObserver | null>(null);

  const lastLedgerElementRef = useCallback<RefCallback<HTMLButtonElement>>(
    (node) => {
      if (isLedgersLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          void fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isLedgersLoading]
  );

  return (
    <>
      <Head>
        <title>Phractal</title>
        <meta name="description" content="Simple ledgers for anyone" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-200">
        <div className="container flex flex-grow flex-col items-center justify-center">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <input
                onChange={(e) => setLedgerName(e.target.value)}
                value={ledgerName}
              />
              <button
                className="rounded border border-neutral-900 p-2"
                onClick={() => newLedger({ name: ledgerName })}
              >
                New Ledger
              </button>
            </>
          )}
          <div className="mt-4 flex flex-col gap-4">
            {!data ? (
              <p>No Ledgers</p>
            ) : (
              data.pages
                .map(({ items }) => items)
                .flat()
                .map((ledger, idx, arr) => {
                  const className =
                    "rounded border border-neutral-900 p-4 text-center focus:outline-none";

                  if (arr.length === idx + 1) {
                    return (
                      <button
                        key={ledger.id}
                        ref={lastLedgerElementRef}
                        className={className}
                      >
                        {ledger.id}
                      </button>
                    );
                  }
                  return (
                    <button key={ledger.id} className={className}>
                      {ledger.id}
                    </button>
                  );
                })
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Ledgers;
