import { useAuth, UserButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Marble</title>
        <meta name="description" content="Simple ledgers for anyone" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-200">
        <div className="container flex flex-grow flex-col items-center justify-center">
          <AuthShowcase />
          <Link href="/ledgers">/ledgers</Link>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {isSignedIn && (
        <div className="flex items-center justify-center">
          <UserButton />
        </div>
      )}
      {!isSignedIn && (
        <p className="text-center text-2xl">
          <Link href="/sign-in">Sign In</Link>
        </p>
      )}
    </div>
  );
};
