import { prisma } from "../src/lib/prisma";

export async function scrapeAndStoreByjusData() {
  console.log("Starting Data Acquisition for Byju's...");

  // Upsert the Company
  const company = await prisma.company.upsert({
    where: { name: "Byju's" },
    update: {},
    create: {
      name: "Byju's",
      description: "Indian multinational educational technology company.",
    },
  });

  // Mocking the ingestion of real news articles, SEBI filings, and earnings reports
  // In a production environment, this would call WebScrapingAPI and parse NSE/News portals.
  const rawEvents = [
    {
      title: "Byju's acquires Aakash Educational Services for $1 Billion",
      date: new Date("2021-04-05"),
      type: "NEWS",
      content: "Byju's has acquired Aakash Educational Services Ltd (AESL) for nearly $1 billion. This is one of the largest acquisitions in the Indian edtech space. The cash-and-stock deal will see Aakash founders and Blackstone group receive minority stakes in Byju's. This move signals a massive shift from purely online to a hybrid (omnichannel) learning model, aiming to capture the lucrative test-prep market.",
      sourceUrl: "https://example-news.com/byjus-acquires-aakash",
      teachabilityScore: 9, // Highly significant decision point
    },
    {
      title: "Byju's Raises $460 Million in Series F at $13B Valuation",
      date: new Date("2021-03-29"),
      type: "FILING",
      content: "Byju's raised $460 million in an ongoing Series F round led by MC Global Edtech Investment Holdings. The company's valuation has surged past $13 billion, making it India's most valuable startup. The massive capital influx is largely earmarked for aggressive inorganic growth (acquisitions) in the US and Indian markets.",
      sourceUrl: "https://example-filings.com/mca-byjus-series-f",
      teachabilityScore: 7,
    },
    {
      title: "FY21 Financials Filed (Delayed): Losses widen 19x to Rs 4,588 Crore",
      date: new Date("2022-09-14"), // Representing the infamous delayed filing
      type: "EARNINGS",
      content: "After a severe 18-month delay, Byju's parent company Think & Learn reported its FY21 financials. Revenue from operations dropped to Rs 2,280 crore, while losses skyrocketed 19x to Rs 4,588 crore. The auditor, Deloitte, noted significant changes in revenue recognition, forcing the company to defer a large chunk of its subscription revenue to future years. Customer acquisition costs have nearly tripled.",
      sourceUrl: "https://example-filings.com/mca-byjus-fy21",
      teachabilityScore: 10, // A massive measurable consequence, triggering a crisis case
    },
    {
      title: "Board members from Peak XV, Prosus, and CZI resign simultaneously",
      date: new Date("2023-06-22"),
      type: "SEBI", // Grouping under regulatory/board governance
      content: "In an unprecedented move, representatives from three of Byju's largest early investors—Peak XV Partners (formerly Sequoia India), Prosus, and the Chan Zuckerberg Initiative—stepped down from the board. This followed the resignation of statutory auditor Deloitte, citing 'long-delayed' financial statements. The governance crisis has hit a tipping point.",
      sourceUrl: "https://example-regulatory.com/byjus-board-resignations",
      teachabilityScore: 9, // Conflicting pressures and governance dilemma
    }
  ];

  console.log(`Ingesting ${rawEvents.length} events into the Vector DB (Mocked via Relational DB for MVP) and Postgres...`);

  let count = 0;
  for (const rawEvent of rawEvents) {
    // Check if event already exists by title
    const existing = await prisma.event.findFirst({
      where: { title: rawEvent.title, companyId: company.id }
    });

    if (!existing) {
      await prisma.event.create({
        data: {
          ...rawEvent,
          companyId: company.id
        }
      });
      count++;
    }
  }

  console.log(`Successfully ingested ${count} new events for ${company.name}.`);
}

scrapeAndStoreByjusData()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
