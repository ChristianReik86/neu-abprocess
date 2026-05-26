import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, organizationName } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "E-Mail bereits registriert" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let slug = slugify(organizationName);

    const slugExists = await prisma.organization.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${Date.now()}`;

    const org = await prisma.organization.create({
      data: {
        name: organizationName,
        slug,
        subscription: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
            documentsLimit: 10,
          },
        },
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organizationId: org.id,
        role: "OWNER",
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validierungsfehler" }, { status: 400 });
    }
    return NextResponse.json({ error: "Registrierung fehlgeschlagen" }, { status: 500 });
  }
}
