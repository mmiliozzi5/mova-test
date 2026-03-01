import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("orgSlug");
  if (!slug) {
    return NextResponse.json({ error: "orgSlug is required" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { slug },
    include: { departments: { select: { id: true, name: true } } },
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json(org.departments);
}
