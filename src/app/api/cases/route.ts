import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/config";

const casesQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  companyId: z.string().optional(),
  page: z.string().optional().transform((v) => parseInt(v ?? "1")),
  limit: z.string().optional().transform((v) => Math.min(parseInt(v ?? String(DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE)),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.string().optional().default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const { search, status, companyId, page, limit, sortBy, sortOrder } = casesQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { name: { contains: search } } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (companyId) {
      where.companyId = companyId;
    }

    const [cases, total] = await Promise.all([
      prisma.caseStudy.findMany({
        where,
        include: { company: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.caseStudy.count({ where }),
    ]);

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Cases list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}