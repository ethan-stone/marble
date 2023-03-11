import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <main className="flex h-screen flex-col items-center justify-center bg-neutral-200">
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8">
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </div>
    </div>
  </main>
);

export default SignInPage;
