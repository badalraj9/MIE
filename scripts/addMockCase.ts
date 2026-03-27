import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMockCaseStudy() {
  const company = await prisma.company.findFirst({
    where: { name: "Byju's" },
  });

  if (!company) {
    console.error("Byju's company not found. Run seedData.ts first.");
    return;
  }

  console.log("Adding mock case study for Byju's...");

  const mockCaseStudy = await prisma.caseStudy.create({
    data: {
      companyId: company.id,
      title: "The Valuation Crisis at Byju's",
      hook: "In the span of a few years, Byju's went from India's most celebrated edtech decacorn to a cautionary tale of aggressive expansion and governance failures. The board must now decide: accept a punitive down round to survive, or pursue a risky restructuring plan.",
      background: "Founded by Byju Raveendran, the company revolutionized online learning in India. Fueled by pandemic-driven demand, Byju's acquired multiple companies globally, pushing its valuation past $22 billion. However, as schools reopened and funding dried up, cracks in the business model and accounting practices began to show.",
      situation: "Recent SEBI filings and news reports indicate significant financial strain. The company has delayed filing its audited financials, faces scrutiny over revenue recognition, and is grappling with high customer acquisition costs. A massive term loan B is in technical default, and key board members have resigned.",
      dilemma: "As the CFO, you are faced with a stark choice. The company needs immediate liquidity. You have a term sheet from a distressed asset fund offering a lifeline but at a 90% discount to the previous valuation, effectively wiping out early investors and heavily diluting founders. Alternatively, you can attempt to aggressively cut costs, sell off recently acquired assets like Epic and Great Learning, and negotiate directly with lenders, risking bankruptcy if you fail.",
      teachingNote: "This case illustrates the dangers of 'growth at all costs' and the importance of corporate governance. Students should analyze the trade-offs between dilution and survival, and critically evaluate the strategic logic of Byju's M&A spree.",
      exhibits: {
        create: [
          {
            title: "Valuation History ($ Billions)",
            chartType: "LINE",
            data: JSON.stringify([
              { name: "2018", value: 1.0 },
              { name: "2019", value: 5.5 },
              { name: "2020", value: 11.0 },
              { name: "2021", value: 18.0 },
              { name: "2022", value: 22.0 },
              { name: "2023", value: 5.1 },
              { name: "2024", value: 0.2 },
            ]),
          },
          {
            title: "Revenue vs Losses (Estimated INR Crores)",
            chartType: "BAR",
            data: JSON.stringify([
              { name: "FY20", value: -262, revenue: 2189 },
              { name: "FY21", value: -4588, revenue: 2280 },
              { name: "FY22", value: -8245, revenue: 5014 },
            ]),
          },
          {
             title: "Key Metrics",
             chartType: "TABLE",
             data: JSON.stringify([
               { name: "Customer Acquisition Cost (CAC)", value: "High (Estimated $500+)" },
               { name: "Lifetime Value (LTV)", value: "Declining due to low renewal rates" },
               { name: "Cash Burn Rate", value: "Estimated $40M/month (2022)" }
             ])
          }
        ],
      },
      questions: {
        create: [
          { question: "Was Byju's M&A strategy driven by strategic fit or valuation inflation?" },
          { question: "How did the lack of timely audited financial statements contribute to the crisis?" },
          { question: "If you were the CFO, which of the two primary options (down round vs. asset sale) would you choose and why?" },
        ],
      },
    },
  });

  console.log(`Successfully added mock case study with ID: ${mockCaseStudy.id}`);
}

addMockCaseStudy()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
