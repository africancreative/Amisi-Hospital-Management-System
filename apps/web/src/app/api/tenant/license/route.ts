import { NextRequest, NextResponse } from "next/server";
import { getControlDb } from "@amisimedos/db/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }

  const db = getControlDb();
  const tenant = await db.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      status: true,
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      trialEndsAt: true,
      tier: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
  }

  return NextResponse.json(tenant);
}
