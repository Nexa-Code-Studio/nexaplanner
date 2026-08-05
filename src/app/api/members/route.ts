import { NextResponse } from "next/server";
import { checkApiAccess } from "@/lib/api-auth";
import { MemberService } from "@/services/member.service";
import { createMemberSchema, updateMemberSchema } from "@/lib/validations/member";

const service = new MemberService();

export async function GET(request: Request) {
  const { errorResponse } = await checkApiAccess(request, "GET");
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const data = await service.getAllMembers();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await checkApiAccess(request, "POST");
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const result = createMemberSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const id = await service.addMember(result.data as any);
    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { errorResponse } = await checkApiAccess(request, "PUT");
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id"); // The member's UID
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Query parameter 'id' anggota wajib disertakan" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = updateMemberSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await service.updateMember(id, result.data);
    return NextResponse.json({ success: true, data: { id } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, errorResponse } = await checkApiAccess(request, "DELETE");
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Query parameter 'id' anggota wajib disertakan" },
        { status: 400 }
      );
    }

    // Prevent deleting yourself
    if (user && id === user.uid) {
      return NextResponse.json(
        { success: false, message: "Anda tidak diperbolehkan menghapus akun Anda sendiri" },
        { status: 400 }
      );
    }

    await service.removeMember(id);
    return NextResponse.json({ success: true, message: "Anggota berhasil dihapus dari whitelist" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
