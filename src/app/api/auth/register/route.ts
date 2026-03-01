import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  orgSlug: z.string().min(2).max(50),
  departmentId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const org = await prisma.organization.findUnique({
      where: { slug: data.orgSlug },
    });
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found. Check your organization code." },
        { status: 404 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (data.departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: data.departmentId, organizationId: org.id },
      });
      if (!dept) {
        return NextResponse.json(
          { error: "Invalid department." },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        hashedPassword,
        organizationId: org.id,
        departmentId: data.departmentId ?? null,
        role: "EMPLOYEE",
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    console.error("[register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
