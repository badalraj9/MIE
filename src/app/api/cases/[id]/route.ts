import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const caseStudy = await prisma.caseStudy.findUnique({
      where: {
        id: resolvedParams.id,
      },
      include: {
        company: true,
        exhibits: true,
        questions: true,
      },
    });

    if (!caseStudy) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 });
  }
}
