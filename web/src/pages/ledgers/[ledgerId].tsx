import { api } from "@/utils/api";
import { type NextPage } from "next";
import { useRouter } from "next/router";

const Ledger: NextPage = () => {
  const router = useRouter();
  const { ledgerId } = router.query as { ledgerId: string | undefined };

  const { data } = api.ledgers.getLedger.useQuery(
    {
      ledgerId: ledgerId as string,
    },
    {
      enabled: ledgerId !== undefined,
    }
  );

  return <div>Hi</div>;
};

export default Ledger;
