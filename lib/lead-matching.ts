import { prisma } from "@/lib/prisma";
import type { Icp, Prisma } from "@/lib/generated/prisma/client";

type CompanyFilters = {
  id: string;
  name: string;
  industry: string | null;
  description: string | null;
  employeeCount: number | null;
  revenueMin: number | null;
  revenueMax: number | null;
  country: string | null;
  state: string | null;
  city: string | null;
  technologies: string[];
  keywords: string[];
  status: string;
};

type ContactFilters = {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
};

const normalize = (value: string) => value.trim().toLowerCase();

function matchesList(value: string | null, wanted: string[]): boolean {
  if (wanted.length === 0) return true;
  if (!value) return false;

  const haystack = normalize(value);
  return wanted.some((entry) => {
    const needle = normalize(entry);
    return needle.length > 0 && (haystack === needle || haystack.includes(needle));
  });
}

function intersectsList(values: string[], wanted: string[]): boolean {
  if (wanted.length === 0) return true;
  if (values.length === 0) return false;

  const haystack = values.map(normalize);
  return wanted.some((entry) => {
    const needle = normalize(entry);
    return needle.length > 0 && haystack.some((value) => value.includes(needle));
  });
}

function withinRange(value: number | null, min: number | null, max: number | null): boolean {
  if (min === null && max === null) return true;
  if (value === null) return false;

  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

/**
 * Builds a Prisma `where` clause for an ICP. Exclusions are enforced here so
 * they can never be reached by any caller, including AI-derived filters.
 */
export function buildIcpWhere(icp: Icp): Prisma.CompanyWhereInput {
  const AND: Prisma.CompanyWhereInput[] = [];

  AND.push({ status: { not: "ARCHIVED" } });

  if (icp.industries.length > 0) {
    AND.push({ industry: { in: icp.industries } });
  }

  if (icp.countries.length > 0) {
    AND.push({ country: { in: icp.countries } });
  }

  if (icp.states.length > 0) {
    AND.push({ state: { in: icp.states } });
  }

  if (icp.cities.length > 0) {
    AND.push({ city: { in: icp.cities } });
  }

  if (icp.technologies.length > 0) {
    AND.push({ technologies: { hasSome: icp.technologies } });
  }

  if (icp.keywords.length > 0) {
    AND.push({ keywords: { hasSome: icp.keywords } });
  }

  if (icp.sizeMin !== null || icp.sizeMax !== null) {
    AND.push({
      employeeCount: {
        ...(icp.sizeMin !== null ? { gte: icp.sizeMin } : {}),
        ...(icp.sizeMax !== null ? { lte: icp.sizeMax } : {}),
      },
    });
  }

  if (icp.exclusions.length > 0) {
    AND.push({
      AND: icp.exclusions.map((term) => ({
        NOT: {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { industry: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { country: { contains: term, mode: "insensitive" } },
          ],
        },
      })),
    });
  }

  return { AND };
}

/**
 * Scores one company against one ICP and reports which criteria carried it.
 */
export function scoreCompany(
  icp: Icp,
  company: CompanyFilters,
  contact: ContactFilters | null
): { score: number; matched: boolean; matchedCriteria: string[] } {
  const matchedCriteria: string[] = [];

  const industryOk = matchesList(company.industry, icp.industries);
  const countryOk = matchesList(company.country, icp.countries);
  const stateOk = matchesList(company.state, icp.states);
  const cityOk = matchesList(company.city, icp.cities);
  const techOk = intersectsList(company.technologies, icp.technologies);
  const keywordOk = intersectsList(company.keywords, icp.keywords);
  const titleOk = icp.jobTitles.length === 0 || matchesList(contact?.jobTitle ?? null, icp.jobTitles);
  const sizeOk = withinRange(company.employeeCount, icp.sizeMin, icp.sizeMax);
  const revenueOk =
    icp.revenueMin === null && icp.revenueMax === null
      ? true
      : withinRange(
          company.revenueMin ?? company.revenueMax,
            icp.revenueMin === null ? null : Number(icp.revenueMin),
            icp.revenueMax === null ? null : Number(icp.revenueMax)
        );

  // Hard criteria (explicitly configured) must pass for the lead to match.
  const hasHardCriteria =
    icp.industries.length > 0 ||
    icp.countries.length > 0 ||
    icp.states.length > 0 ||
    icp.cities.length > 0 ||
    icp.jobTitles.length > 0 ||
    icp.technologies.length > 0 ||
    icp.sizeMin !== null ||
    icp.sizeMax !== null ||
    icp.revenueMin !== null ||
    icp.revenueMax !== null;

  if (industryOk) matchedCriteria.push("industry");
  if (countryOk) matchedCriteria.push("country");
  if (stateOk) matchedCriteria.push("location");
  if (cityOk) matchedCriteria.push("city");
  if (techOk) matchedCriteria.push("technology");
  if (keywordOk) matchedCriteria.push("keyword");
  if (titleOk && icp.jobTitles.length > 0) matchedCriteria.push("job title");
  if (sizeOk) matchedCriteria.push("company size");
  if (revenueOk) matchedCriteria.push("revenue");

  const exclusionsHit = icp.exclusions.some((term) => {
    const needle = normalize(term);
    return (
      normalize(company.name).includes(needle) ||
      normalize(company.industry ?? "").includes(needle) ||
      normalize(company.description ?? "").includes(needle)
    );
  });

  const allHardPass =
    (icp.industries.length === 0 || industryOk) &&
    (icp.countries.length === 0 || countryOk) &&
    (icp.states.length === 0 || stateOk) &&
    (icp.cities.length === 0 || cityOk) &&
    (icp.jobTitles.length === 0 || titleOk) &&
    (icp.technologies.length === 0 || techOk) &&
    sizeOk &&
    revenueOk;

  const matched = allHardPass && !exclusionsHit;

  // Weighted blend: firmographics dominate, contact fit refines.
  let score = 0;
  if (icp.industries.length > 0) score += industryOk ? 22 : 0;
  if (icp.countries.length > 0) score += countryOk ? 12 : 0;
  if (icp.states.length > 0) score += stateOk ? 8 : 0;
  if (icp.cities.length > 0) score += cityOk ? 5 : 0;
  if (icp.technologies.length > 0) score += techOk ? 16 : 0;
  if (icp.keywords.length > 0) score += keywordOk ? 10 : 0;
  if (icp.jobTitles.length > 0) score += titleOk ? 14 : 0;
  if (icp.sizeMin !== null || icp.sizeMax !== null) score += sizeOk ? 8 : 0;
  if (icp.revenueMin !== null || icp.revenueMax !== null) score += revenueOk ? 5 : 0;

  if (!hasHardCriteria) {
    // An ICP with no configured filters scores on data completeness instead.
    const completeness = [
      company.industry,
      company.country,
      company.employeeCount !== null ? "x" : null,
      contact?.jobTitle,
    ].filter(Boolean).length;
    score = Math.round((completeness / 4) * 60) + (company.status === "AVAILABLE" ? 15 : 0);
  } else if (matched) {
    // Reward leads that satisfy every configured dimension.
    score = Math.min(100, score + 10);
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), matched, matchedCriteria };
}

/**
 * Runs an ICP across the lead database, persisting matches and scores.
 *
 * Returns the matched companies, newest match first.
 */
export async function runIcpMatch(
  icp: Icp,
  options: { take?: number; persist?: boolean } = {}
): Promise<{ total: number; matched: number }> {
  const take = options.take ?? 500;
  const persist = options.persist ?? true;

  const companies = await prisma.company.findMany({
    where: buildIcpWhere(icp),
    include: { contacts: { take: 5 }, leads: { take: 1 } },
    take,
    orderBy: { createdAt: "desc" },
  });

  const rows = companies.map((company) => {
    const primaryContact = company.contacts[0] ?? null;

    const result = scoreCompany(
      icp,
      {
        id: company.id,
        name: company.name,
        industry: company.industry,
        description: company.description,
        employeeCount: company.employeeCount,
        revenueMin: company.revenueMin ? Number(company.revenueMin) : null,
        revenueMax: company.revenueMax ? Number(company.revenueMax) : null,
        country: company.country,
        state: company.state,
        city: company.city,
        technologies: company.technologies,
        keywords: company.keywords,
        status: company.status,
      },
      primaryContact
        ? {
            id: primaryContact.id,
            firstName: primaryContact.firstName,
            lastName: primaryContact.lastName,
            jobTitle: primaryContact.jobTitle,
          }
        : null
    );

    return { company, contact: primaryContact, leadId: company.leads[0]?.id ?? null, result };
  });

  const matchedRows = rows.filter((row) => row.result.matched);

  if (persist && matchedRows.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const row of matchedRows) {
        // Every matched company needs a Lead row to hang matches/scores on.
        let leadId = row.leadId;

        if (!leadId) {
          const created = await tx.lead.create({
            data: {
              companyId: row.company.id,
              contactId: row.contact?.id ?? null,
              availability: "PREVIEW",
            },
          });
          leadId = created.id;
        }

        await tx.leadMatch.upsert({
          where: { leadId_icpId: { leadId, icpId: icp.id } },
          create: {
            leadId,
            icpId: icp.id,
            matched: true,
            criteria: { matchedCriteria: row.result.matchedCriteria },
          },
          update: {
            matched: true,
            criteria: { matchedCriteria: row.result.matchedCriteria },
          },
        });

        await tx.leadScore.upsert({
          where: { leadId_icpId: { leadId, icpId: icp.id } },
          create: {
            leadId,
            icpId: icp.id,
            score: row.result.score,
            icpMatchScore: row.result.score,
            breakdown: { matchedCriteria: row.result.matchedCriteria },
          },
          update: {
            score: row.result.score,
            icpMatchScore: row.result.score,
            breakdown: { matchedCriteria: row.result.matchedCriteria },
          },
        });
      }
    });
  }

  await prisma.icp.update({
    where: { id: icp.id },
    data: { lastMatchedAt: new Date(), matchCount: { increment: matchedRows.length } },
  });

  return { total: rows.length, matched: matchedRows.length };
}