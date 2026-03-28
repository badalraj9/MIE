import * as cheerio from "cheerio";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { prisma } from "../src/lib/prisma";
import dotenv from "dotenv";
dotenv.config();

// ─── Config (from env) ───────────────────────────────────────────────────────

const WEBSCRAPING_API_KEY  = process.env.WEBSCRAPING_API_KEY;
const SCRAPINGBEE_API_KEY  = process.env.SCRAPINGBEE_API_KEY;
const SCORING_MODEL        = process.env.SCORING_MODEL   ?? "gpt-4o-mini";
const DEFAULT_SCORE        = parseInt(process.env.DEFAULT_TEACHABILITY_SCORE ?? "5", 10);

// ─── API Clients ─────────────────────────────────────────────────────────────

async function fetchWithWebScrapingAPI(url: string): Promise<string> {
  if (!WEBSCRAPING_API_KEY) throw new Error("WEBSCRAPING_API_KEY not set");
  const res = await fetch(
    `https://api.webscrapingapi.com/v1/?api_key=${WEBSCRAPING_API_KEY}&url=${encodeURIComponent(url)}&render_js=0`
  );
  if (!res.ok) throw new Error(`WebScrapingAPI failed: ${res.status}`);
  return res.text();
}

async function fetchWithScrapingBee(url: string): Promise<string> {
  if (!SCRAPINGBEE_API_KEY) throw new Error("SCRAPINGBEE_API_KEY not set");
  const res = await fetch(
    `https://app.scrapingbee.com/api/v1/?api_key=${SCRAPINGBEE_API_KEY}&url=${encodeURIComponent(url)}&render_js=true`
  );
  if (!res.ok) throw new Error(`ScrapingBee failed: ${res.status}`);
  return res.text();
}

async function fetchWithFallback(url: string, forceJs = false): Promise<string> {
  if (!forceJs && WEBSCRAPING_API_KEY) {
    try { return await fetchWithWebScrapingAPI(url); }
    catch (e) { console.warn(`  WebScrapingAPI failed, trying ScrapingBee...`, e); }
  }
  if (SCRAPINGBEE_API_KEY) return await fetchWithScrapingBee(url);
  throw new Error("No scraping API keys configured. Add WEBSCRAPING_API_KEY or SCRAPINGBEE_API_KEY to .env");
}

// ─── Date Extraction ──────────────────────────────────────────────────────────

function extractDate($: ReturnType<typeof cheerio.load>): Date {
  const candidates = [
    $('meta[property="article:published_time"]').attr("content"),
    $('meta[name="publishdate"]').attr("content"),
    $('meta[name="date"]').attr("content"),
    $('time[datetime]').first().attr("datetime"),
    $('[itemprop="datePublished"]').attr("content") ?? $('[itemprop="datePublished"]').attr("datetime"),
  ];
  for (const c of candidates) {
    if (c) { const d = new Date(c); if (!isNaN(d.getTime())) return d; }
  }
  return new Date();
}

// ─── Site-specific Parsers ────────────────────────────────────────────────────

interface ParsedArticle {
  title: string;
  content: string;
  date: Date;
  type: "NEWS" | "FILING" | "SEBI" | "EARNINGS";
}

function parseSebi(html: string): ParsedArticle | null {
  const $ = cheerio.load(html);
  const title = $(".orderContent h2, .circularContent h2, h1.page-title, .panel-title").first().text().trim();
  const content = $(".orderContent, .circularContent, .panel-body, article").text().trim().substring(0, 3000);
  if (!title) return null;
  return { title, content: content || title, date: extractDate($), type: "SEBI" };
}

function parseNse(html: string): ParsedArticle | null {
  const $ = cheerio.load(html);
  const title = $("h1.page-heading, .announcementList h3, .disclosureHeader").first().text().trim();
  const content = $(".announcementContent, .disclosureBody, .content-area").text().trim().substring(0, 3000);
  if (!title) return null;
  return { title, content: content || title, date: extractDate($), type: "FILING" };
}

function parseNewsArticle(html: string): ParsedArticle | null {
  const $ = cheerio.load(html);

  // Try LD+JSON structured data first
  const ldJson = $('script[type="application/ld+json"]').text();
  if (ldJson) {
    try {
      const data = JSON.parse(ldJson);
      const article = Array.isArray(data)
        ? data.find((d: { "@type": string }) => d["@type"] === "NewsArticle" || d["@type"] === "Article")
        : data;
      if (article?.headline) {
        return {
          title: article.headline,
          content: (article.articleBody || article.description || "").substring(0, 3000),
          date: article.datePublished ? new Date(article.datePublished) : extractDate($),
          type: "NEWS",
        };
      }
    } catch { /* fall through */ }
  }

  const title = $("h1").first().text().trim()
    || $('meta[property="og:title"]').attr("content")?.trim() || "";
  if (!title) return null;

  const content = (
    $("article").text() ||
    $(".article-body, .story-body, .post-content, .entry-content").text() ||
    $("main").text()
  ).trim().substring(0, 3000);

  return { title, content: content || title, date: extractDate($), type: "NEWS" };
}

function parsePage(html: string, url: string): ParsedArticle | null {
  if (url.includes("sebi.gov.in")) return parseSebi(html);
  if (url.includes("nseindia.com") || url.includes("bseindia.com")) return parseNse(html);
  return parseNewsArticle(html);
}

// ─── AI Teachability Scoring ──────────────────────────────────────────────────

const teachabilitySchema = z.object({
  score: z.number().min(1).max(10),
  reason: z.string(),
});

async function scoreTeachability(
  title: string,
  content: string,
  companyName: string
): Promise<{ score: number; reason: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return { score: DEFAULT_SCORE, reason: `Default score — add OPENAI_API_KEY for AI scoring` };
  }
  try {
    const { object } = await generateObject({
      model: openai(SCORING_MODEL),
      schema: teachabilitySchema,
      prompt: `You are a Wharton professor. Rate how teachable this event is for an MBA business case (1–10).

Company: ${companyName}
Title: ${title}
Content: ${content.substring(0, 800)}

Scoring guide:
- 1–3: Routine news, no strategic insight
- 4–6: Interesting but limited case value
- 7–8: Clear ethical, strategic, or financial dilemma worth teaching
- 9–10: Landmark moment — governance crisis, bankruptcy, pivot, regulatory clash`,
    });
    return { score: object.score, reason: object.reason };
  } catch (e) {
    console.warn("  Scoring failed, using default:", e);
    return { score: DEFAULT_SCORE, reason: "Scoring failed — check API key" };
  }
}

// ─── Main ingestion function ──────────────────────────────────────────────────

export async function scrapeAndStoreCompanyData(
  companyId: string,
  companyName: string,
  urls: string[],
  options: { forceJs?: boolean } = {}
) {
  console.log(`\n📡 ${companyName} — ${urls.length} URL(s)`);
  let ingested = 0;
  let skipped = 0;

  for (const url of urls) {
    try {
      // Skip if already in DB (URL-level dedup)
      const existing = await prisma.event.findFirst({
        where: { companyId, sourceUrl: url },
      });
      if (existing) { skipped++; continue; }

      console.log(`  🌐 ${url}`);
      const html = await fetchWithFallback(url, options.forceJs);
      const parsed = parsePage(html, url);
      if (!parsed) { console.warn(`  ⚠ Could not parse: ${url}`); continue; }

      console.log(`  📝 Scoring: "${parsed.title.substring(0, 60)}"`);
      const { score, reason } = await scoreTeachability(parsed.title, parsed.content, companyName);
      console.log(`  ✅ Score ${score}/10 — ${reason}`);

      await prisma.event.create({
        data: {
          companyId,
          title: parsed.title,
          date: parsed.date,
          content: parsed.content,
          sourceUrl: url,
          type: parsed.type,
          teachabilityScore: score,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...({ teachabilityReason: reason } as any),
        },
      });
      ingested++;
    } catch (err) {
      console.error(`  ❌ Failed: ${url}`, err);
    }
  }

  console.log(`  ${ingested} ingested, ${skipped} already existed`);
  return { ingested, skipped };
}

// ─── Main: read companies from DB ────────────────────────────────────────────

async function main() {
  console.log("🚀 MIE Data Acquisition Pipeline\n");

  const companies = await prisma.company.findMany();

  if (companies.length === 0) {
    console.log("No companies in database. Add companies via /dashboard/companies/new first.");
    return;
  }

  let totalIngested = 0;
  let totalSkipped = 0;

  for (const company of companies) {
    const urls: string[] = company.scrapeUrls
      ? JSON.parse(company.scrapeUrls as string)
      : [];

    if (urls.length === 0) {
      console.log(`⏭  ${company.name} — no scrape URLs configured. Add via Dashboard.`);
      continue;
    }

    const { ingested, skipped } = await scrapeAndStoreCompanyData(company.id, company.name, urls);
    totalIngested += ingested;
    totalSkipped += skipped;
  }

  console.log(`\n🏁 Done — ${totalIngested} new events, ${totalSkipped} already existed.`);
  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });