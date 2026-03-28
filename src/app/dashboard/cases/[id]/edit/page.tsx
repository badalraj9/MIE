import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CaseEditClient from "./case-edit-client";

export const dynamic = "force-dynamic";

export default async function CaseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseStudy = await prisma.caseStudy.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!caseStudy) notFound();

  return <CaseEditClient initialCase={caseStudy} />;
}
