import { NextResponse } from "next/server";
import { checkApiAccess } from "@/lib/api-auth";
import { CategoryService } from "@/services/category.service";
import { createCategorySchema, updateCategorySchema } from "@/lib/validations/category";

const service = new CategoryService();

export async function GET(request: Request) {
  const { errorResponse } = await checkApiAccess(request, "GET");
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const data = await service.getAllCategories();
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
    const result = createCategorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const id = await service.createCategory(result.data);
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
        { success: false, message: "Query parameter 'id' kategori wajib disertakan" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = updateCategorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await service.updateCategory(id, result.data);
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
        { success: false, message: "Query parameter 'id' kategori wajib disertakan" },
        { status: 400 }
      );
    }

    await service.deleteCategory(id);
    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
