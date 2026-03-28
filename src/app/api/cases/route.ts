import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    
    const cases = await prisma.caseStudy.findMany({
      include: {
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    await prisma.$disconnect();
    return NextResponse.json(cases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}
