import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const { user, errorResponse } = await getAuthenticatedUser(request);
    if (errorResponse) {
      return errorResponse;
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    console.error("Critical failure in GET /api/users:", err);
    return NextResponse.json(
      { 
        success: false, 
        message: `Internal Server Error: ${err.message || err}`,
        stack: err.stack || null
      },
      { status: 500 }
    );
  }
}
