import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // TODO: 인증 로직 연결 시 활성화
  // const isAuthenticated = Boolean(request.cookies.get("fts_access_token")?.value);
  // if (!isAuthenticated && request.nextUrl.pathname.startsWith("/franchise")) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/franchise/:path*"],
};
