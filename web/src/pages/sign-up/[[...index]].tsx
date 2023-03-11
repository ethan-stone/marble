import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <main className="flex h-screen flex-col items-center justify-center bg-neutral-200">
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      </div>
    </div>
  </main>
);

export default SignUpPage;
