import { getAuth, withClerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/api/trpc*"];

const isPublic = (path: string) => {
  return publicPaths.find((publicPath) =>
    path.match(new RegExp(`^${publicPath}$`.replace("*$", "($|/)")))
  );
};

export default withClerkMiddleware((req) => {
  if (!isPublic(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const { userId } = getAuth(req);

  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

// Stop Middleware running on static files
export const config = {
  matcher: "/((?!_next/image|_next/static|favicon.ico).*)",
};
