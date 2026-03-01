import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tag = req.nextUrl.searchParams.get("tag");

  const resources = await prisma.resource.findMany({
    where: tag ? { tags: { hasSome: [tag] } } : undefined,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      type: true,
      tags: true,
    },
  });

  return NextResponse.json(resources);
}
