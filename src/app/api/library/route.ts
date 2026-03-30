import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.researchItem.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, content, type } = body;

    const item = await prisma.researchItem.create({
      data: {
        topic,
        content,
        type: type || "Analysis",
      },
    });

    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
