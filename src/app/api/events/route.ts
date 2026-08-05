import { NextResponse } from "next/server";
import { checkApiAccess } from "@/lib/api-auth";
import { EventService } from "@/services/event.service";
import { createEventSchema, updateEventSchema } from "@/lib/validations/event";

const service = new EventService();

export async function GET(request: Request) {
  const { errorResponse } = await checkApiAccess(request, "GET");
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const data = await service.getAllEvents();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, errorResponse } = await checkApiAccess(request, "POST");
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const result = createEventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Automatically set createdBy to the logged in user's uid
    const id = await service.createEvent({
      ...result.data,
      createdBy: user!.uid,
    } as any);

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
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Query parameter 'id' event wajib disertakan" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = updateEventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await service.updateEvent(id, result.data);
    return NextResponse.json({ success: true, data: { id } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { errorResponse } = await checkApiAccess(request, "DELETE");
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Query parameter 'id' event wajib disertakan" },
        { status: 400 }
      );
    }

    await service.deleteEvent(id);
    return NextResponse.json({ success: true, message: "Event berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
