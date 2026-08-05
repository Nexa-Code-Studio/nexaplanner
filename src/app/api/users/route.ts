import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { user, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse) {
    return errorResponse;
  }

  return NextResponse.json({ success: true, data: user });
}
